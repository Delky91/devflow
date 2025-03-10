import Image from "next/image";
import Link from "next/link";
import React from "react";

import ROUTES from "@/constants/routes";
import { getDeviconClassName } from "@/lib/utils";

import { Badge } from "../ui/badge";

interface Props {
   _id: string;
   name: string;
   questions?: number;
   showCount?: boolean;
   compact?: boolean;
   remove?: boolean;
   isButton?: boolean;
   handleRemove?: () => void;
}

const TagCard = ({
   _id,
   name,
   questions,
   showCount,
   compact,
   remove,
   handleRemove,
   isButton,
}: Props) => {
   const iconClass = getDeviconClassName(name);

   const content = (
      <>
         <Badge className="subtle-medium background-light800_dark300 text-light400_light500 flex flex-row gap-2 rounded-md border-none px-4 py-2 uppercase">
            <div className="flex-center space-x-2">
               <i className={`${iconClass} text-sm`}></i>
               <span>{name}</span>
            </div>
            {remove && (
               <Image
                  src="/icons/close.svg"
                  alt="close icon"
                  width={12}
                  height={12}
                  className="cursor-pointer rounded-full object-contain invert-0 dark:invert"
                  onClick={handleRemove}
               />
            )}
         </Badge>
         {showCount && (
            <p className="small-medium text-dark500_light700">{questions}</p>
         )}
      </>
   );

   // TODO maybe change it so if compact dont show image and add another if to handle the isButton case
   if (compact) {
      return isButton ? (
         <span className="flex justify-between gap-2">{content}</span>
      ) : (
         <Link
            href={ROUTES.TAGS(_id)}
            className="flex justify-between gap-2">
            {content}
         </Link>
      );
   }

   // return (
   //    <Link
   //       href={ROUTES.TAGS(_id)}
   //       className="flex justify-between gap-2">
   //       {content}
   //    </Link>
   // );
};

export default TagCard;
