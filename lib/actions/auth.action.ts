"use server";

import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import { signIn } from "@/auth";
import { Account } from "@/database/account.model";
import { User } from "@/database/user.model";
import { ActionResponse, ErrorResponse } from "@/types/global";

import action from "../handlers/action";
import handleError from "../handlers/error";
import { NotFoundError } from "../http-errors";
import { SignInSchema, SignUpSchema } from "../validations";

/**
 * Signs up a new user with the provided credentials.
 *
 * @param params - The authentication credentials for the new user.
 * @returns A promise that resolves to an ActionResponse indicating the success or failure of the sign-up process.
 *
 * The function performs the following steps:
 * 1. Validates the provided credentials against the SignUpSchema.
 * 2. Checks if a user with the provided email or username already exists.
 * 3. Hashes the user's password.
 * 4. Creates a new user and associated account within a MongoDB transaction.
 * 5. Signs in the user using the provided credentials.
 *
 * If any error occurs during the process, the transaction is aborted and an error response is returned.
 */
export async function signUpWithCredentials(
   params: AuthCredentials
): Promise<ActionResponse> {
   const validationsResult = await action({ params, schema: SignUpSchema });

   if (validationsResult instanceof Error) {
      return handleError(validationsResult) as ErrorResponse;
   }

   const { name, username, email, password } = validationsResult.params!;

   const session = await mongoose.startSession();
   session.startTransaction();

   try {
      const existingUser = await User.findOne({ email }).session(session);
      if (existingUser) {
         throw new Error("User already exists");
      }

      const existingUsername = await User.findOne({ username }).session(
         session
      );
      if (existingUsername) {
         throw new Error("Username already exists");
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const [newUser] = await User.create(
         [
            {
               name,
               username,
               email,
            },
         ],

         { session }
      );

      await Account.create(
         [
            {
               userId: newUser._id,
               name,
               provider: "credentials",
               providerAccountId: email,
               password: hashedPassword,
            },
         ],
         { session }
      );

      await session.commitTransaction();

      await signIn("credentials", { email, password, redirect: false });
      return { success: true };
   } catch (error) {
      await session.abortTransaction();

      return handleError(error) as ErrorResponse;
   } finally {
      await session.endSession();
   }
}

/**
 * Signs in a user with their email and password credentials.
 *
 * @param params - An object containing the user's email and password.
 * @returns A promise that resolves to an ActionResponse object.
 *
 * The function performs the following steps:
 * 1. Validates the provided credentials against the SignInSchema.
 * 2. If validation fails, returns an ErrorResponse.
 * 3. Checks if a user with the provided email exists in the database.
 * 4. If the user does not exist, throws a NotFoundError for the user.
 * 5. Checks if an account with the provided email and "credentials" provider exists.
 * 6. If the account does not exist, throws a NotFoundError for the account.
 * 7. Compares the provided password with the stored password hash.
 * 8. If the passwords do not match, throws an error.
 * 9. Signs in the user using the "credentials" provider.
 * 10. Returns a success response if the sign-in is successful.
 * 11. Catches and handles any errors that occur during the process.
 */
export async function signInWithCredentials(
   params: Pick<AuthCredentials, "email" | "password">
): Promise<ActionResponse> {
   const validationsResult = await action({ params, schema: SignInSchema });

   if (validationsResult instanceof Error) {
      return handleError(validationsResult) as ErrorResponse;
   }

   const { email, password } = validationsResult.params!;

   try {
      const existingUser = await User.findOne({ email });
      if (!existingUser) throw new NotFoundError("User");

      const existingAccount = await Account.findOne({
         provider: "credentials",
         providerAccountId: email,
      });

      if (!existingAccount) throw new NotFoundError("Account");

      const passwordMatch = await bcrypt.compare(
         password,
         existingAccount.password
      );

      if (!passwordMatch) {
         throw new Error("Password does not match");
      }

      await signIn("credentials", { email, password, redirect: false });
      return { success: true };
   } catch (error) {
      return handleError(error) as ErrorResponse;
   }
}
