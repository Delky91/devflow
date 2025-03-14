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
         message: "Username can only contain letters, numbers, and underscores.",
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
         z.string().min(1, { message: "Tag is required." }).max(30, { message: "Tag cannot exceed 30 characters." })
      )
      .min(1, { message: "At least one tag is required." })
      .max(3, { message: "Cannot add more than 3 tags." }),
});

export const EditQuestionSchema = AskQuestionSchema.extend({
   questionId: z.string().min(1, { message: "Question ID is required." }),
});

export const GetQuestionSchema = z.object({
   questionId: z.string().min(1, { message: "Question ID is required." }),
});

// Define the schema for the user profile
export const UserSchema = z.object({
   name: z.string().min(1, { message: "Name is required." }),
   username: z.string().min(3, { message: "Username must be at least 3 characters long" }),
   email: z.string().email({ message: "Please enter a valid email address." }),
   bio: z.string().max(1500, "The bio is to long").optional(),
   image: z.string().url({ message: "Please enter a valid URL." }).optional(),
   location: z.string().optional(),
   portfolio: z.string().url({ message: "Please enter a valid URL." }).optional(),
   reputation: z.number().optional(),
});

// Define the schema for the account
export const AccountSchema = z.object({
   userId: z.string().min(1, { message: "User ID is required." }),
   name: z.string().min(1, { message: "Name is required." }),
   image: z.string().url({ message: "Please provide a valid URL." }).optional(),
   password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters long." })
      .max(100, { message: "Password cannot exceed 100 characters." })
      .regex(/[A-Z]/, {
         message: "Password must contain at least one uppercase letter.",
      })
      .regex(/[a-z]/, {
         message: "Password must contain at least one lowercase letter.",
      })
      .regex(/[0-9]/, { message: "Password must contain at least one number." })
      .regex(/[^a-zA-Z0-9]/, {
         message: "Password must contain at least one special character.",
      })
      .optional(),
   provider: z.string().min(1, { message: "Provider is required." }),
   providerAccountId: z.string().min(1, { message: "Provider Account ID is required." }),
});

// Define the schema for the sign-in with OAuth
export const SignInWithOAuthSchema = z.object({
   provider: z.enum(["google", "github"]),
   providerAccountId: z.string().min(1, { message: "Provider Account ID is required." }),
   user: z.object({
      name: z.string().min(1, { message: "Name is required." }),
      email: z.string().email({ message: "Please enter a valid email address." }),
      username: z.string().min(1, { message: "Username is required." }),
      image: z.string().url({ message: "Please enter a valid URL." }).optional(),
   }),
});

// Define the schema for the sign-in with email
export const PaginatedSearchParamsSchema = z.object({
   page: z.number().int().positive().default(1),
   pageSize: z.number().int().positive().default(10),
   query: z.string().optional(),
   filter: z.string().optional(),
   sort: z.string().optional(),
});

// Define the schema for the get questions by tag
export const GetTagQuestionSchema = PaginatedSearchParamsSchema.extend({
   tagId: z.string().min(1, { message: "Tag ID is required." }),
});

export const IncrementViewsSchema = z.object({
   questionId: z.string().min(1, { message: "Question ID is required." }),
});

export const AnswserSchema = z.object({
   content: z.string().min(100, { message: "Answer has to have more than 100 characters." }),
});

export const CreateAnswerSchema = AnswserSchema.extend({
   questionId: z.string().min(1, { message: "Question ID is required." }),
});

export const GetAnswerSchema = PaginatedSearchParamsSchema.extend({
   questionId: z.string().min(1, { message: "Question ID is required." }),
});

