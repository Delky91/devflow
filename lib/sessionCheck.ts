import { redirect } from "next/navigation";
import { Session } from "next-auth";

import { auth } from "@/auth";
import ROUTES from "@/constants/routes";

/**
 * Checks the user's session and redirects if necessary.
 *
 * @param {boolean} [needSession=false] - Indicates whether a session is required.
 * @returns {Promise<null | Session>} - Returns the session if it exists and is required, otherwise null.
 */
export const sessionCheckAndRedirect = async (needSession: boolean = false): Promise<null | Session> => {
   const session = await auth();

   if (!session) return redirect(ROUTES.SIGN_IN);
   if (!needSession) return null;

   return session;
};
