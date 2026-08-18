"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePatientSession } from "@/lib/patient-portal";

export type ProfileFormState = { error?: string; success?: boolean };

export async function updateProfile(
  _prevState: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const { patient } = await requirePatientSession();

  const phone = String(formData.get("phone") ?? "").trim() || null;
  const address = String(formData.get("address") ?? "").trim() || null;
  const emergencyContactName = String(formData.get("emergencyContactName") ?? "").trim() || null;
  const emergencyContactPhone = String(formData.get("emergencyContactPhone") ?? "").trim() || null;

  await prisma.patient.update({
    where: { id: patient.id },
    data: {
      phone,
      address,
      emergencyContact:
        emergencyContactName || emergencyContactPhone
          ? { name: emergencyContactName ?? undefined, phone: emergencyContactPhone ?? undefined }
          : undefined,
    },
  });

  revalidatePath("/portal/perfil");
  return { success: true };
}
