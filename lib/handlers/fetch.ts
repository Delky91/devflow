// centralized handler for api requests

import { ActionResponse } from "@/types/global";

import { logger } from "../logger";
import handleError from "./error";
import { RequestError } from "../http-errors";

interface FetchOptions extends RequestInit {
   timeout?: number;
}

function isError(error: unknown): error is Error {
   return error instanceof Error;
}

/**
 * Fetches data from the specified URL with the given options.
 *
 * @template T - The type of the response data.
 * @param {string} url - The URL to fetch data from.
 * @param {FetchOptions} [options={}] - The options for the fetch request.
 * @param {number} [options.timeout=5000] - The timeout for the fetch request in milliseconds.
 * @param {HeadersInit} [options.headers] - Custom headers to include in the fetch request.
 * @param {RequestInit} [options.restOptions] - Additional options for the fetch request.
 * @returns {Promise<ActionResponse<T>>} - A promise that resolves to the response data.
 * @throws {RequestError} - Throws an error if the response is not ok.
 * @throws {Error} - Throws an error if an unknown error occurs.
 */
export async function fetchHandler<T>(
   url: string,
   options: FetchOptions = {}
): Promise<ActionResponse<T>> {
   const {
      timeout = 5000,
      headers: customHeaders = {},
      ...restOptions
   } = options;

   // abort controller allows us to cancel the fetch request, come from the Fetch API
   const controller = new AbortController();
   const id = setTimeout(() => {
      controller.abort();
   }, timeout);

   const defaultHeaders: HeadersInit = {
      "Content-Type": "application/json",
      Accept: "application/json",
   };

   const headers: HeadersInit = { ...defaultHeaders, ...customHeaders };

   const config: RequestInit = {
      ...restOptions,
      headers,
      signal: controller.signal,
   };

   try {
      const response = await fetch(url, config);
      clearTimeout(id);

      if (!response.ok) {
         throw new RequestError(
            response.status,
            `HTTP error: ${response.status}`
         );
      }

      return await response.json();
   } catch (err) {
      const error = isError(err) ? err : new Error("Unknown error");

      if (error.name === "AbortError") {
         logger.warn(`Request to ${url} timed out`);
      } else {
         logger.error(`Error fetching ${url}: ${error.message}`);
      }

      return handleError(error, "api") as ActionResponse<T>;
   }
}
