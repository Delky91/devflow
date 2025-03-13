import Image from "next/image";
import Link from "next/link";
import React from "react";

import ROUTES from "@/constants/routes";
import { cn } from "@/lib/utils";

import { Avatar, AvatarFallback } from "./ui/avatar";

interface Props {
   id: string;
   name: string;
   imageUrl?: string | null;
   className?: string;
   fallbackClassName?: string;
}

const UserAvatar = ({ id, name, imageUrl, className = "w-9 h-9", fallbackClassName }: Props) => {
   const nameInitials = name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
   return (
      <Link href={ROUTES.PROFILE(id)}>
         <Avatar className={className}>
            {imageUrl ? (
               <Image
                  src={imageUrl}
                  alt={name}
                  width={36}
                  height={36}
                  quality={100}
               />
            ) : (
               <AvatarFallback
                  className={cn(
                     "primary-gradient font-space-grotesk font-bold tracking-wider text-white",
                     fallbackClassName
                  )}>
                  {nameInitials}
               </AvatarFallback>
            )}
         </Avatar>
      </Link>
   );
};

export default UserAvatar;
