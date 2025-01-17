"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { JSX } from "react";

import { SheetClose } from "@/components/ui/sheet";
import { sidebarLinks } from "@/constants/navLinks";
import { cn } from "@/lib/utils";

/**
 * Component that renders navigation links.
 *
 * @param {Object} props - The component props.
 * @param {boolean} [props.isMobileNav=false] - Flag indicating if the navigation is for mobile.
 *
 * @returns {JSX.Element} The rendered navigation links.
 */
const NavLinks = ({
   isMobileNav = false,
}: {
   isMobileNav?: boolean;
}): JSX.Element => {
   const pathname = usePathname();
   const userId = 1;

   return (
      <>
         {sidebarLinks.map((link) => {
            const isActive =
               (pathname.includes(link.route) && link.route.length > 1) ||
               pathname === link.route;

            if (link.route === "/profile") {
               if (userId) link.route = `/profile/${userId}`;
               else return null;
            }

            const LinkComponent = (
               <Link
                  href={link.route}
                  key={link.label}
                  className={cn(
                     isActive
                        ? "primary-gradient rounded-lg text-light-900"
                        : "text-dark300-light900",
                     "flex items-center gap-4 bg-transparent p-4"
                  )}>
                  <Image
                     src={link.imgURL}
                     alt={link.label}
                     width={20}
                     height={20}
                     className={cn({ "invert-colors": !isActive })}
                  />
                  <p
                     className={cn(
                        isActive ? "base-bold" : "base-medium",
                        !isMobileNav && "max-lg:hidden"
                     )}>
                     {link.label}
                  </p>
               </Link>
            );

            // Wrap the link in a SheetClose component if it's for mobile navigation
            return isMobileNav ? (
               <SheetClose
                  asChild
                  key={link.route}>
                  {LinkComponent}
               </SheetClose>
            ) : (
               <React.Fragment key={link.route}>{LinkComponent}</React.Fragment>
            );
         })}
      </>
   );
};

export default NavLinks;
