import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { techMap } from "../constants/techMap";

/**
 * Combines multiple class names into a single string.
 *
 * This function takes any number of class name inputs, processes them using `clsx`,
 * and then merges them using `twMerge` to ensure Tailwind CSS classes are combined correctly.
 *
 * @param {...ClassValue[]} inputs - The class names to combine. These can be strings, arrays, or objects.
 * @returns {string} - The combined class names as a single string.
 */
export function cn(...inputs: ClassValue[]) {
   return twMerge(clsx(inputs));
}

/**
 * Returns the appropriate Devicon class name for a given technology name.
 *
 * This function normalizes the provided technology name by removing spaces and periods,
 * and converting it to lowercase. It then maps the normalized name to a corresponding
 * Devicon class name using a predefined mapping. If the technology name is not found
 * in the mapping, a default class name is returned.
 *
 * @param techName - The name of the technology to get the Devicon class name for.
 * @returns The Devicon class name corresponding to the provided technology name.
 */
export const getDeviconClassName = (techName: string) => {
   const normalizeTechName = techName.replace(/[ .]/g, "").toLowerCase();

   return techMap[normalizeTechName]
      ? `${techMap[normalizeTechName]} colored`
      : "devicon-devicon-plain";
};

/**
 * Returns a human-readable timestamp indicating how long ago a given date was.
 *
 * @param date - The date to compare with the current time.
 * @returns A string representing the time elapsed since the given date in the largest appropriate unit (e.g., "2 days ago", "3 hours ago").
 */
export const getTimeStamp = (date: Date) => {
   const now = new Date();
   const secondsAgo = Math.floor((now.getTime() - date.getTime()) / 1000);

   const units = [
      { label: "year", seconds: 31536000 },
      { label: "month", seconds: 2592000 },
      { label: "week", seconds: 604800 },
      { label: "day", seconds: 86400 },
      { label: "hour", seconds: 3600 },
      { label: "minute", seconds: 60 },
      { label: "second", seconds: 1 },
   ];

   for (const unit of units) {
      const interval = Math.floor(secondsAgo / unit.seconds);

      if (interval >= 1) {
         return `${interval} ${unit.label}${interval > 1 ? "s" : ""} ago`;
      }
   }
};
