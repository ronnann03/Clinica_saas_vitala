import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/tenant";

async function getKpis(clinicId: string) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  const [patientsCount, appointmentsToday, pendingPayments] = await Promise.all([
    prisma.patient.count({ where: { clinicId } }),
    prisma.appointment.count({
      where: { clinicId, scheduledAt: { gte: startOfDay, lt: endOfDay } },
    }),
    prisma.payment.aggregate({
      where: { clinicId, status: "pending" },
      _sum: { amount: true, amountPaid: true },
    }),
  ]);

  const amount = pendingPayments._sum.amount?.toNumber() ?? 0;
  const amountPaid = pendingPayments._sum.amountPaid?.toNumber() ?? 0;

  return {
    patients: patientsCount,
    appointmentsToday,
    pendingPayments: (amount - amountPaid).toFixed(2),
  };
}

export default async function DashboardPage() {
  const { clinicId } = await requireTenant();
  const kpis = await getKpis(clinicId);

  const cards = [
    { label: "Pacientes registrados", value: kpis.patients },
    { label: "Citas de hoy", value: kpis.appointmentsToday },
    { label: "Pagos pendientes", value: `S/ ${kpis.pendingPayments}` },
  ];

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
      <p className="mt-1 text-sm text-slate-500">
        Resumen general de la clínica.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-lg border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
