"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/tenant";
import { hashPassword } from "@/lib/auth";

export async function createPatient(formData: FormData) {
  const { clinicId } = await requireTenant();

  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const documentId = String(formData.get("documentId") ?? "").trim() || null;
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const email = String(formData.get("email") ?? "").trim() || null;
  const dobRaw = String(formData.get("dob") ?? "").trim();

  if (!firstName || !lastName) {
    throw new Error("Nombre y apellido son obligatorios");
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("El email no tiene un formato válido");
  }

  await prisma.patient.create({
    data: {
      clinicId,
      firstName,
      lastName,
      documentId,
      phone,
      email,
      dob: dobRaw ? new Date(dobRaw) : null,
    },
  });

  revalidatePath("/dashboard/pacientes");
}

export type PortalAccessFormState = { error?: string; success?: { email: string; tempPassword: string } };

export async function activatePortalAccess(
  _prevState: PortalAccessFormState,
  formData: FormData,
): Promise<PortalAccessFormState> {
  const { clinicId } = await requireTenant();

  const patientId = String(formData.get("patientId") ?? "");
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!patientId || !email) {
    return { error: "El email es obligatorio" };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "El email no tiene un formato válido" };
  }

  const patient = await prisma.patient.findFirst({ where: { id: patientId, clinicId } });
  if (!patient) return { error: "Paciente no encontrado" };
  if (patient.userId) return { error: "Este paciente ya tiene acceso al portal" };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "Ya existe una cuenta con ese email" };

  const tempPassword = randomBytes(9).toString("base64url");
  const passwordHash = await hashPassword(tempPassword);

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        clinicId,
        role: "paciente",
        firstName: patient.firstName,
        lastName: patient.lastName,
        email,
        passwordHash,
      },
    });
    await tx.patient.update({ where: { id: patientId }, data: { userId: user.id, email } });
  });

  revalidatePath(`/dashboard/pacientes/${patientId}`);
  return { success: { email, tempPassword } };
}
