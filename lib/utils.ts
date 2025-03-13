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

   return techMap[normalizeTechName] ? `${techMap[normalizeTechName]} colored` : "devicon-devicon-plain";
};

/**
 * Returns a human-readable timestamp indicating how long ago a given date was.
 *
 * @param date - The date to compare with the current time.
 * @returns A string representing the time elapsed since the given date in the largest appropriate unit (e.g., "2 days ago", "3 hours ago").
 */
export const getTimeStamp = (createdAt: Date) => {
   const date = new Date(createdAt);
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

export const techDescriptionMap: { [key: string]: string } = {
   javascript: "JavaScript is a powerful language for building dynamic, interactive, and modern web applications.",
   typescript:
      "TypeScript adds strong typing to JavaScript, making it great for scalable and maintainable applications.",
   react: "React is a popular library for building fast and modular user interfaces.",
   nextjs: "Next.js is a React framework for server-side rendering and building optimized web applications.",
   nodejs: "Node.js enables server-side JavaScript, allowing you to create fast, scalable network applications.",
   python:
      "Python is a versatile language known for readability and a vast ecosystem, often used for data science and automation.",
   java: "Java is an object-oriented language commonly used for enterprise applications and Android development.",
   cplusplus:
      "C++ is a high-performance language suitable for system software, game engines, and complex applications.",
   git: "Git is a version control system that tracks changes in source code during software development.",
   docker: "Docker is a container platform that simplifies application deployment and environment management.",
   mongodb: "MongoDB is a NoSQL database for handling large volumes of flexible, document-based data.",
   mysql: "MySQL is a popular relational database, known for reliability and ease of use.",
   postgresql:
      "PostgreSQL is a robust open-source relational database with advanced features and strong SQL compliance.",
   aws: "AWS is a comprehensive cloud platform offering a wide range of services for deployment, storage, and more.",
};

export const getTechDescription = (techName: string) => {
   const normalizedTechName = techName.replace(/[ .]/g, "").toLowerCase();
   return techDescriptionMap[normalizedTechName]
      ? techDescriptionMap[normalizedTechName]
      : `${techName} is a technology or tool widely used in web development, providing valuable features and capabilities.`;
};

export const formatNumber = (num: number) => {
   if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
   } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
   } else {
      return num.toString();
   }
};
