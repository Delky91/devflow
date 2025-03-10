import { NextResponse } from "next/server";

import { dbConnect } from "@/config/mongoose";
import { Account } from "@/database/account.model";
import handleError from "@/lib/handlers/error";
import { NotFoundError, ValidationError } from "@/lib/http-errors";
import { AccountSchema } from "@/lib/validations";

/**
 * Handles GET requests to retrieve an account by its ID.
 *
 * @param {Request} _ - The request object (not used).
 * @param {Object} context - The context object containing route parameters.
 * @param {Promise<{ id: string }>} context.params - A promise that resolves to an object containing the account ID.
 * @returns {Promise<NextResponse>} - A promise that resolves to a NextResponse object containing the account data or an error response.
 * @throws {NotFoundError} - Throws a NotFoundError if the account ID is not provided or if the account is not found.
 */
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
   const { id } = await params;
   if (!id) throw new NotFoundError("Account");

   try {
      await dbConnect();

      const account = await Account.findById(id);
      if (!account) throw new NotFoundError("Account");

      return NextResponse.json(
         {
            success: true,
            data: account,
         },
         {
            status: 200,
         }
      );
   } catch (error) {
      return handleError(error, "api") as APIErrorResponse;
   }
}

/**
 * Deletes an account by its ID.
 *
 * @param _ - The request object (not used).
 * @param params - An object containing the parameters, including the account ID.
 * @returns A JSON response indicating the success of the operation and the deleted account data.
 * @throws {NotFoundError} If the account ID is not provided or the account is not found.
 */
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
   const { id } = await params;
   if (!id) throw new NotFoundError("Account");

   try {
      await dbConnect();

      const account = await Account.findByIdAndDelete(id);
      if (!account) throw new NotFoundError("Account");

      return NextResponse.json(
         {
            success: true,
            data: account,
         },
         {
            status: 200,
         }
      );
   } catch (error) {
      return handleError(error, "api") as APIErrorResponse;
   }
}

/**
 * Handles the PUT request to update an account by its ID.
 *
 * @param {Request} request - The incoming request object.
 * @param {Object} context - The context object containing route parameters.
 * @param {Promise<{ id: string }>} context.params - A promise that resolves to an object containing the account ID.
 *
 * @returns {Promise<Response>} - A promise that resolves to a response object.
 *
 * @throws {NotFoundError} - If the account ID is not provided or the account is not found.
 * @throws {ValidationError} - If the request body fails validation.
 * @throws {Error} - If there is an error connecting to the database or updating the account.
 */
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
   const { id } = await params;
   if (!id) throw new NotFoundError("Account");

   try {
      await dbConnect();

      const body = await request.json();
      const validatedData = AccountSchema.partial().safeParse(body);
      if (!validatedData.success) {
         throw new ValidationError(validatedData.error.flatten().fieldErrors);
      }

      const updatedAccount = await Account.findByIdAndUpdate(id, validatedData, {
         new: true,
      });
      if (!updatedAccount) throw new NotFoundError("Account");

      return NextResponse.json(
         {
            success: true,
            data: updatedAccount,
         },
         {
            status: 200,
         }
      );
   } catch (error) {
      return handleError(error, "api") as APIErrorResponse;
   }
}
