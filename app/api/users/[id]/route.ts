import { NextResponse } from "next/server";

import { dbConnect } from "@/config/mongoose";
import { User } from "@/database/user.model";
import handleError from "@/lib/handlers/error";
import { NotFoundError } from "@/lib/http-errors";
import { UserSchema } from "@/lib/validations";
import { APIErrorResponse } from "@/types/global";

/**
 * Handles the GET request to fetch a user by ID.
 *
 * @param _ - The Request object (not used in this function).
 * @param params - An object containing the route parameters, which includes the user ID.
 * @returns A JSON response containing the user data if found, or an error response if not found or if an error occurs.
 * @throws {NotFoundError} If the user ID is not provided or if the user is not found in the database.
 */
export async function GET(
   _: Request,
   { params }: { params: Promise<{ id: string }> }
) {
   const { id } = await params;
   if (!id) throw new NotFoundError("User");

   try {
      await dbConnect();

      const user = await User.findById(id);
      if (!user) throw new NotFoundError("User");

      return NextResponse.json(
         {
            success: true,
            data: user,
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
 * Handles the DELETE request to delete a user by their ID.
 *
 * @param _ - The Request object (not used in this function).
 * @param params - An object containing the parameters, including the user ID.
 * @returns A JSON response indicating the success of the deletion and the deleted user data, or an error response.
 * @throws NotFoundError - If the user ID is not provided or the user is not found.
 */
export async function DELETE(
   _: Request,
   { params }: { params: Promise<{ id: string }> }
) {
   const { id } = await params;
   if (!id) throw new NotFoundError("User");

   try {
      await dbConnect();

      const user = await User.findByIdAndDelete(id);
      if (!user) throw new NotFoundError("User");

      return NextResponse.json(
         {
            success: true,
            data: user,
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
 * Handles the PUT request to update a user by ID.
 *
 * @param {Request} request - The incoming request object.
 * @param {Object} context - The context object containing route parameters.
 * @param {Promise<{ id: string }>} context.params - A promise that resolves to an object containing the user ID.
 * @returns {Promise<Response>} - A promise that resolves to a response object.
 * @throws {NotFoundError} - Throws an error if the user ID is not found or if the user update fails.
 */
export async function PUT(
   request: Request,
   { params }: { params: Promise<{ id: string }> }
) {
   const { id } = await params;
   if (!id) throw new NotFoundError("User");

   try {
      await dbConnect();

      const body = await request.json();
      const validatedData = UserSchema.partial().parse(body);

      const updatedUser = await User.findByIdAndUpdate(id, validatedData, {
         new: true,
      });
      if (!updatedUser) throw new NotFoundError("User");

      return NextResponse.json(
         {
            success: true,
            data: updatedUser,
         },
         {
            status: 200,
         }
      );
   } catch (error) {
      return handleError(error, "api") as APIErrorResponse;
   }
}
