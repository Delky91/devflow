import Link from "next/link";
import React from "react";

import ROUTES from "@/constants/routes";
import { getTimeStamp } from "@/lib/utils";

import TagCard from "./TagCard";
import Metric from "../metrics/Metric";

interface QuestionCardProps {
   key: string;
   question: Question;
}

const QuestionCard = ({
   question: { _id, title, tags, author, createdAt, upvotes, answers, views },
}: QuestionCardProps) => {
   return (
      <div className="card-wrapper rounded-[10px] p-9 sm:px-11">
         <div className="flex flex-col-reverse items-start justify-between gap-5 sm:flex-row">
            <div>
               <span className="subtle-regular text-dark400_light700 line-clamp-1 flex sm:hidden">
                  {getTimeStamp(createdAt)}
               </span>

               <Link href={ROUTES.QUESTION(_id)}>
                  <h3 className="sm:h3-semibold base-semibold text-dark200_light900 line-clamp-1 flex-1">{title}</h3>
               </Link>
            </div>
         </div>

         {/* tag section of the card */}
         <div className="mt-3.5 flex w-full flex-wrap gap-2">
            {tags.map((tag: Tag) => (
               <TagCard
                  key={tag._id}
                  _id={tag._id}
                  name={tag.name}
                  compact
               />
            ))}
         </div>

         {/* author, upvotes, answers, views section of the card */}
         <div className="flex-between mt-6 w-full flex-wrap gap-3">
            {/* author section */}
            <Metric
               imgUrl={author.image}
               alt={author.name}
               value={author.name}
               title={`• asked ${getTimeStamp(createdAt)}`}
               href={ROUTES.PROFILE(author._id)}
               textStyles="body-medium text-dark400_light700"
               isAuthor
            />

            <div className="max:sm:justify-start flex items-center gap-3 max-sm:flex-wrap">
               {/* votes */}
               <Metric
                  imgUrl="/icons/like.svg"
                  alt="like"
                  value={upvotes}
                  title={" " + "votes"}
                  textStyles="small-medium text-dark400_light00"
               />

               {/* answers */}
               <Metric
                  imgUrl="/icons/message.svg"
                  alt="answers"
                  value={answers}
                  title={" " + "answers"}
                  textStyles="small-medium text-dark400_light00"
               />

               {/* views */}
               <Metric
                  imgUrl="/icons/eye.svg"
                  alt="views"
                  value={views}
                  title={" " + "views"}
                  textStyles="small-medium text-dark400_light00"
               />
            </div>
         </div>
      </div>
   );
};

export default QuestionCard;
