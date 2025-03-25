"use server";

import mongoose from "mongoose";
import { revalidatePath } from "next/cache";

import ROUTES from "@/constants/routes";
import { Question } from "@/database";
import { Answer, IAnswerDoc } from "@/database/answer.model";

import action from "../handlers/action";
import handleError from "../handlers/error";
import { CreateAnswerSchema, GetAnswerSchema } from "../validations";

/**
 * Creates a new answer for a given question.
 *
 * @param {CreateAnswerParams} params - The parameters required to create an answer.
 * @returns {Promise<ActionResponse<IAnswerDoc>>} - A promise that resolves to the action response containing the created answer document.
 *
 * The function performs the following steps:
 * 1. Validates the input parameters against the `CreateAnswerSchema`.
 * 2. If validation fails, returns an error response.
 * 3. Extracts the `questionId` and `content` from the validated parameters.
 * 4. Retrieves the `userId` from the session.
 * 5. Starts a MongoDB session for transaction management.
 * 6. Attempts to find the question by `questionId`.
 * 7. If the question is not found, returns an error response.
 * 8. Creates a new answer document with the provided content and author information.
 * 9. If the answer creation fails, returns an error response.
 * 10. Increments the answer count for the question and saves the question document.
 * 11. Revalidates the path for the question.
 * 12. Returns a success response with the created answer document.
 * 13. If any error occurs during the process, aborts the transaction and returns an error response.
 * 14. Ends the MongoDB session.
 */
export async function createAnswer(params: CreateAnswerParams): Promise<ActionResponse<IAnswerDoc>> {
   const validationResult = await action({
      params,
      schema: CreateAnswerSchema,
      isAuthorize: true,
   });

   if (validationResult instanceof Error) {
      return handleError(validationResult) as ErrorResponse;
   }

   const { questionId, content } = validationResult.params!;
   const userId = validationResult?.session?.user?.id as string;

   const session = await mongoose.startSession();

   try {
      const question = await Question.findById(questionId);
      if (!question) {
         return handleError(new Error("Question not found")) as ErrorResponse;
      }
      const [newAnswer] = await Answer.create(
         [
            {
               author: userId,
               question: questionId,
               content,
            },
         ],
         { session }
      );

      if (!newAnswer) {
         return handleError(new Error("Failed to create answer")) as ErrorResponse;
      }
      question.answers += 1;
      await question.save({ session });

      revalidatePath(ROUTES.QUESTION(questionId));

      return {
         success: true,
         data: JSON.parse(JSON.stringify(newAnswer)),
      };
   } catch (error) {
      session.abortTransaction();
      return handleError(error as Error) as ErrorResponse;
   } finally {
      session.endSession();
   }
}

/**
 * Fetches answers for a given question based on provided parameters.
 *
 * @param {GetAnswerParams} params - The parameters for fetching answers.
 * @returns {Promise<ActionResponse<{answers: Answer[]; isNext: boolean; totalAnswer: number; }>>} - A promise
 * that resolves to an ActionResponse containing the answers,
 * a flag indicating if there are more answers, and the total number of answers.
 *
 * The function performs the following steps:
 * 1. Validates the input parameters against the GetAnswerSchema.
 * 2. If validation fails, returns an error response.
 * 3. Extracts pagination and filter criteria from the validated parameters.
 * 4. Constructs the sorting criteria based on the filter.
 * 5. Fetches the total number of answers for the given question.
 * 6. Fetches the answers from the database, populating the author field.
 * 7. Determines if there are more answers to fetch.
 * 8. Returns the fetched answers, the isNext flag, and the total number of answers.
 *
 * @throws Will return an error response if any database operation fails.
 */
export async function getAnswers(params: GetAnswersParams): Promise<
   ActionResponse<{
      answers: Answer[];
      isNext: boolean;
      totalAnswer: number;
   }>
> {
   const validationResult = await action({
      params,
      schema: GetAnswerSchema,
   });

   if (validationResult instanceof Error) {
      return handleError(validationResult) as ErrorResponse;
   }

   const { questionId, page = 1, pageSize = 10, filter } = validationResult.params!;
   const skip = (Number(page) - 1) * pageSize;
   const limit = pageSize;

   let sortCriteria = {};

   switch (filter) {
      case "latest":
         sortCriteria = { createdAt: -1 };
         break;
      case "oldest":
         sortCriteria = { createdAt: 1 };
         break;
      case "popular":
         sortCriteria = { upvotes: -1 };
         break;
      default:
         sortCriteria = { createdAt: -1 };
         break;
   }

   try {
      const totalAnswers = await Answer.countDocuments({ question: questionId });
      const answers = await Answer.find({ question: questionId })
         .populate("author", "_id name image")
         .sort(sortCriteria)
         .skip(skip)
         .limit(limit);
      const isNext = totalAnswers > skip * answers.length;

      return {
         success: true,
         data: {
            answers: JSON.parse(JSON.stringify(answers)),
            isNext,
            totalAnswer: totalAnswers,
         },
      };
   } catch (error) {
      return handleError(error as Error) as ErrorResponse;
   }
}
