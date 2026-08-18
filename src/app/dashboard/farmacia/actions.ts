"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/tenant";

export type PharmacyFormState = { error?: string };

export async function createMedication(
  _prevState: PharmacyFormState,
  formData: FormData,
): Promise<PharmacyFormState> {
  const { clinicId } = await requireTenant();

  const name = String(formData.get("name") ?? "").trim();
  const presentation = String(formData.get("presentation") ?? "").trim() || null;
  const unit = String(formData.get("unit") ?? "unidad").trim() || "unidad";
  const reorderLevelRaw = String(formData.get("reorderLevel") ?? "0");

  if (!name) {
    return { error: "El nombre es obligatorio" };
  }

  await prisma.medication.create({
    data: {
      clinicId,
      name,
      presentation,
      unit,
      reorderLevel: Math.max(0, Math.floor(Number(reorderLevelRaw) || 0)),
    },
  });

  revalidatePath("/dashboard/farmacia");
  return {};
}

export async function registerEntry(
  _prevState: PharmacyFormState,
  formData: FormData,
): Promise<PharmacyFormState> {
  const { clinicId } = await requireTenant();

  const medicationId = String(formData.get("medicationId") ?? "");
  const batchNumber = String(formData.get("batchNumber") ?? "").trim() || null;
  const expirationDate = String(formData.get("expirationDate") ?? "").trim() || null;
  const quantityRaw = String(formData.get("quantity") ?? "");

  const medication = await prisma.medication.findFirst({ where: { id: medicationId, clinicId } });
  if (!medication) return { error: "Medicamento no encontrado" };

  const quantity = Math.floor(Number(quantityRaw));
  if (!Number.isFinite(quantity) || quantity <= 0) {
    return { error: "La cantidad debe ser mayor a 0" };
  }

  await prisma.$transaction(async (tx) => {
    const batch = await tx.medicationBatch.create({
      data: {
        medicationId,
        batchNumber,
        expirationDate: expirationDate ? new Date(expirationDate) : null,
        quantity,
      },
    });

    await tx.medicationMovement.create({
      data: { medicationId, batchId: batch.id, type: "in", quantity, reason: "Ingreso de lote" },
    });
  });

  revalidatePath("/dashboard/farmacia");
  revalidatePath(`/dashboard/farmacia/${medicationId}`);
  redirect(`/dashboard/farmacia/${medicationId}`);
}

export async function registerExit(
  _prevState: PharmacyFormState,
  formData: FormData,
): Promise<PharmacyFormState> {
  const { clinicId } = await requireTenant();

  const medicationId = String(formData.get("medicationId") ?? "");
  const batchId = String(formData.get("batchId") ?? "");
  const quantityRaw = String(formData.get("quantity") ?? "");
  const reason = String(formData.get("reason") ?? "").trim() || null;

  const medication = await prisma.medication.findFirst({ where: { id: medicationId, clinicId } });
  if (!medication) return { error: "Medicamento no encontrado" };

  const batch = await prisma.medicationBatch.findFirst({ where: { id: batchId, medicationId } });
  if (!batch) return { error: "Selecciona un lote válido" };

  const quantity = Math.floor(Number(quantityRaw));
  if (!Number.isFinite(quantity) || quantity <= 0) {
    return { error: "La cantidad debe ser mayor a 0" };
  }
  if (quantity > batch.quantity) {
    return { error: `El lote solo tiene ${batch.quantity} unidades disponibles` };
  }

  await prisma.$transaction(async (tx) => {
    await tx.medicationBatch.update({
      where: { id: batchId },
      data: { quantity: { decrement: quantity } },
    });
    await tx.medicationMovement.create({
      data: { medicationId, batchId, type: "out", quantity, reason },
    });
  });

  revalidatePath("/dashboard/farmacia");
  revalidatePath(`/dashboard/farmacia/${medicationId}`);
  redirect(`/dashboard/farmacia/${medicationId}`);
}

export async function markPrescriptionDispensed(formData: FormData) {
  const { clinicId } = await requireTenant();
  const id = String(formData.get("id") ?? "");

  await prisma.prescription.updateMany({
    where: { id, clinicId },
    data: { dispensedAt: new Date() },
  });

  revalidatePath("/dashboard/farmacia/recetas");
}
