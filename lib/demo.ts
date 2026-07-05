import { auth } from "@/auth";

/**
 * Checks if the current logged-in user is the demo user.
 * If yes, throws a descriptive error to block the mutation.
 */
export async function checkDemoRestriction(actionName?: string) {
  const session = await auth();
  if (session?.user?.email === "demo@freelancer.com") {
    const actionDesc = actionName ? ` to ${actionName}` : "s";
    throw new Error(`Demo Mode: Permissions${actionDesc} are disabled for the demo account.`);
  }
}
