import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { RequestError, ValidationError } from "../http-errors";

export type ReponseType = "api" | "server";

/**
 * Formats the response based on the specified response type.
 *
 * @param responseType - The type of response, either "api" or another type.
 * @param status - The HTTP status code to be returned.
 * @param message - The error message to be included in the response.
 * @param errors - Optional. Additional error details, represented as a record of string arrays.
 * @returns The formatted response object. If the response type is "api", it returns a JSON response.
 *          Otherwise, it returns an object with the status and error details.
 */
const formatReponse = (
   responseType: ReponseType,
   status: number,
   message: string,
   errors?: Record<string, string[]> | undefined
) => {
   const reponseContent = {
      succes: false,
      error: {
         message,
         details: errors,
      },
   };

   return responseType === "api"
      ? NextResponse.json(reponseContent, { status })
      : { status, ...reponseContent };
};

/**
 * Handles different types of errors and formats a response accordingly.
 *
 * @param error - The error object to handle. It can be of type `RequestError`, `ZodError`, or a generic `Error`.
 * @param responseType - The type of response to format. Defaults to "server".
 * @returns The formatted response based on the error type.
 */
const handleError = (error: unknown, responseType: ReponseType = "server") => {
   if (error instanceof RequestError) {
      return formatReponse(
         responseType,
         error.statusCode,
         error.message,
         error.errors
      );
   }

   if (error instanceof ZodError) {
      const validationErrors = new ValidationError(
         error.flatten().fieldErrors as Record<string, string[]>
      );

      return formatReponse(
         responseType,
         validationErrors.statusCode,
         validationErrors.message,
         validationErrors.errors
      );
   }

   if (error instanceof Error) {
      return formatReponse(responseType, 500, error.message);
   }

   return formatReponse(responseType, 500, "An unexpected error occurred.");
};

export default handleError;
