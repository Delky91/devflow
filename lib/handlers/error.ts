import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { RequestError, ValidationError } from "../http-errors";
import { logger } from "../logger";

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
const formatResponse = (
   responseType: ReponseType,
   status: number,
   message: string,
   errors?: Record<string, string[]> | undefined
) => {
   const responseContent = {
      success: false,
      error: {
         message,
         details: errors,
      },
   };

   return responseType === "api"
      ? NextResponse.json(responseContent, { status })
      : { status, ...responseContent };
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
      logger.error(
         { err: error },
         `${responseType.toUpperCase()} Error: ${error.message}`
      );

      return formatResponse(
         responseType,
         error.statusCode,
         error.message,
         error.errors
      );
   }

   if (error instanceof ZodError) {
      const validationError = new ValidationError(
         error.flatten().fieldErrors as Record<string, string[]>
      );

      logger.error(
         { err: error },
         `Validation Error: ${validationError.message}`
      );

      return formatResponse(
         responseType,
         validationError.statusCode,
         validationError.message,
         validationError.errors
      );
   }

   if (error instanceof Error) {
      logger.error(error.message);

      return formatResponse(responseType, 500, error.message);
   }

   logger.error({ err: error }, "An unexpected error occurred");
   return formatResponse(responseType, 500, "An unexpected error occurred");
};

export default handleError;
