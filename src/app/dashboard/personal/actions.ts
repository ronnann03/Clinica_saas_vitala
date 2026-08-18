"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/tenant";
import { hashPassword } from "@/lib/auth";
import { ASSIGNABLE_STAFF_ROLES } from "@/lib/roles";
import type { UserRole } from "@prisma/client";

export type StaffFormState = { error?: string; success?: { email: string; tempPassword: string } };

function generateTempPassword() {
  return randomBytes(9).toString("base64url");
}

export async function createStaffMember(
  _prevState: StaffFormState,
  formData: FormData,
): Promise<StaffFormState> {
  const { clinicId } = await requireTenant();

  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const role = String(formData.get("role") ?? "") as UserRole;
  const phone = String(formData.get("phone") ?? "").trim() || null;

  if (!firstName || !lastName || !email || !role) {
    return { error: "Nombres, apellidos, email y rol son obligatorios" };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "El email no tiene un formato válido" };
  }
  if (!ASSIGNABLE_STAFF_ROLES.includes(role)) {
    return { error: "Rol inválido" };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Ya existe una cuenta con ese email" };
  }

  const tempPassword = generateTempPassword();
  const passwordHash = await hashPassword(tempPassword);

  await prisma.user.create({
    data: { clinicId, role, firstName, lastName, email, phone, passwordHash },
  });

  revalidatePath("/dashboard/personal");
  return { success: { email, tempPassword } };
}

export async function toggleActive(formData: FormData) {
  const { clinicId } = await requireTenant();
  const id = String(formData.get("id") ?? "");
  const active = String(formData.get("active") ?? "") === "true";

  await prisma.user.updateMany({
    where: { id, clinicId },
    data: { active: !active },
  });

  revalidatePath("/dashboard/personal");
}

export type ShiftFormState = { error?: string };

export async function addShift(
  _prevState: ShiftFormState,
  formData: FormData,
): Promise<ShiftFormState> {
  const { clinicId } = await requireTenant();
  const userId = String(formData.get("userId") ?? "");
  const dayOfWeek = Number(formData.get("dayOfWeek"));
  const startTime = String(formData.get("startTime") ?? "");
  const endTime = String(formData.get("endTime") ?? "");

  if (!userId || Number.isNaN(dayOfWeek) || !startTime || !endTime) {
    return { error: "Completa todos los campos" };
  }
  if (startTime >= endTime) {
    return { error: "La hora de inicio debe ser anterior a la de fin" };
  }

  const user = await prisma.user.findFirst({ where: { id: userId, clinicId } });
  if (!user) return { error: "Usuario no encontrado" };

  await prisma.staffShift.create({
    data: {
      clinicId,
      userId,
      dayOfWeek,
      startTime: new Date(`1970-01-01T${startTime}:00Z`),
      endTime: new Date(`1970-01-01T${endTime}:00Z`),
    },
  });

  revalidatePath(`/dashboard/personal/${userId}`);
  return {};
}

export async function deleteShift(formData: FormData) {
  const { clinicId } = await requireTenant();
  const id = String(formData.get("id") ?? "");
  const userId = String(formData.get("userId") ?? "");

  await prisma.staffShift.deleteMany({ where: { id, clinicId } });

  revalidatePath(`/dashboard/personal/${userId}`);
}

function todayUTC() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export async function checkIn(formData: FormData) {
  const { clinicId } = await requireTenant();
  const userId = String(formData.get("userId") ?? "");
  const today = todayUTC();

  const existing = await prisma.attendanceRecord.findFirst({
    where: { userId, clinicId, date: today },
  });

  if (existing) {
    await prisma.attendanceRecord.update({ where: { id: existing.id }, data: { checkIn: new Date() } });
  } else {
    await prisma.attendanceRecord.create({
      data: { clinicId, userId, date: today, checkIn: new Date() },
    });
  }

  revalidatePath(`/dashboard/personal/${userId}`);
}

export async function checkOut(formData: FormData) {
  const { clinicId } = await requireTenant();
  const userId = String(formData.get("userId") ?? "");
  const today = todayUTC();

  await prisma.attendanceRecord.updateMany({
    where: { userId, clinicId, date: today },
    data: { checkOut: new Date() },
  });

  revalidatePath(`/dashboard/personal/${userId}`);
}
