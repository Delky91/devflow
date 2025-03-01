"use server";

import { Session } from "next-auth";
import { ZodError, ZodSchema } from "zod";

import { auth } from "@/auth";
import { dbConnect } from "@/config/mongoose";
import { UnauthorizedError, ValidationError } from "@/lib/http-errors";

type ActionOptions<T> = {
   params?: T;
   schema?: ZodSchema<T>;
   isAuthorize?: boolean;
};

/**
 * Server function that handles secure actions with schema validation and authorization.
 *
 * This function executes server-side operations with the following features:
 * - Parameter validation using Zod schemas
 * - Authentication verification (optional)
 * - Automatic database connection
 *
 * @template T - The type of parameters to be validated with the schema
 *
 * @param {Object} options - Configuration options for the action
 * @param {T} [options.params] - The parameters to validate against the schema
 * @param {ZodSchema<T>} [options.schema] - The Zod schema for validating parameters
 * @param {boolean} [options.isAuthorize=true] - Indicates if the action requires authorization
 *
 * @returns {Promise<{params: T, session: Session | null} | Error>}
 *   - If successful: An object with validated parameters and user session
 *   - If failed: An error object (ValidationError or UnauthorizedError)
 *
 * @throws {ValidationError} If schema validation fails
 * @throws {UnauthorizedError} If authorization is required but user is not authenticated
 * @throws {Error} If any other error occurs during schema validation
 */
export default async function action<T>({
   params,
   schema,
   isAuthorize = true,
}: ActionOptions<T>) {
   if (schema && params) {
      try {
         schema.parse(params);
      } catch (error) {
         if (error instanceof ZodError) {
            return new ValidationError(
               error.flatten().fieldErrors as Record<string, string[]>
            );
         } else {
            return new Error("Schema validation failed");
         }
      }
   }

   let session: Session | null = null;
   if (isAuthorize) {
      session = await auth();

      if (!session) {
         return new UnauthorizedError();
      }
   }

   await dbConnect();

   return { params, session };
}
