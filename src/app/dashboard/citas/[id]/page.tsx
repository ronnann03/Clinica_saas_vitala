import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/tenant";
import { RescheduleForm } from "@/components/appointments/reschedule-form";

export default async function ReprogramarCitaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { clinicId } = await requireTenant();

  const appointment = await prisma.appointment.findFirst({
    where: { id, clinicId },
    include: { patient: true, doctor: { include: { user: true } } },
  });

  if (!appointment) notFound();

  const scheduled = appointment.scheduledAt;
  const pad = (n: number) => String(n).padStart(2, "0");
  const currentDate = `${scheduled.getFullYear()}-${pad(scheduled.getMonth() + 1)}-${pad(scheduled.getDate())}`;
  const currentTime = `${pad(scheduled.getHours())}:${pad(scheduled.getMinutes())}`;

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-xl font-semibold text-slate-900">Reprogramar cita</h1>
      <p className="mt-1 text-sm text-slate-500">
        {appointment.patient.firstName} {appointment.patient.lastName} con Dr(a).{" "}
        {appointment.doctor.user.firstName} {appointment.doctor.user.lastName}
      </p>

      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-6">
        <RescheduleForm id={appointment.id} defaultDate={currentDate} defaultTime={currentTime} />
      </div>
    </div>
  );
}
