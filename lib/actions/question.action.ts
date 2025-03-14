"use server";

import mongoose, { FilterQuery } from "mongoose";

import { IQuestionDoc, Question } from "@/database/question.model";
import { TagQuestion } from "@/database/tag-question.model";
import { ITagDoc, Tag } from "@/database/tag.model";

import action from "../handlers/action";
import handleError from "../handlers/error";
import { AskQuestionSchema, EditQuestionSchema, GetQuestionSchema, PaginatedSearchParamsSchema } from "../validations";

/*
   Information about server actions:
      1: In server components, they act like regulars async functions.
      2: In client components, When used in form actions or event handlers, they are invoked via a POST request.

   Direct Invocation: when you use a Server action in a server Compoennet,
   you're directly invoking the function on the server. there's no HTTP request
   involved cause the server component and the server action are on the same server.
*/

/**
 * Creates a new question with the provided parameters.
 *
 * @param {CreateQuestionParams} params - The parameters required to create a question.
 * @returns {Promise<ActionResponse>} - The response indicating the success or failure of the action.
 *
 * The function performs the following steps:
 * 1. Validates the input parameters against the `AskQuestionSchema`.
 * 2. If validation fails, returns an error response.
 * 3. Destructures the validated parameters and retrieves the user ID from the session.
 * 4. Initializes an atomic transaction using a MongoDB session.
 * 5. Attempts to create a new question document in the database.
 * 6. For each tag in the input parameters, either finds an existing tag or creates a new one, and associates it with the question.
 * 7. Commits the transaction if all operations succeed.
 * 8. If any operation fails, aborts the transaction and returns an error response.
 * 9. Ends the MongoDB session.
 *
 * @throws {Error} - Throws an error if the question creation fails.
 */
export async function createQuestion(params: CreateQuestionParams): Promise<ActionResponse<Question>> {
   // validate params
   const validationResult = await action({
      params,
      schema: AskQuestionSchema,
      isAuthorize: true,
   });
   console.log("validationResult", validationResult);

   if (validationResult instanceof Error) {
      return handleError(validationResult) as ErrorResponse;
   }

   // destructure params and session so we can create a question
   const { title, content, tags } = validationResult.params!;
   const userId = validationResult?.session?.user?.id;

   // initialize atomic transaction
   const session = await mongoose.startSession();
   session.startTransaction();

   try {
      const [question] = await Question.create([{ title, content, author: userId }], { session });

      if (!question) {
         throw new Error("Failed to create question");
      }

      const tagIds: mongoose.Types.ObjectId[] = [];
      const tagQuestionDocuments = [];

      for (const tag of tags) {
         const existingTag = await Tag.findOneAndUpdate(
            { name: { $regex: new RegExp(`^${tag}$`, "i") } },
            { $setOnInsert: { name: tag }, $inc: { questions: 1 } },
            { session, upsert: true, new: true }
         );
         tagIds.push(existingTag._id);
         tagQuestionDocuments.push({ question: question._id, tag: existingTag._id });
      }
      await TagQuestion.insertMany(tagQuestionDocuments, { session });
      await Question.findByIdAndUpdate(question._id, { $push: { tags: { $each: tagIds } } }, { session });

      await session.commitTransaction();

      return {
         success: true,
         status: 201,
         data: JSON.parse(JSON.stringify(question)),
      };
   } catch (error) {
      await session.abortTransaction();
      return handleError(error) as ErrorResponse;
   } finally {
      session.endSession();
   }
}

/**
 * Edits an existing question based on the provided parameters.
 *
 * @param {EditQuestionParams} params - The parameters required to edit the question.
 * @returns {Promise<ActionResponse<Question>>} - A promise that resolves to the action response containing the edited question.
 *
 * The function performs the following steps:
 * 1. Validates the input parameters against the `EditQuestionSchema`.
 * 2. Checks if the question exists and if the user is authorized to edit it.
 * 3. Updates the question's title and content if they have changed.
 * 4. Adds new tags to the question and removes old tags that are no longer associated with it.
 * 5. Saves the changes to the database within a transaction.
 * 6. Handles any errors that occur during the process.
 *
 * @throws {NotFoundError} If the question is not found.
 * @throws {UnauthorizedError} If the user is not authorized to edit the question.
 */
