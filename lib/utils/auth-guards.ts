// Server-side authorization helpers.
// Deliberately NOT a "use server" file: everything exported from one of those
// becomes a public endpoint, and these helpers must only be called by server code.
import { auth } from "@/auth";
import { ADMINROLE } from "@/types/constants";
import type { ActionResult } from "@/types";
import type { Session } from "next-auth";

export function isAdminSession(session: Session | null | undefined): boolean {
  return session?.user?.role === ADMINROLE;
}

/** Returns the session if the caller is an admin, otherwise null. */
export async function getAdminSession(): Promise<Session | null> {
  const session = await auth();
  return isAdminSession(session) ? session : null;
}

export const UNAUTHORIZED_RESULT: ActionResult = {
  success: false,
  message: "You are not authorised to do that.",
};

/**
 * Call at the top of every Server Action that changes data.
 * Returns an ActionResult to send back when the caller isn't an admin, or null when they are.
 *
 *   const denied = await requireAdmin();
 *   if (denied) return denied;
 */
export async function requireAdmin(): Promise<ActionResult | null> {
  return (await getAdminSession()) ? null : UNAUTHORIZED_RESULT;
}
