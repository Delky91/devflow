"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { MDXEditorMethods } from "@mdxeditor/editor";
import { ReloadIcon } from "@radix-ui/react-icons";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useRef, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import ROUTES from "@/constants/routes";
import { toast } from "@/hooks/use-toast";
import { createQuestion, editQuestion } from "@/lib/actions/question.action";
import { AskQuestionSchema } from "@/lib/validations";

import TagCard from "../cards/TagCard";
import { Button } from "../ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";

const Editor = dynamic(() => import("@/components/editor/Editor"), {
   // Make sure we turn SSR off to avoid hydration mismatch
   ssr: false,
});

interface QuestionFormParams {
   question?: Question;
   isEdit?: boolean;
}

const QuestionForm = ({ question, isEdit = false }: QuestionFormParams) => {
   const router = useRouter();
   const editorRef = useRef<MDXEditorMethods>(null);
   const [isPending, startTransition] = useTransition();

   const form = useForm<z.infer<typeof AskQuestionSchema>>({
      resolver: zodResolver(AskQuestionSchema),
      defaultValues: {
         title: question?.title || "",
         content: question?.content || "",
         tags: question?.tags.map((tag) => tag.name) || [],
      },
   });

   const handleCreateQuestion = (data: z.infer<typeof AskQuestionSchema>) => {
      startTransition(async () => {
         if (isEdit && question) {
            const result = await editQuestion({ questionId: question?._id, ...data });

            if (result.success) {
               toast({
                  title: "Success",
                  description: "Your question has been edited successfully.",
               });

               if (result.data) router.push(ROUTES.QUESTION(result.data._id));
               else {
                  toast({
                     title: "Error",
                     description: "Something went wrong while editing your question.",
                     variant: "destructive",
                  });
               }
            }
            // needed to end the function when editing a question
            return;
         }

         const result = await createQuestion(data);
         if (result.success) {
            toast({
               title: "Success",
               description: "Your question has been created successfully.",
            });

            if (result.data) router.push(ROUTES.QUESTION(result.data._id));
            else {
               toast({
                  title: "Error",
                  description: "Something went wrong while creating your question.",
                  variant: "destructive",
               });
            }
         }
      });
   };

   const handleTagRemove = (tag: string, field: { value: string[] }) => {
      const newTags = field.value.filter((t) => t !== tag);

      form.setValue("tags", newTags);

      if (newTags.length === 0) {
         form.setError("tags", {
            type: "required",
            message: "At least one tag is required",
         });
      }
   };

   const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, field: { value: string[] }) => {
      if (e.key === "Enter") {
         e.preventDefault();
         const tagInput = e.currentTarget.value.trim();

         if (tagInput && tagInput.length < 15 && !field.value.includes(tagInput)) {
            form.setValue("tags", [...field.value, tagInput]);
            e.currentTarget.value = "";
            form.clearErrors("tags");
         } else if (tagInput.length > 15) {
            form.setError("tags", {
               type: "maxLength",
               message: "Tag length should be less than 15 characters",
            });
         } else if (field.value.includes(tagInput)) {
            form.setError("tags", {
               type: "duplicate",
               message: "Tag already exists",
            });
         }
      }
   };

   return (
      <Form {...form}>
         <form
            onSubmit={form.handleSubmit(handleCreateQuestion)}
            className="flex w-full flex-col gap-10">
            {/* title INPUT */}
            <FormField
               control={form.control}
               name="title"
               render={({ field }) => (
                  <FormItem className="flex w-full flex-col">
                     <FormLabel className="paragraph-semibold text-dark400_light800">
                        Question Title <span className="text-primary-500">*</span>
                     </FormLabel>
                     <FormControl>
                        <Input
                           type="text"
                           placeholder="Enter your question title"
                           className="paragraph-regular no-focus background-light700_dark300 light-border-2 text-dark300_light700 min-h-[56px] border"
                           {...field}
                        />
                     </FormControl>
                     <FormDescription className="body-regular mt-2.5 text-light-500">
                        Be specific and imagine you&apos;re asking a question to another person.
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
                        Detailed expalanation of your problem <span className="text-primary-500">*</span>
                     </FormLabel>
                     <FormControl>
                        {/* Editor component  */}
                        <Editor
                           value={field.value}
                           editorRef={editorRef}
                           fieldChange={field.onChange}
                        />
                     </FormControl>
                     <FormDescription className="body-regular mt-2.5 text-light-500">
                        Introduce the problem and expand on what you&apos;ve put in the title.
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
                              type="text"
                              placeholder="Add tags..."
                              onKeyDown={(e) => handleInputKeyDown(e, field)}
                              className="paragraph-regular no-focus background-light700_dark300 light-border-2 text-dark300_light700 min-h-[56px] border"
                           />
                           {/* map over the maps later */}

                           {field.value.length > 0 && (
                              <div className="flex-start mt-2.5 flex flex-wrap gap-2.5">
                                 {field.value.map((tag: string) => (
                                    <TagCard
                                       key={tag}
                                       _id={tag}
                                       name={tag}
                                       compact
                                       remove
                                       isButton
                                       handleRemove={() => handleTagRemove(tag, field)}
                                    />
                                 ))}
                              </div>
                           )}
                        </div>
                     </FormControl>
                     <FormMessage />
                     <FormDescription className="body-regular mt-2.5 text-light-500">
                        Add up to three tags to describe what your question is about. You need to press Enter to add a
                        tag.
                     </FormDescription>
                  </FormItem>
               )}
            />
            <div className="mt-16 flex justify-end">
               <Button
                  type="submit"
                  disabled={isPending}
                  className="primary-gradient w-fit !text-light-900">
                  {isPending ? (
                     <>
                        <ReloadIcon className="mr-2 size-4 animate-spin" />
                        <span>Submitting</span>
                     </>
                  ) : (
                     <>{isEdit ? "Edit" : "Ask Question"}</>
                  )}
               </Button>
            </div>
         </form>
      </Form>
   );
};

export default QuestionForm;
