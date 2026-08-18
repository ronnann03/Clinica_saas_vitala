"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/tenant";

export async function markAsRead(formData: FormData) {
  const { clinicId } = await requireTenant();
  const id = String(formData.get("id") ?? "");

  await prisma.notification.updateMany({
    where: { id, clinicId },
    data: { readAt: new Date() },
  });

  revalidatePath("/dashboard/notificaciones");
}

export async function markAllAsRead() {
  const { clinicId, userId } = await requireTenant();

  await prisma.notification.updateMany({
    where: {
      clinicId,
      readAt: null,
      OR: [{ userId: null }, { userId }],
    },
    data: { readAt: new Date() },
  });

  revalidatePath("/dashboard/notificaciones");
}
