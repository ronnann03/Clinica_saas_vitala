"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/tenant";
import { notify } from "@/lib/notify";
import type { LabOrderStatus } from "@prisma/client";

export type LabFormState = { error?: string };

export async function createLabCatalogItem(
  _prevState: LabFormState,
  formData: FormData,
): Promise<LabFormState> {
  const { clinicId } = await requireTenant();

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const priceRaw = String(formData.get("price") ?? "").trim();

  if (!name) return { error: "El nombre del examen es obligatorio" };

  await prisma.labCatalogItem.create({
    data: { clinicId, name, description, price: priceRaw || null },
  });

  revalidatePath("/dashboard/laboratorio/catalogo");
  return {};
}

export async function createLabOrder(
  _prevState: LabFormState,
  formData: FormData,
): Promise<LabFormState> {
  const { clinicId } = await requireTenant();

  const patientId = String(formData.get("patientId") ?? "");
  const doctorId = String(formData.get("doctorId") ?? "");
  const examCatalogId = String(formData.get("examCatalogId") ?? "") || null;
  const examNameRaw = String(formData.get("examName") ?? "").trim();

  if (!patientId || !doctorId) {
    return { error: "Paciente y médico son obligatorios" };
  }

  const [patient, doctor] = await Promise.all([
    prisma.patient.findFirst({ where: { id: patientId, clinicId } }),
    prisma.doctor.findFirst({ where: { id: doctorId, clinicId } }),
  ]);
  if (!patient || !doctor) return { error: "Paciente o médico inválido" };

  let examName = examNameRaw;
  if (examCatalogId) {
    const catalogItem = await prisma.labCatalogItem.findFirst({ where: { id: examCatalogId, clinicId } });
    if (catalogItem) examName = catalogItem.name;
  }
  if (!examName) {
    return { error: "Selecciona un examen del catálogo o escribe su nombre" };
  }

  await prisma.labOrder.create({
    data: { clinicId, patientId, doctorId, examCatalogId, examName },
  });

  revalidatePath("/dashboard/laboratorio");
  return {};
}

export async function updateLabOrderStatus(formData: FormData) {
  const { clinicId } = await requireTenant();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as LabOrderStatus;

  await prisma.labOrder.updateMany({
    where: { id, clinicId },
    data: { status, completedAt: status === "completed" ? new Date() : undefined },
  });

  revalidatePath("/dashboard/laboratorio");
  revalidatePath(`/dashboard/laboratorio/${id}`);
}

export async function addLabResult(
  _prevState: LabFormState,
  formData: FormData,
): Promise<LabFormState> {
  const { clinicId } = await requireTenant();
  const id = String(formData.get("id") ?? "");
  const resultNotes = String(formData.get("resultNotes") ?? "").trim() || null;
  const resultFileUrl = String(formData.get("resultFileUrl") ?? "").trim() || null;

  const order = await prisma.labOrder.findFirst({
    where: { id, clinicId },
    include: { patient: true },
  });
  if (!order) return { error: "Orden no encontrada" };

  await prisma.$transaction(async (tx) => {
    await tx.labOrder.update({
      where: { id },
      data: { resultNotes, resultFileUrl, status: "completed", completedAt: new Date() },
    });

    await notify(tx, {
      clinicId,
      type: "lab_result",
      message: `Resultado de laboratorio listo: ${order.examName} — ${order.patient.firstName} ${order.patient.lastName}`,
    });
  });

  revalidatePath("/dashboard/laboratorio");
  revalidatePath(`/dashboard/laboratorio/${id}`);
  revalidatePath("/dashboard/notificaciones");
  redirect("/dashboard/laboratorio");
}
