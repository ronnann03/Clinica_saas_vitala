"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/tenant";
import { hashPassword, verifyPassword } from "@/lib/auth";

export type ProfileFormState = { error?: string; success?: boolean };

export async function updateOwnProfile(
  _prevState: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const { userId } = await requireTenant();

  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim() || null;

  if (!firstName || !lastName) {
    return { error: "Nombres y apellidos son obligatorios" };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { firstName, lastName, phone },
  });

  revalidatePath("/dashboard/perfil");
  return { success: true };
}

export type PasswordFormState = { error?: string; success?: boolean };

export async function changeOwnPassword(
  _prevState: PasswordFormState,
  formData: FormData,
): Promise<PasswordFormState> {
  const { userId } = await requireTenant();

  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: "Completa todos los campos" };
  }
  if (newPassword.length < 8) {
    return { error: "La nueva contraseña debe tener al menos 8 caracteres" };
  }
  if (newPassword !== confirmPassword) {
    return { error: "Las contraseñas nuevas no coinciden" };
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { error: "Usuario no encontrado" };

  const valid = await verifyPassword(currentPassword, user.passwordHash);
  if (!valid) {
    return { error: "La contraseña actual es incorrecta" };
  }

  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });

  return { success: true };
}
