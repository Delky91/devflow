"use server";

import mongoose from "mongoose";

import { Question } from "@/database/question.model";
import { TagQuestion } from "@/database/tag-question.model";
import { Tag } from "@/database/tag.model";
import { ActionResponse, ErrorResponse } from "@/types/global";

import action from "../handlers/action";
import handleError from "../handlers/error";
import { AskQuestionSchema } from "../validations";

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
export async function createQuestions(params: CreateQuestionParams): Promise<ActionResponse> {
   // validate params
   const validationResult = await action({
      params,
      schema: AskQuestionSchema,
      isAuthorize: true,
   });

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
