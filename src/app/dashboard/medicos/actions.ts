"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/tenant";
import { hashPassword } from "@/lib/auth";

export type DoctorFormState = { error?: string; success?: { email: string; tempPassword: string } };

function generateTempPassword() {
  return randomBytes(9).toString("base64url");
}

export async function createDoctor(
  _prevState: DoctorFormState,
  formData: FormData,
): Promise<DoctorFormState> {
  const { clinicId } = await requireTenant();

  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const specialtyName = String(formData.get("specialty") ?? "").trim();
  const licenseNumber = String(formData.get("licenseNumber") ?? "").trim() || null;
  const consultorio = String(formData.get("consultorio") ?? "").trim() || null;
  const feeRaw = String(formData.get("consultationFee") ?? "").trim();
  const durationRaw = String(formData.get("consultationDurationMinutes") ?? "").trim();

  if (!firstName || !lastName || !email) {
    return { error: "Nombres, apellidos y email son obligatorios" };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "El email no tiene un formato válido" };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Ya existe una cuenta con ese email" };
  }

  const tempPassword = generateTempPassword();
  const passwordHash = await hashPassword(tempPassword);

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        clinicId,
        role: "medico",
        firstName,
        lastName,
        email,
        passwordHash,
      },
    });

    let specialtyId: string | null = null;
    if (specialtyName) {
      const specialty = await tx.specialty.upsert({
        where: { clinicId_name: { clinicId, name: specialtyName } },
        create: { clinicId, name: specialtyName },
        update: {},
      });
      specialtyId = specialty.id;
    }

    await tx.doctor.create({
      data: {
        clinicId,
        userId: user.id,
        specialtyId,
        licenseNumber,
        consultorio,
        consultationFee: feeRaw ? feeRaw : null,
        consultationDurationMinutes: durationRaw ? Number(durationRaw) : 30,
      },
    });
  });

  revalidatePath("/dashboard/medicos");
  return { success: { email, tempPassword } };
}
