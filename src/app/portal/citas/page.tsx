import { prisma } from "@/lib/prisma";
import { requirePatientSession } from "@/lib/patient-portal";
import { RequestAppointmentForm } from "@/components/portal/request-appointment-form";

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente de confirmación",
  confirmed: "Confirmada",
  waiting_list: "Lista de espera",
  completed: "Completada",
  cancelled: "Cancelada",
  no_show: "No asististe",
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-teal-50 text-teal-700 border-teal-200",
  waiting_list: "bg-indigo-50 text-indigo-700 border-indigo-200",
  completed: "bg-slate-100 text-slate-600 border-slate-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
  no_show: "bg-orange-50 text-orange-700 border-orange-200",
};

export default async function PortalCitasPage() {
  const { patient, clinicId } = await requirePatientSession();

  const [appointments, doctors] = await Promise.all([
    prisma.appointment.findMany({
      where: { patientId: patient.id },
      include: { doctor: { include: { user: true } } },
      orderBy: { scheduledAt: "desc" },
    }),
    prisma.doctor.findMany({
      where: { clinicId },
      include: { user: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const doctorOptions = doctors.map((d) => ({ id: d.id, label: `Dr(a). ${d.user.firstName} ${d.user.lastName}` }));

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <h1 className="text-xl font-semibold text-slate-900">Mis citas</h1>
        <div className="mt-4 space-y-3">
          {appointments.map((a) => (
            <div key={a.id} className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-900">
                  {a.scheduledAt.toLocaleString("es-PE", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                </p>
                <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[a.status]}`}>
                  {STATUS_LABELS[a.status]}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-600">
                Dr(a). {a.doctor.user.firstName} {a.doctor.user.lastName}
              </p>
              {a.reason && <p className="mt-1 text-sm text-slate-500">{a.reason}</p>}
            </div>
          ))}
          {appointments.length === 0 && (
            <p className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-400">
              Aún no tienes citas.
            </p>
          )}
        </div>
      </div>

      <div>
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-900">Solicitar cita</h2>
          <div className="mt-3">
            <RequestAppointmentForm doctors={doctorOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}
