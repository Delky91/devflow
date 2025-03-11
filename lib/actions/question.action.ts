"use server";

import mongoose from "mongoose";

import { Question } from "@/database/question.model";
import { TagQuestion } from "@/database/tag-question.model";
import { ITagDoc, Tag } from "@/database/tag.model";

import action from "../handlers/action";
import handleError from "../handlers/error";
import { NotFoundError, UnauthorizedError } from "../http-errors";
import { AskQuestionSchema, EditQuestionSchema, GetQuestionSchema } from "../validations";

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
export async function editQuestion(params: EditQuestionParams): Promise<ActionResponse<Question>> {
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
         throw new NotFoundError("Question not found");
      }

      if (question.author.toString() !== userId) {
         throw new UnauthorizedError("You are not authorized to edit this question");
      }

      if (question.title !== title || question.content !== content) {
         question.title = title;
         question.content = content;
         await question.save({ session });
      }

      const tagsToAdd = tags.filter((tag) => !question.tags.includes(tag.toLowerCase()));
      const tagsToRemove = question.tags.filter((tag: ITagDoc) => !tags.includes(tag.name.toLowerCase()));

      const newTagsDocs = [];

      // Add new tags to the question
      if (tagsToAdd.length > 0) {
         for (const tag of tagsToAdd) {
            const existingTag = await Tag.findOneAndUpdate(
               { name: { $regex: new RegExp(`^${tag}$`, "i") } },
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

         question.tags = question.tags.filter((tag: mongoose.Types.ObjectId) => !tagIdsToRemove.includes(tag));
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
      const question = await Question.findById(questionId).populate("tags");
      if (!question) {
         throw new NotFoundError("Question not found");
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
