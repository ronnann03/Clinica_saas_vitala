"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePatientSession } from "@/lib/patient-portal";
import { notify } from "@/lib/notify";

export type PortalAppointmentFormState = { error?: string };

function combineDateTime(dateStr: string, timeStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hours, minutes] = timeStr.split(":").map(Number);
  return new Date(year, month - 1, day, hours, minutes);
}

export async function requestAppointment(
  _prevState: PortalAppointmentFormState,
  formData: FormData,
): Promise<PortalAppointmentFormState> {
  const { patient, clinicId } = await requirePatientSession();

  const doctorId = String(formData.get("doctorId") ?? "");
  const date = String(formData.get("date") ?? "");
  const time = String(formData.get("time") ?? "");
  const reason = String(formData.get("reason") ?? "").trim() || null;

  if (!doctorId || !date || !time) {
    return { error: "Médico, fecha y hora son obligatorios" };
  }

  const doctor = await prisma.doctor.findFirst({ where: { id: doctorId, clinicId } });
  if (!doctor) return { error: "Médico inválido" };

  const scheduledAt = combineDateTime(date, time);
  if (scheduledAt.getTime() < Date.now()) {
    return { error: "Elige una fecha futura" };
  }

  await prisma.$transaction(async (tx) => {
    await tx.appointment.create({
      data: {
        clinicId,
        patientId: patient.id,
        doctorId,
        specialtyId: doctor.specialtyId,
        scheduledAt,
        durationMinutes: doctor.consultationDurationMinutes,
        reason,
        status: "pending",
        createdById: patient.id,
      },
    });

    await notify(tx, {
      clinicId,
      userId: doctor.userId,
      type: "appointment_created",
      message: `Nueva solicitud de cita: ${patient.firstName} ${patient.lastName} el ${scheduledAt.toLocaleString("es-PE", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}`,
    });
  });

  revalidatePath("/portal/citas");
  revalidatePath("/dashboard/citas");
  revalidatePath("/dashboard/notificaciones");
  return {};
}
