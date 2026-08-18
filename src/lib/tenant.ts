import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

/**
 * Resolves the active clinic for the current request from the session cookie.
 * Every tenant-scoped query must filter by the returned clinicId.
 */
export async function requireTenant() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return {
    userId: session.user.id,
    clinicId: session.user.clinicId,
    role: session.user.role,
    user: session.user,
  };
}
