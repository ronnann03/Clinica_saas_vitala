"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession, hashPassword } from "@/lib/auth";
import { slugify } from "@/lib/slug";

export type AuthFormState = { error?: string };

export async function registerClinic(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const clinicName = String(formData.get("clinicName") ?? "").trim();
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!clinicName || !firstName || !lastName || !email || !password) {
    return { error: "Todos los campos son obligatorios" };
  }
  if (password.length < 8) {
    return { error: "La contraseña debe tener al menos 8 caracteres" };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Ya existe una cuenta con ese email" };
  }

  const baseSlug = slugify(clinicName) || "clinica";
  let slug = baseSlug;
  let attempt = 0;
  while (await prisma.clinic.findUnique({ where: { slug } })) {
    attempt += 1;
    slug = `${baseSlug}-${attempt}`;
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.$transaction(async (tx) => {
    const clinic = await tx.clinic.create({
      data: { name: clinicName, slug },
    });
    return tx.user.create({
      data: {
        clinicId: clinic.id,
        role: "admin",
        firstName,
        lastName,
        email,
        passwordHash,
      },
    });
  });

  await createSession(user.id);
  redirect("/dashboard");
}
