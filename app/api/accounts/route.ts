import { NextResponse } from "next/server";

import { dbConnect } from "@/config/mongoose";
import { Account } from "@/database/account.model";
import handleError from "@/lib/handlers/error";
import { ForbiddenError } from "@/lib/http-errors";
import { AccountSchema } from "@/lib/validations";
import { APIErrorResponse } from "@/types/global";

/**
 * Handles GET requests to fetch all Accounts.
 *
 * @returns {Promise<NextResponse>} A promise that resolves to a NextResponse object containing the list of accounts and a success status.
 * @throws {APIErrorResponse} If an error occurs during the database connection or user retrieval.
 */
export async function GET() {
   try {
      await dbConnect();
      const account = await Account.find();

      return NextResponse.json(
         {
            success: true,
            data: account,
         },
         { status: 200 }
      );
   } catch (error) {
      return handleError(error, "api") as APIErrorResponse;
   }
}

/**
 * Handles the POST request to create a new accounts.
 *
 * @param {Request} request - The incoming request object.
 * @returns {Promise<NextResponse>} The response object containing the result of the account creation.
 *
 * @throws {ValidationError} If the request body validation fails.
 * @throws {Error} If the account already exists.
 */
export async function POST(request: Request) {
   try {
      await dbConnect();

      // validate the request body
      const body = await request.json();
      const validatedData = AccountSchema.parse(body);

      const existingAccount = await Account.findOne({
         provider: validatedData.provider,
         providerAccountId: validatedData.providerAccountId,
      });
      if (existingAccount)
         throw new ForbiddenError(
            "An account with the same provider already exist."
         );

      const newAccount = await Account.create(validatedData);

      return NextResponse.json(
         { success: true, data: newAccount },
         { status: 201 }
      );
   } catch (error) {
      return handleError(error, "api") as APIErrorResponse;
   }
}
