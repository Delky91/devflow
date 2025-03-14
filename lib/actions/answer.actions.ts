"use server";

import mongoose from "mongoose";
import { revalidatePath } from "next/cache";

import ROUTES from "@/constants/routes";
import { Question } from "@/database";
import { Answer, IAnswerDoc } from "@/database/answer.model";

import action from "../handlers/action";
import handleError from "../handlers/error";
import { CreateAnswerSchema } from "../validations";

export async function CreateAnswer(params: CreateAnswerParams): Promise<ActionResponse<IAnswerDoc>> {
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
