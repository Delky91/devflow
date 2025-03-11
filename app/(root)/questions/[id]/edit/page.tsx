import { notFound, redirect } from "next/navigation";
import React from "react";

import QuestionForm from "@/components/forms/QuestionForm";
import ROUTES from "@/constants/routes";
import { getQuestion } from "@/lib/actions/question.action";
import { sessionCheckAndRedirect } from "@/lib/sessionCheck";

const EditQuestionPage = async ({ params }: RouteParams) => {
   const { id } = await params;
   if (!id) return notFound();

   const session = await sessionCheckAndRedirect(true);

   const { data: question, success } = await getQuestion({ questionId: id });
   if (!success) return notFound();

   if (question?.author.toString() !== session?.user?.id) {
      redirect(ROUTES.QUESTION(id));
   }

   return (
      <main className="mt-9">
         <QuestionForm
            question={question}
            isEdit
         />
      </main>
   );
};

export default EditQuestionPage;
