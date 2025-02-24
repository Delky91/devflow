import { NextResponse } from "next/server";

import { dbConnect } from "@/config/mongoose";
import { User } from "@/database/user.model";
import handleError from "@/lib/handlers/error";
import { ValidationError } from "@/lib/http-errors";
import { UserSchema } from "@/lib/validations";
import { APIErrorResponse } from "@/types/global";

export async function GET() {
   try {
      await dbConnect();
      const users = await User.find();

      return NextResponse.json(
         {
            success: true,
            data: users,
         },
         { status: 200 }
      );
   } catch (error) {
      return handleError(error, "api") as APIErrorResponse;
   }
}

/**
 * Handles the POST request to create a new user.
 *
 * @param {Request} request - The incoming request object.
 * @returns {Promise<NextResponse>} The response object containing the result of the user creation.
 *
 * @throws {ValidationError} If the request body validation fails.
 * @throws {Error} If the user or username already exists.
 */
export async function POST(request: Request) {
   try {
      await dbConnect();

      // validate the request body
      const body = await request.json();
      const validatedData = UserSchema.safeParse(body);
      if (!validatedData.success) {
         throw new ValidationError(validatedData.error.flatten().fieldErrors);
      }

      // check if the user already exists in the database
      const { email, username } = validatedData.data;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
         throw new Error("User already exists.");
      }

      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
         throw new Error("Username already exists.");
      }

      // create the new user
      const newUser = await User.create(validatedData.data);

      return NextResponse.json(
         { success: true, data: newUser },
         { status: 201 }
      );
   } catch (error) {
      return handleError(error, "api") as APIErrorResponse;
   }
}
