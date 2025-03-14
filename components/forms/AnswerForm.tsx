"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { MDXEditorMethods } from "@mdxeditor/editor";
import { ReloadIcon } from "@radix-ui/react-icons";
import dynamic from "next/dynamic";
import Image from "next/image";
import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { AnswserSchema } from "@/lib/validations";

import { Button } from "../ui/button";

const Editor = dynamic(() => import("@/components/editor/Editor"), {
   // Make sure we turn SSR off to avoid hydration mismatch
   ssr: false,
});

const AnswerForm = () => {
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [isAISubmitting, setIsAISubmitting] = useState(false);

   const editorRef = useRef<MDXEditorMethods>(null);

   const form = useForm<z.infer<typeof AnswserSchema>>({
      resolver: zodResolver(AnswserSchema),
      defaultValues: {
         content: "",
      },
   });

   const handleAnswerSubmit = async (values: z.infer<typeof AnswserSchema>) => {
      console.log("values", values);
   };

   return (
      <div>
         <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center sm:gap-2">
            <h4 className="paragraph-semibold text-dark400_light800">Write your answer here</h4>
            <Button
               className="btn light-border-2 gap-1.5 rounded-md border px-4 py-2.5 text-primary-500 shadow-none dark:text-primary-500/90 dark:hover:text-primary-100"
               disabled={isAISubmitting}>
               {isAISubmitting ? (
                  <>
                     <ReloadIcon className="mr-2 size-4 animate-spin" />
                     Generating...
                  </>
               ) : (
                  <>
                     <Image
                        src="/icons/stars.svg"
                        alt="generate AI answer"
                        width={12}
                        height={12}
                        className="object-contain"
                     />
                     <p>Generate AI Answer</p>
                  </>
               )}
            </Button>
         </div>
         <Form {...form}>
            <form
               onSubmit={form.handleSubmit(handleAnswerSubmit)}
               className="mt-6 flex w-full flex-col gap-10">
               <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                     <FormItem className="flex w-full flex-col gap-3">
                        <FormControl>
                           <Editor
                              value={field.value}
                              editorRef={editorRef}
                              fieldChange={field.onChange}
                           />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                     </FormItem>
                  )}
               />
               <div className="flex justify-end">
                  <Button
                     type="submit"
                     className="primary-gradient">
                     {isSubmitting ? (
                        <>
                           <ReloadIcon className="mr-2 size-4 animate-spin" />
                           Posting...
                        </>
                     ) : (
                        <p className="text-light-700">Post Answer</p>
                     )}
                  </Button>
               </div>
            </form>
         </Form>
      </div>
   );
};

export default AnswerForm;
