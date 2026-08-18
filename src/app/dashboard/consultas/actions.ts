"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/tenant";

export type ConsultationFormState = { error?: string };

function numOrUndefined(value: FormDataEntryValue | null) {
  const str = String(value ?? "").trim();
  if (!str) return undefined;
  const n = Number(str);
  return Number.isFinite(n) ? n : undefined;
}

export async function createConsultation(
  _prevState: ConsultationFormState,
  formData: FormData,
): Promise<ConsultationFormState> {
  const { clinicId } = await requireTenant();

  const patientId = String(formData.get("patientId") ?? "");
  const doctorId = String(formData.get("doctorId") ?? "");
  const appointmentId = String(formData.get("appointmentId") ?? "") || null;
  const chiefComplaint = String(formData.get("chiefComplaint") ?? "").trim() || null;
  const anamnesis = String(formData.get("anamnesis") ?? "").trim() || null;
  const physicalExam = String(formData.get("physicalExam") ?? "").trim() || null;
  const diagnosis = String(formData.get("diagnosis") ?? "").trim() || null;
  const treatment = String(formData.get("treatment") ?? "").trim() || null;
  const observations = String(formData.get("observations") ?? "").trim() || null;
  const evolution = String(formData.get("evolution") ?? "").trim() || null;
  const nextAppointmentDate = String(formData.get("nextAppointmentDate") ?? "").trim() || null;
  const prescriptionNotes = String(formData.get("prescriptionNotes") ?? "").trim() || null;

  if (!patientId || !doctorId) {
    return { error: "Paciente y médico son obligatorios" };
  }

  const [patient, doctor] = await Promise.all([
    prisma.patient.findFirst({ where: { id: patientId, clinicId } }),
    prisma.doctor.findFirst({ where: { id: doctorId, clinicId } }),
  ]);
  if (!patient || !doctor) {
    return { error: "Paciente o médico inválido" };
  }

  const vitalSigns = {
    bloodPressure: String(formData.get("bloodPressure") ?? "").trim() || undefined,
    heartRate: numOrUndefined(formData.get("heartRate")),
    respiratoryRate: numOrUndefined(formData.get("respiratoryRate")),
    temperature: numOrUndefined(formData.get("temperature")),
    oxygenSaturation: numOrUndefined(formData.get("oxygenSaturation")),
    weightKg: numOrUndefined(formData.get("weightKg")),
    heightCm: numOrUndefined(formData.get("heightCm")),
  };
  const hasVitalSigns = Object.values(vitalSigns).some((v) => v !== undefined);

  await prisma.$transaction(async (tx) => {
    const consultation = await tx.consultation.create({
      data: {
        clinicId,
        appointmentId,
        patientId,
        doctorId,
        chiefComplaint,
        anamnesis,
        vitalSigns: hasVitalSigns ? vitalSigns : undefined,
        physicalExam,
        diagnosis,
        treatment,
        observations,
        evolution,
        nextAppointmentSuggestedAt: nextAppointmentDate,
      },
    });

    if (prescriptionNotes) {
      await tx.prescription.create({
        data: {
          clinicId,
          consultationId: consultation.id,
          patientId,
          doctorId,
          notes: prescriptionNotes,
        },
      });
    }

    if (appointmentId) {
      await tx.appointment.updateMany({
        where: { id: appointmentId, clinicId },
        data: { status: "completed" },
      });
    }
  });

  revalidatePath("/dashboard/consultas");
  revalidatePath("/dashboard/citas");
  revalidatePath("/dashboard");
  redirect("/dashboard/consultas");
}
