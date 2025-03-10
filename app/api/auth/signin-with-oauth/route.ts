import mongoose from "mongoose";
import { NextResponse } from "next/server";
import slugify from "slugify";

import { dbConnect } from "@/config/mongoose";
import { Account } from "@/database/account.model";
import { User } from "@/database/user.model";
import handleError from "@/lib/handlers/error";
import { ValidationError } from "@/lib/http-errors";
import { SignInWithOAuthSchema } from "@/lib/validations";

/**
 * Handles the POST request for signing in with OAuth.
 *
 * @param {Request} request - The incoming request object.
 * @returns {Promise<NextResponse>} - The response object indicating success or failure.
 *
 * @throws {ValidationError} - If the provided data is invalid.
 * @throws {APIErrorResponse} - If an error occurs during the process.
 *
 * The function performs the following steps:
 * 1. Parses the request body to extract provider, providerAccountId, and user information.
 * 2. Connects to the database.
 * 3. Starts a new session and transaction.
 * 4. Validates the parsed data against the SignInWithOAuthSchema.
 * 5. Checks if a user with the provided email exists:
 *    - If not, creates a new user.
 *    - If yes, updates the user's name and image if they have changed.
 * 6. Checks if an account with the provided provider and providerAccountId exists for the user:
 *    - If not, creates a new account.
 * 7. Commits the transaction if all operations succeed.
 * 8. Aborts the transaction and handles the error if any operation fails.
 * 9. Ends the session.
 */
export async function POST(request: Request) {
   const { provider, providerAccountId, user } = await request.json();

   await dbConnect();

   const session = await mongoose.startSession();
   session.startTransaction();

   try {
      const validatedData = SignInWithOAuthSchema.safeParse({
         provider,
         providerAccountId,
         user,
      });

      if (!validatedData.success) throw new ValidationError(validatedData.error.flatten().fieldErrors);

      const { name, username, email, image } = user;

      const slugifiedUsername = slugify(username, {
         lower: true,
         strict: true,
         trim: true,
      });

      let existingUser = await User.findOne({ email }).session(session);

      if (!existingUser) {
         [existingUser] = await User.create([{ name, username: slugifiedUsername, email, image }], { session });
      } else {
         const updatedData: { name?: string; image?: string } = {};

         if (existingUser.name !== name) updatedData.name = name;
         if (existingUser.image !== image) updatedData.image = image;

         if (Object.keys(updatedData).length > 0) {
            await User.updateOne({ _id: existingUser._id }, { $set: updatedData }).session(session);
         }
      }

      const existingAccount = await Account.findOne({
         userId: existingUser._id,
         provider,
         providerAccountId,
      }).session(session);

      if (!existingAccount) {
         await Account.create(
            [
               {
                  userId: existingUser._id,
                  name,
                  image,
                  provider,
                  providerAccountId,
               },
            ],
            { session }
         );
      }

      await session.commitTransaction();

      return NextResponse.json({ success: true });
   } catch (error: unknown) {
      await session.abortTransaction();

      return handleError(error, "api") as APIErrorResponse;
   } finally {
      session.endSession();
   }
}
