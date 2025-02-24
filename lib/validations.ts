// Description: This file contains the zod validation schemas for the sign-in, sign-up, and ask question forms.
import { z } from "zod";

// Define the schema for the sign-in form
export const SignInSchema = z.object({
   email: z
      .string()
      .min(1, { message: "Email is required." })
      .email({ message: "Please enter a valid email address." }),

   password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters long." })
      .max(20, { message: "Password must be at most 20 characters long." }),
});

// Define the schema for the sign-up form
export const SignUpSchema = z.object({
   username: z
      .string()
      .min(3, { message: "Username must be at least 3 characters long." })
      .max(30, { message: "Username must be at most 30 characters long." })
      .regex(/^[a-zA-Z0-9_]+$/, {
         message:
            "Username can only contain letters, numbers, and underscores.",
      }),

   name: z
      .string()
      .min(1, { message: "Name is required." })
      .max(50, { message: "Name cannot exceed 50 characters." })
      .regex(/^[a-zA-Z\s]+$/, {
         message: "Name can only contain letters and spaces.",
      }),

   email: z
      .string()
      .min(1, { message: "Email is required." })
      .email({ message: "Please enter a valid email address." }),

   password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters long." })
      .max(20, { message: "Password must be at most 20 characters long." })
      .regex(/[A-Z]/, {
         message: "Password must contain at least one uppercase letter.",
      })
      .regex(/[a-z]/, {
         message: "Password must contain at least one lowercase letter.",
      })
      .regex(/[0-9]/, {
         message: "Password must contain at least one number.",
      })
      .regex(/[^a-zA-Z0-9]/, {
         message: "Password must contain at least one special character.",
      }),
});

// Define the schema for the ask question form
export const AskQuestionSchema = z.object({
   title: z
      .string()
      .min(5, { message: "Title is required." })
      .max(100, { message: "Title cannot exceed 100 characters." }),

   content: z.string().min(1, { message: "Content is required." }),
   tags: z
      .array(
         z
            .string()
            .min(1, { message: "Tag is required." })
            .max(30, { message: "Tag cannot exceed 30 characters." })
      )
      .min(1, { message: "At least one tag is required." })
      .max(3, { message: "Cannot add more than 3 tags." }),
});

// Define the schema for the user profile
export const UserSchema = z.object({
   name: z.string().min(1, { message: "Name is required." }),
   username: z
      .string()
      .min(3, { message: "Username must be at least 3 characters long" }),
   email: z.string().email({ message: "Please enter a valid email address." }),
   bio: z.string().max(1500, "The bio is to long").optional(),
   image: z.string().url({ message: "Please enter a valid URL." }).optional(),
   location: z.string().optional(),
   portfolio: z
      .string()
      .url({ message: "Please enter a valid URL." })
      .optional(),
   reputation: z.number().optional(),
});
