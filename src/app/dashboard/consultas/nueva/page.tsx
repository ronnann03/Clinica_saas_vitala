import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/tenant";
import { ConsultationForm } from "@/components/consultations/consultation-form";

export default async function NuevaConsultaPage() {
  const { clinicId } = await requireTenant();

  const [patients, doctors, appointments] = await Promise.all([
    prisma.patient.findMany({
      where: { clinicId },
      orderBy: { firstName: "asc" },
      select: { id: true, firstName: true, lastName: true },
    }),
    prisma.doctor.findMany({
      where: { clinicId },
      include: { user: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.appointment.findMany({
      where: { clinicId },
      include: { patient: true, doctor: { include: { user: true } } },
      orderBy: { scheduledAt: "desc" },
      take: 100,
    }),
  ]);

  if (patients.length === 0 || doctors.length === 0) {
    return (
      <div className="mx-auto max-w-md rounded-lg border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">
        Necesitas al menos un paciente y un médico registrados antes de crear
        una consulta.{" "}
        <div className="mt-2 flex gap-3">
          {patients.length === 0 && (
            <Link href="/dashboard/pacientes" className="font-medium underline">Registrar paciente</Link>
          )}
          {doctors.length === 0 && (
            <Link href="/dashboard/medicos" className="font-medium underline">Registrar médico</Link>
          )}
        </div>
      </div>
    );
  }

  const patientOptions = patients.map((p) => ({ id: p.id, label: `${p.firstName} ${p.lastName}` }));
  const doctorOptions = doctors.map((d) => ({ id: d.id, label: `Dr(a). ${d.user.firstName} ${d.user.lastName}` }));
  const appointmentOptions = appointments.map((a) => ({
    id: a.id,
    label: `${a.patient.firstName} ${a.patient.lastName} — ${a.scheduledAt.toLocaleDateString("es-PE")} — Dr(a). ${a.doctor.user.lastName}`,
  }));

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-xl font-semibold text-slate-900">Nueva consulta médica</h1>
      <p className="mt-1 text-sm text-slate-500">Registra la atención del paciente.</p>

      <div className="mt-6">
        <ConsultationForm patients={patientOptions} doctors={doctorOptions} appointments={appointmentOptions} />
      </div>
    </div>
  );
}
