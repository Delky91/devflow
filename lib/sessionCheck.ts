import { redirect } from "next/navigation";

import { auth } from "@/auth";
import ROUTES from "@/constants/routes";

/**
 * Checks the current session and redirects to the sign-in page if no session is found.
 *
 * @returns {Promise<null | void>} - Returns null if a session is found, otherwise redirects to the sign-in page.
 */
export const sessionCheckAndRedirect = async (): Promise<null | void> => {
   const session = await auth();
   if (!session) return redirect(ROUTES.SIGN_IN);
   return null;
};
