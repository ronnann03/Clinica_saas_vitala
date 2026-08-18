import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/tenant";
import { NewAppointmentDialog } from "@/components/appointments/new-appointment-dialog";
import { StatusSelect } from "@/components/appointments/status-select";

export default async function CitasPage() {
  const { clinicId } = await requireTenant();

  const [appointments, patients, doctors] = await Promise.all([
    prisma.appointment.findMany({
      where: { clinicId },
      include: { patient: true, doctor: { include: { user: true } } },
      orderBy: { scheduledAt: "asc" },
    }),
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
  ]);

  const patientOptions = patients.map((p) => ({
    id: p.id,
    label: `${p.firstName} ${p.lastName}`,
  }));
  const doctorOptions = doctors.map((d) => ({
    id: d.id,
    label: `Dr(a). ${d.user.firstName} ${d.user.lastName}`,
  }));

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Citas</h1>
          <p className="mt-1 text-sm text-slate-500">
            {appointments.length} cita{appointments.length === 1 ? "" : "s"} registrada
            {appointments.length === 1 ? "" : "s"}.
          </p>
        </div>
        <NewAppointmentDialog patients={patientOptions} doctors={doctorOptions} />
      </div>

      {doctors.length === 0 && (
        <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Aún no tienes médicos registrados.{" "}
          <Link href="/dashboard/medicos" className="font-medium underline">
            Agrega uno aquí
          </Link>{" "}
          para poder crear citas.
        </p>
      )}

      <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Fecha y hora</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Paciente</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Médico</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Motivo</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Estado</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {appointments.map((appt) => (
              <tr key={appt.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-sm text-slate-900">
                  {appt.scheduledAt.toLocaleString("es-PE", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-slate-900">
                  <Link href={`/dashboard/pacientes/${appt.patientId}`} className="hover:text-teal-700">
                    {appt.patient.firstName} {appt.patient.lastName}
                  </Link>
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">
                  Dr(a). {appt.doctor.user.firstName} {appt.doctor.user.lastName}
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">{appt.reason ?? "—"}</td>
                <td className="px-4 py-3">
                  <StatusSelect id={appt.id} status={appt.status} />
                </td>
                <td className="px-4 py-3 text-right text-sm">
                  <Link href={`/dashboard/citas/${appt.id}`} className="text-teal-700 hover:underline">
                    Reprogramar
                  </Link>
                </td>
              </tr>
            ))}
            {appointments.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-400">
                  Aún no hay citas registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
