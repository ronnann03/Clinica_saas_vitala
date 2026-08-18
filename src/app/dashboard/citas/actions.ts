"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/tenant";
import { notify } from "@/lib/notify";
import type { AppointmentStatus } from "@prisma/client";

export type AppointmentFormState = { error?: string };

const STATUS_MESSAGES: Partial<Record<AppointmentStatus, string>> = {
  confirmed: "Cita confirmada",
  cancelled: "Cita cancelada",
  completed: "Cita completada",
  no_show: "El paciente no asistió a su cita",
  waiting_list: "Cita movida a lista de espera",
};

function combineDateTime(dateStr: string, timeStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hours, minutes] = timeStr.split(":").map(Number);
  return new Date(year, month - 1, day, hours, minutes);
}

function formatDateTime(date: Date) {
  return date.toLocaleString("es-PE", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export async function createAppointment(
  _prevState: AppointmentFormState,
  formData: FormData,
): Promise<AppointmentFormState> {
  const { clinicId, userId } = await requireTenant();

  const patientId = String(formData.get("patientId") ?? "");
  const doctorId = String(formData.get("doctorId") ?? "");
  const date = String(formData.get("date") ?? "");
  const time = String(formData.get("time") ?? "");
  const durationRaw = String(formData.get("durationMinutes") ?? "30");
  const reason = String(formData.get("reason") ?? "").trim() || null;

  if (!patientId || !doctorId || !date || !time) {
    return { error: "Paciente, médico, fecha y hora son obligatorios" };
  }

  const patient = await prisma.patient.findFirst({ where: { id: patientId, clinicId } });
  const doctor = await prisma.doctor.findFirst({ where: { id: doctorId, clinicId }, include: { user: true } });
  if (!patient || !doctor) {
    return { error: "Paciente o médico inválido" };
  }

  const scheduledAt = combineDateTime(date, time);

  await prisma.$transaction(async (tx) => {
    await tx.appointment.create({
      data: {
        clinicId,
        patientId,
        doctorId,
        specialtyId: doctor.specialtyId,
        scheduledAt,
        durationMinutes: Number(durationRaw) || 30,
        reason,
        createdById: userId,
      },
    });

    await notify(tx, {
      clinicId,
      userId: doctor.userId,
      type: "appointment_created",
      message: `Nueva cita: ${patient.firstName} ${patient.lastName} el ${formatDateTime(scheduledAt)}`,
    });
  });

  revalidatePath("/dashboard/citas");
  revalidatePath("/dashboard/notificaciones");
  revalidatePath("/dashboard");
  return {};
}

export async function updateAppointmentStatus(formData: FormData) {
  const { clinicId } = await requireTenant();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as AppointmentStatus;

  const appointment = await prisma.appointment.findFirst({
    where: { id, clinicId },
    include: { patient: true, doctor: true },
  });
  if (!appointment) return;

  const message = STATUS_MESSAGES[status];

  await prisma.$transaction(async (tx) => {
    await tx.appointment.update({ where: { id }, data: { status } });

    if (message) {
      await notify(tx, {
        clinicId,
        userId: appointment.doctor.userId,
        type: `appointment_${status}`,
        message: `${message}: ${appointment.patient.firstName} ${appointment.patient.lastName} — ${formatDateTime(appointment.scheduledAt)}`,
      });
    }
  });

  revalidatePath("/dashboard/citas");
  revalidatePath("/dashboard/notificaciones");
  revalidatePath("/dashboard");
}

export async function rescheduleAppointment(
  _prevState: AppointmentFormState,
  formData: FormData,
): Promise<AppointmentFormState> {
  const { clinicId } = await requireTenant();

  const id = String(formData.get("id") ?? "");
  const date = String(formData.get("date") ?? "");
  const time = String(formData.get("time") ?? "");

  if (!id || !date || !time) {
    return { error: "Fecha y hora son obligatorias" };
  }

  const appointment = await prisma.appointment.findFirst({
    where: { id, clinicId },
    include: { patient: true, doctor: true },
  });
  if (!appointment) {
    return { error: "Cita no encontrada" };
  }

  const scheduledAt = combineDateTime(date, time);

  await prisma.$transaction(async (tx) => {
    await tx.appointment.update({
      where: { id },
      data: { scheduledAt, status: "confirmed" },
    });

    await notify(tx, {
      clinicId,
      userId: appointment.doctor.userId,
      type: "appointment_rescheduled",
      message: `Cita reprogramada: ${appointment.patient.firstName} ${appointment.patient.lastName} ahora el ${formatDateTime(scheduledAt)}`,
    });
  });

  revalidatePath("/dashboard/citas");
  revalidatePath("/dashboard/notificaciones");
  revalidatePath("/dashboard");
  redirect("/dashboard/citas");
}
