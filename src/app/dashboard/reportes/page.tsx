import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/tenant";

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  waiting_list: "Lista de espera",
  completed: "Completada",
  cancelled: "Cancelada",
  no_show: "No asistió",
};

const METHOD_LABELS: Record<string, string> = {
  cash: "Efectivo",
  card: "Tarjeta",
  transfer: "Transferencia",
  yape: "Yape",
  plin: "Plin",
};

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

export default async function ReportesPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const { clinicId } = await requireTenant();
  const params = await searchParams;

  const today = new Date();
  const defaultFrom = new Date(today);
  defaultFrom.setDate(defaultFrom.getDate() - 30);

  const from = params.from ? new Date(`${params.from}T00:00:00`) : defaultFrom;
  const toInclusive = params.to ? new Date(`${params.to}T00:00:00`) : today;
  const toExclusive = new Date(toInclusive);
  toExclusive.setDate(toExclusive.getDate() + 1);

  const appointmentDateFilter = { gte: from, lt: toExclusive };
  const createdDateFilter = { gte: from, lt: toExclusive };

  const [
    appointmentsInPeriod,
    statusBreakdown,
    paymentsAgg,
    pendingAgg,
    newPatients,
    doctorBreakdown,
    specialtyBreakdown,
    methodBreakdown,
    noShowAppointments,
  ] = await Promise.all([
    prisma.appointment.count({ where: { clinicId, scheduledAt: appointmentDateFilter } }),
    prisma.appointment.groupBy({
      by: ["status"],
      where: { clinicId, scheduledAt: appointmentDateFilter },
      _count: { _all: true },
    }),
    prisma.payment.aggregate({
      where: { clinicId, createdAt: createdDateFilter },
      _sum: { amountPaid: true },
    }),
    prisma.payment.aggregate({
      where: { clinicId, status: { in: ["pending", "partial"] } },
      _sum: { amount: true, amountPaid: true },
    }),
    prisma.patient.count({ where: { clinicId, createdAt: createdDateFilter } }),
    prisma.appointment.groupBy({
      by: ["doctorId"],
      where: { clinicId, scheduledAt: appointmentDateFilter },
      _count: { _all: true },
      orderBy: { _count: { doctorId: "desc" } },
      take: 5,
    }),
    prisma.appointment.groupBy({
      by: ["specialtyId"],
      where: { clinicId, scheduledAt: appointmentDateFilter, specialtyId: { not: null } },
      _count: { _all: true },
      orderBy: { _count: { specialtyId: "desc" } },
      take: 5,
    }),
    prisma.payment.groupBy({
      by: ["method"],
      where: { clinicId, createdAt: createdDateFilter, method: { not: null } },
      _sum: { amountPaid: true },
    }),
    prisma.appointment.findMany({
      where: { clinicId, scheduledAt: appointmentDateFilter, status: "no_show" },
      include: { patient: true },
      orderBy: { scheduledAt: "desc" },
      take: 10,
    }),
  ]);

  const doctorIds = doctorBreakdown.map((d) => d.doctorId);
  const specialtyIds = specialtyBreakdown
    .map((s) => s.specialtyId)
    .filter((id): id is string => id != null);

  const [doctors, specialties] = await Promise.all([
    prisma.doctor.findMany({ where: { id: { in: doctorIds } }, include: { user: true } }),
    prisma.specialty.findMany({ where: { id: { in: specialtyIds } } }),
  ]);
  const doctorMap = new Map(doctors.map((d) => [d.id, `Dr(a). ${d.user.firstName} ${d.user.lastName}`]));
  const specialtyMap = new Map(specialties.map((s) => [s.id, s.name]));

  const ingresos = paymentsAgg._sum.amountPaid?.toNumber() ?? 0;
  const deudas =
    (pendingAgg._sum.amount?.toNumber() ?? 0) - (pendingAgg._sum.amountPaid?.toNumber() ?? 0);
  const cancelledCount = statusBreakdown.find((s) => s.status === "cancelled")?._count._all ?? 0;
  const noShowCount = statusBreakdown.find((s) => s.status === "no_show")?._count._all ?? 0;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Reportes</h1>
          <p className="mt-1 text-sm text-slate-500">
            Del {from.toLocaleDateString("es-PE")} al {toInclusive.toLocaleDateString("es-PE")}.
          </p>
        </div>
        <form className="flex items-end gap-2">
          <div>
            <label className="block text-xs font-medium text-slate-500">Desde</label>
            <input
              type="date"
              name="from"
              defaultValue={toDateInputValue(from)}
              className="mt-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500">Hasta</label>
            <input
              type="date"
              name="to"
              defaultValue={toDateInputValue(toInclusive)}
              className="mt-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm"
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-teal-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-teal-700"
          >
            Aplicar
          </button>
        </form>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Citas en el período</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{appointmentsInPeriod}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Ingresos cobrados</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">S/ {ingresos.toFixed(2)}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Deudas pendientes</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">S/ {deudas.toFixed(2)}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Pacientes nuevos</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{newPatients}</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-900">Citas por estado</h2>
          <ul className="mt-3 space-y-2">
            {statusBreakdown.map((s) => (
              <li key={s.status} className="flex items-center justify-between text-sm">
                <span className="text-slate-600">{STATUS_LABELS[s.status] ?? s.status}</span>
                <span className="font-medium text-slate-900">{s._count._all}</span>
              </li>
            ))}
            {statusBreakdown.length === 0 && (
              <li className="text-sm text-slate-400">Sin citas en el período.</li>
            )}
          </ul>
          <p className="mt-3 text-xs text-slate-400">
            {cancelledCount} cancelada{cancelledCount === 1 ? "" : "s"} · {noShowCount} no asistió/eron
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-900">Métodos de pago</h2>
          <ul className="mt-3 space-y-2">
            {methodBreakdown.map((m) => (
              <li key={m.method} className="flex items-center justify-between text-sm">
                <span className="text-slate-600">{METHOD_LABELS[m.method!] ?? m.method}</span>
                <span className="font-medium text-slate-900">
                  S/ {(m._sum.amountPaid?.toNumber() ?? 0).toFixed(2)}
                </span>
              </li>
            ))}
            {methodBreakdown.length === 0 && (
              <li className="text-sm text-slate-400">Sin pagos en el período.</li>
            )}
          </ul>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-900">Médicos con más citas</h2>
          <ul className="mt-3 space-y-2">
            {doctorBreakdown.map((d) => (
              <li key={d.doctorId} className="flex items-center justify-between text-sm">
                <span className="text-slate-600">{doctorMap.get(d.doctorId) ?? "—"}</span>
                <span className="font-medium text-slate-900">{d._count._all}</span>
              </li>
            ))}
            {doctorBreakdown.length === 0 && (
              <li className="text-sm text-slate-400">Sin citas en el período.</li>
            )}
          </ul>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-900">Especialidades más solicitadas</h2>
          <ul className="mt-3 space-y-2">
            {specialtyBreakdown.map((s) => (
              <li key={s.specialtyId} className="flex items-center justify-between text-sm">
                <span className="text-slate-600">
                  {s.specialtyId ? specialtyMap.get(s.specialtyId) ?? "—" : "Sin especialidad"}
                </span>
                <span className="font-medium text-slate-900">{s._count._all}</span>
              </li>
            ))}
            {specialtyBreakdown.length === 0 && (
              <li className="text-sm text-slate-400">Sin datos en el período.</li>
            )}
          </ul>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900">Pacientes que no asistieron</h2>
        <ul className="mt-3 space-y-2">
          {noShowAppointments.map((a) => (
            <li key={a.id} className="flex items-center justify-between text-sm">
              <span className="text-slate-600">
                {a.patient.firstName} {a.patient.lastName}
              </span>
              <span className="text-slate-400">{a.scheduledAt.toLocaleDateString("es-PE")}</span>
            </li>
          ))}
          {noShowAppointments.length === 0 && (
            <li className="text-sm text-slate-400">Nadie faltó a su cita en este período.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
