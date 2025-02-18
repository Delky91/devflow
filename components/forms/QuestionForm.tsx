"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";

import { AskQuestionSchema } from "@/lib/validations";

import { Button } from "../ui/button";
import {
   Form,
   FormControl,
   FormDescription,
   FormField,
   FormItem,
   FormLabel,
   FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";

const QuestionForm = () => {
   const form = useForm({
      resolver: zodResolver(AskQuestionSchema),
      defaultValues: {
         title: "",
         content: "",
         tags: [],
      },
   });

   const handleCreateQuestion = (data: unknown) => {
      console.log(data);
   };

   return (
      <Form {...form}>
         <form
            onSubmit={form.handleSubmit(handleCreateQuestion)}
            className="flex w-full flex-col gap-10">
            {/* Ttile INPUT */}
            <FormField
               control={form.control}
               name="title"
               render={({ field }) => (
                  <FormItem className="flex w-full flex-col">
                     <FormLabel className="paragraph-semibold text-dark400_light800">
                        Question Title{" "}
                        <span className="text-primary-500">*</span>
                     </FormLabel>
                     <FormControl>
                        <Input
                           required
                           type="text"
                           placeholder="Enter your question title"
                           className="paragraph-regular no-focus background-light700_dark300 light-border-2 text-dark300_light700 min-h-[56px] border"
                           {...field}
                        />
                     </FormControl>
                     <FormDescription className="body-regular mt-2.5 text-light-500">
                        Be specific and imagine you&apos;re asking a question to
                        another person.
                     </FormDescription>
                     <FormMessage />
                  </FormItem>
               )}
            />

            {/* CONTENT INPUT */}
            <FormField
               control={form.control}
               name="content"
               render={({ field }) => (
                  <FormItem className="flex w-full flex-col">
                     <FormLabel className="paragraph-semibold text-dark400_light800">
                        Detailed expalanation of your problem{" "}
                        <span className="text-primary-500">*</span>
                     </FormLabel>
                     <FormControl>
                        {/* Editor component  */}
                        EDITOR COMPONENT
                     </FormControl>
                     <FormDescription className="body-regular mt-2.5 text-light-500">
                        Introduce the problem and expand on what you&apos;ve put
                        in the title.
                     </FormDescription>
                     <FormMessage />
                  </FormItem>
               )}
            />
            {/* TAGS INPUT */}
            <FormField
               control={form.control}
               name="tags"
               render={({ field }) => (
                  <FormItem className="flex w-full flex-col gap-3">
                     <FormLabel className="paragraph-semibold text-dark400_light800">
                        Tags <span className="text-primary-500">*</span>
                     </FormLabel>
                     <FormControl>
                        <div>
                           <Input
                              required
                              type="text"
                              placeholder="Add tags"
                              className="paragraph-regular no-focus background-light700_dark300 light-border-2 text-dark300_light700 min-h-[56px] border"
                              {...field}
                           />
                           {/* map over the maps later */}
                           Tags
                        </div>
                     </FormControl>
                     <FormDescription className="body-regular mt-2.5 text-light-500">
                        Add up to three tags to describe what your question is
                        about. You need to press Enter to add a tag.
                     </FormDescription>
                     <FormMessage />
                  </FormItem>
               )}
            />
            <div className="mt-16 flex justify-end">
               <Button
                  type="submit"
                  className="primary-gradient w-fit !text-light-900">
                  Ask Question
               </Button>
            </div>
         </form>
      </Form>
   );
};

export default QuestionForm;