export async function editQuestion(params: EditQuestionParams): Promise<ActionResponse<IQuestionDoc>> {
   const validationResult = await action({
      params,
      schema: EditQuestionSchema,
      isAuthorize: true,
   });
   if (validationResult instanceof Error) {
      return handleError(validationResult) as ErrorResponse;
   }

   const { title, content, tags, questionId } = validationResult.params!;
   const userId = validationResult?.session?.user?.id;

   const session = await mongoose.startSession();
   session.startTransaction();
   try {
      const question = await Question.findById(questionId).populate("tags");
      if (!question) {
         throw new Error("Question not found");
      }

      if (question.author.toString() !== userId) {
         throw new Error("You are not authorized to edit this question");
      }

      if (question.title !== title || question.content !== content) {
         question.title = title;
         question.content = content;
         await question.save({ session });
      }

      const tagsToAdd = tags.filter(
         (tag) => !question.tags.some((t: ITagDoc) => t.name.toLowerCase().includes(tag.toLowerCase()))
      );
      const tagsToRemove = question.tags.filter(
         (tag: ITagDoc) => !tags.some((t) => t.toLowerCase() === tag.name.toLowerCase())
      );

      const newTagsDocs = [];

      // Add new tags to the question
      if (tagsToAdd.length > 0) {
         for (const tag of tagsToAdd) {
            const existingTag = await Tag.findOneAndUpdate(
               { name: { $regex: `^${tag}$`, $options: "i" } },
               { $setOnInsert: { name: tag }, $inc: { questions: 1 } },
               { session, upsert: true, new: true }
            );

            if (existingTag) {
               newTagsDocs.push({
                  tag: existingTag._id,
                  question: questionId,
               });

               question.tags.push(existingTag._id);
            }
         }
      }

      // Remove old tags from the question
      if (tagsToRemove.length > 0) {
         const tagIdsToRemove = tagsToRemove.map((tag: ITagDoc) => tag._id);
         await Tag.updateMany({ _id: { $in: tagIdsToRemove } }, { $inc: { questions: -1 } }, { session });
         await TagQuestion.deleteMany({ question: questionId, tag: { $in: tagIdsToRemove } }, { session });

         question.tags = question.tags.filter(
            (tag: mongoose.Types.ObjectId) => !tagIdsToRemove.some((id: mongoose.Types.ObjectId) => id.equals(tag._id))
         );
      }

      if (newTagsDocs.length > 0) {
         await TagQuestion.insertMany(newTagsDocs, { session });
      }

      await question.save({ session });
      await session.commitTransaction();

      return {
         success: true,
         status: 200,
         data: JSON.parse(JSON.stringify(question)),
      };
   } catch (error) {
      await session.abortTransaction();
      return handleError(error) as ErrorResponse;
   } finally {
      session.endSession();
   }
}

/**
 * Retrieves a question based on the provided parameters.
 *
 * @param params - The parameters required to get the question.
 * @returns A promise that resolves to an ActionResponse containing the question data,
 * or an ErrorResponse if an error occurs.
 *
 * @throws NotFoundError - If the question with the specified ID is not found.
 */
export async function getQuestion(params: GetQuestionParams): Promise<ActionResponse<Question>> {
   const validationResult = await action({
      params,
      schema: GetQuestionSchema,
      isAuthorize: true,
   });
   if (validationResult instanceof Error) {
      return handleError(validationResult) as ErrorResponse;
   }

   const { questionId } = validationResult.params!;

   try {
      const question = await Question.findById(questionId).populate("tags").populate("author", "_id name image");
      if (!question) {
         throw new Error("Question not found");
      }
      return {
         success: true,
         status: 200,
         data: JSON.parse(JSON.stringify(question)),
      };
   } catch (error) {
      return handleError(error) as ErrorResponse;
   }
}

/**
 * Retrieves a list of questions based on the provided pagination and filter parameters.
 *
 * @param {PaginatedSearchParams} params - The parameters for pagination and search.
 * @returns {Promise<ActionResponse<{ questions: Question[]; isNext: boolean }>>} - A promise that resolves to an action response containing the list of questions and a flag indicating if there are more questions.
 *
 * The function performs the following steps:
 * 1. Validates the input parameters using the provided schema.
 * 2. Extracts pagination and filter parameters from the validated input.
 * 3. Constructs a filter query based on the provided search query and filter type.
 * 4. Determines the sort criteria based on the filter type.
 * 5. Retrieves the total count of questions matching the filter query.
 * 6. Fetches the list of questions from the database, applying pagination, sorting, and population of related fields.
 * 7. Determines if there are more questions available beyond the current page.
 * 8. Returns the list of questions and the isNext flag in a successful action response.
 * 9. Handles and returns any errors that occur during the process.
 */
export async function getQuestions(
   params: PaginatedSearchParams
): Promise<ActionResponse<{ questions: Question[]; isNext: boolean }>> {
   const validationResult = await action({ params, schema: PaginatedSearchParamsSchema });
   if (validationResult instanceof Error) {
      return handleError(validationResult) as ErrorResponse;
   }

   const { page = 1, pageSize = 10, query, filter } = validationResult.params!;
   const skip = (Number(page) - 1) * pageSize;
   const limit = Number(pageSize);

   const filterQuery: FilterQuery<typeof Question> = {};

   if (filter === "recommended") {
      return { success: true, status: 200, data: { questions: [], isNext: false } };
   }

   if (query) {
      filterQuery.$or = [
         { title: { $regex: new RegExp(query, "i") } },
         { content: { $regex: new RegExp(query, "i") } },
      ];
   }

   let sortCriteria = {};

   switch (filter) {
      case "newest":
         sortCriteria = { createdAt: -1 };
         break;

      case "unanswered":
         filterQuery.answers = 0;
         sortCriteria = { createdAt: -1 };
         break;

      case "popular":
         sortCriteria = { upvoter: -1 };
         break;
      default:
         sortCriteria = { createdAt: -1 };
         break;
   }

   try {
      const totalQuestions = await Question.countDocuments(filterQuery);
      const questions = await Question.find(filterQuery)
         .populate("tags", "name")
         .populate("author", "name image")
         .lean()
         .sort(sortCriteria)
         .skip(skip)
         .limit(limit);

      const isNext = totalQuestions > skip + questions.length;

      return {
         success: true,
         status: 200,
         data: {
            questions: JSON.parse(JSON.stringify(questions)),
            isNext,
         },
      };
   } catch (error) {
      return handleError(error) as ErrorResponse;
   }
}
