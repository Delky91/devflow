"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import {
   FieldValues,
   useForm,
   DefaultValues,
   SubmitHandler,
   Path,
} from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
   Form,
   FormControl,
   FormField,
   FormItem,
   FormLabel,
   FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import ROUTES from "@/constants/routes";

interface AuthFormProps<T extends FieldValues> {
   schema: z.ZodType<T>;
   defaultValues: T;
   onSubmit: (data: T) => Promise<{ success: boolean }>;
   formType: "SIGN_IN" | "SIGN_UP";
}

const AuthForm = <T extends FieldValues>({
   schema,
   defaultValues,
   formType,
   onSubmit,
}: AuthFormProps<T>) => {
   const form = useForm<z.infer<typeof schema>>({
      resolver: zodResolver(schema),
      defaultValues: defaultValues as DefaultValues<T>,
   });

   const handleSubmit: SubmitHandler<T> = async () => {
      // TODO: Implement authenticate
   };

   const buttonText = formType === "SIGN_IN" ? "Sign In" : "Sign Up";

   return (
      <Form {...form}>
         <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="mt-10 space-y-6">
            {Object.keys(defaultValues).map((field) => (
               <FormField
                  key={field}
                  control={form.control}
                  name={field as Path<T>}
                  render={({ field }) => (
                     <FormItem className="flex w-full flex-col gap-2.5">
                        <FormLabel className="paragraph-medium text-dark400_light700 capitalize">
                           {field.name === "email"
                              ? "Email Address"
                              : field.name}
                        </FormLabel>
                        <FormControl>
                           <Input
                              type={
                                 field.name === "password" ? "password" : "text"
                              }
                              required
                              {...field}
                              className="paragraph-regular background-light900_dark300 light-border-2 text-dark300_light700 no-focus min-h-12 rounded-1.5 border"
                           />
                        </FormControl>
                        <FormMessage />
                     </FormItem>
                  )}
               />
            ))}
            <Button
               disabled={form.formState.isSubmitting}
               className="primary-gradient paragraph-medium min-h-12 w-full rounded-2 px-4 py-3 font-inter !text-light-900"
               type="submit">
               {form.formState.isSubmitting
                  ? buttonText === "Sign In"
                     ? "Signing In..."
                     : "Signing Up..."
                  : buttonText}
            </Button>
            {formType === "SIGN_IN" ? (
               <p>
                  Don&apos;t have an account?{" "}
                  <Link
                     href={ROUTES.SIGN_UP}
                     className="paragraph-semibold primary-text-gradient">
                     Sign up
                  </Link>{" "}
               </p>
            ) : (
               <p>
                  Already have an account?{" "}
                  <Link
                     href={ROUTES.SIGN_IN}
                     className="paragraph-semibold primary-text-gradient">
                     Sign in
                  </Link>{" "}
               </p>
            )}
         </form>
      </Form>
   );
};
export default AuthForm;