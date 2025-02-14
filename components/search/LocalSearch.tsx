"use client";

import Image from "next/image";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";

import { formUrlQuery, removeKeysFromUrlQuery } from "@/lib/url";

import { Input } from "../ui/input";

interface Props {
   route: string;
   imgSrc: string;
   placeholder: string;
   otherClasses?: string;
}

const LocalSearch = ({ route, imgSrc, placeholder, otherClasses }: Props) => {
   const router = useRouter();
   const pathName = usePathname();
   const searchParams = useSearchParams();
   const query = searchParams.get("query") || "";

   const [searchQuery, setSearchQuery] = useState(query);

   useEffect(() => {
      //  debounce the search query to avoid multiple api calls
      const delayDebounceFn = setTimeout(() => {
         // update the url query
         if (searchQuery) {
            const newUrl = formUrlQuery({
               // params save the current url query and then we add the new query
               params: searchParams.toString(),
               key: "query",
               value: searchQuery,
            });

            router.push(newUrl, { scroll: false });
         } else {
            if (pathName === route) {
               const newUrl = removeKeysFromUrlQuery({
                  params: searchParams.toString(),
                  keysToRemove: ["query"],
               });
               router.push(newUrl, { scroll: false });
            }
         }
      }, 500);

      // clear the timeout
      return () => clearTimeout(delayDebounceFn);
   }, [searchQuery, router, route, searchParams, pathName]);

   return (
      <div
         className={`background-light800_darkgradient flex min-h-[56px] grow items-center gap-4 rounded-[10px] px-4 ${otherClasses}`}>
         <Image
            src={imgSrc}
            alt="search"
            width={24}
            height={24}
            className="cursor-pointer"
         />
         <Input
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            className="paragraph-regular no-focus placeholder text-dark400_light700 border-none shadow-none outline-none"
            onChange={(e) => {
               setSearchQuery(e.target.value);
            }}
         />
      </div>
   );
};

export default LocalSearch;
