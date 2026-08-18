import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** Resolves the current patient-portal session: the logged-in user plus their linked Patient record. */
export async function requirePatientSession() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.user.role !== "paciente") redirect("/dashboard");

  const patient = await prisma.patient.findFirst({ where: { userId: session.user.id } });
  if (!patient) redirect("/login");

  return { user: session.user, patient, clinicId: session.user.clinicId };
}
