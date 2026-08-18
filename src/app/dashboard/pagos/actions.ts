"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/tenant";
import { notify } from "@/lib/notify";
import type { PaymentMethod, PaymentStatus } from "@prisma/client";

export type PaymentFormState = { error?: string };

function generateReceiptNumber() {
  return `REC-${Date.now().toString(36).toUpperCase()}`;
}

function computeStatus(amount: number, amountPaid: number): PaymentStatus {
  if (amountPaid <= 0) return "pending";
  if (amountPaid >= amount) return "paid";
  return "partial";
}

export async function createPayment(
  _prevState: PaymentFormState,
  formData: FormData,
): Promise<PaymentFormState> {
  const { clinicId } = await requireTenant();

  const patientId = String(formData.get("patientId") ?? "");
  const appointmentId = String(formData.get("appointmentId") ?? "") || null;
  const amountRaw = String(formData.get("amount") ?? "");
  const paymentState = String(formData.get("paymentState") ?? "full");
  const amountPaidRaw = String(formData.get("amountPaid") ?? "");
  const method = String(formData.get("method") ?? "") as PaymentMethod;
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!patientId || !amountRaw || !method) {
    return { error: "Paciente, monto y método de pago son obligatorios" };
  }

  const amount = Number(amountRaw);
  if (!Number.isFinite(amount) || amount <= 0) {
    return { error: "El monto debe ser mayor a 0" };
  }

  let amountPaid = 0;
  if (paymentState === "full") amountPaid = amount;
  else if (paymentState === "partial") amountPaid = Number(amountPaidRaw || "0");

  if (amountPaid < 0 || amountPaid > amount) {
    return { error: "El monto pagado no puede ser mayor al monto total" };
  }

  const patient = await prisma.patient.findFirst({ where: { id: patientId, clinicId } });
  if (!patient) return { error: "Paciente inválido" };

  const status = computeStatus(amount, amountPaid);

  await prisma.$transaction(async (tx) => {
    await tx.payment.create({
      data: {
        clinicId,
        patientId,
        appointmentId,
        amount,
        amountPaid,
        status,
        method,
        notes,
        receiptNumber: generateReceiptNumber(),
        paidAt: status === "paid" ? new Date() : null,
      },
    });

    await notify(tx, {
      clinicId,
      type: status === "paid" ? "payment_received" : "payment_pending",
      message:
        status === "paid"
          ? `Pago recibido: S/ ${amount.toFixed(2)} de ${patient.firstName} ${patient.lastName}`
          : `Pago pendiente: S/ ${(amount - amountPaid).toFixed(2)} de ${patient.firstName} ${patient.lastName}`,
    });
  });

  revalidatePath("/dashboard/pagos");
  revalidatePath("/dashboard/notificaciones");
  revalidatePath("/dashboard");
  return {};
}

export async function registerAdditionalPayment(
  _prevState: PaymentFormState,
  formData: FormData,
): Promise<PaymentFormState> {
  const { clinicId } = await requireTenant();
  const id = String(formData.get("id") ?? "");
  const amountRaw = String(formData.get("amount") ?? "");
  const method = String(formData.get("method") ?? "") as PaymentMethod;

  if (!amountRaw || !method) {
    return { error: "Monto y método de pago son obligatorios" };
  }

  const payment = await prisma.payment.findFirst({ where: { id, clinicId }, include: { patient: true } });
  if (!payment) return { error: "Pago no encontrado" };

  const addAmount = Number(amountRaw);
  if (!Number.isFinite(addAmount) || addAmount <= 0) {
    return { error: "Ingresa un monto válido" };
  }

  const amountTotal = payment.amount.toNumber();
  const newAmountPaid = payment.amountPaid.toNumber() + addAmount;
  if (newAmountPaid > amountTotal) {
    return { error: "El abono excede el saldo pendiente" };
  }

  const status = computeStatus(amountTotal, newAmountPaid);

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id },
      data: {
        amountPaid: newAmountPaid,
        status,
        method,
        paidAt: status === "paid" ? new Date() : payment.paidAt,
      },
    });

    if (status === "paid") {
      await notify(tx, {
        clinicId,
        type: "payment_received",
        message: `Pago recibido: S/ ${amountTotal.toFixed(2)} de ${payment.patient.firstName} ${payment.patient.lastName} (saldado)`,
      });
    }
  });

  revalidatePath("/dashboard/pagos");
  revalidatePath("/dashboard/notificaciones");
  revalidatePath("/dashboard");
  redirect("/dashboard/pagos");
}

export async function updatePaymentStatus(formData: FormData) {
  const { clinicId } = await requireTenant();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as PaymentStatus;

  await prisma.payment.updateMany({
    where: { id, clinicId },
    data: { status },
  });

  revalidatePath("/dashboard/pagos");
  revalidatePath("/dashboard");
}
