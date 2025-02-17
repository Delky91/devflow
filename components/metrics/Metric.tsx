import Image from "next/image";
import Link from "next/link";
import React from "react";

const Metric = ({
   imgUrl,
   alt,
   value,
   title,
   href,
   textStyles,
   imgStyles,
   isAuthor,
}: MetricProps) => {
   const metricContent = (
      <>
         <Image
            src={imgUrl}
            alt={alt}
            width={16}
            height={16}
            className={`rounded-full object-contain ${imgStyles}`}
         />
         <p className={`${textStyles} flex items-center gap-1`}>
            {value}{" "}
            <span
               className={`small-regular line-clamp-1 ${isAuthor ? "max-sm:hidden" : ""}`}>
               {title}
            </span>
         </p>
      </>
   );

   // always show a metric but if href is not provided, don't make it clickable
   return href ? (
      <Link
         href={href}
         className="flex-center gap-1">
         {metricContent}
      </Link>
   ) : (
      <div className="flex-center gap-1">{metricContent}</div>
   );
};

export default Metric;
