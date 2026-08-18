import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePatientSession } from "@/lib/patient-portal";

export default async function PortalHomePage() {
  const { patient } = await requirePatientSession();

  const [nextAppointment, pendingPayments] = await Promise.all([
    prisma.appointment.findFirst({
      where: { patientId: patient.id, scheduledAt: { gte: new Date() }, status: { in: ["pending", "confirmed"] } },
      include: { doctor: { include: { user: true } } },
      orderBy: { scheduledAt: "asc" },
    }),
    prisma.payment.aggregate({
      where: { patientId: patient.id, status: { in: ["pending", "partial"] } },
      _sum: { amount: true, amountPaid: true },
    }),
  ]);

  const balance =
    (pendingPayments._sum.amount?.toNumber() ?? 0) - (pendingPayments._sum.amountPaid?.toNumber() ?? 0);

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900">Hola, {patient.firstName}</h1>
      <p className="mt-1 text-sm text-slate-500">Este es tu resumen.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Próxima cita</p>
          {nextAppointment ? (
            <>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                {nextAppointment.scheduledAt.toLocaleString("es-PE", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
              </p>
              <p className="text-sm text-slate-500">
                Dr(a). {nextAppointment.doctor.user.firstName} {nextAppointment.doctor.user.lastName}
              </p>
            </>
          ) : (
            <p className="mt-2 text-sm text-slate-400">No tienes citas próximas.</p>
          )}
          <Link href="/portal/citas" className="mt-3 inline-block text-sm font-medium text-teal-700 hover:underline">
            Ver mis citas →
          </Link>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Saldo pendiente</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">S/ {balance.toFixed(2)}</p>
          <Link href="/portal/pagos" className="mt-3 inline-block text-sm font-medium text-teal-700 hover:underline">
            Ver mis pagos →
          </Link>
        </div>
      </div>
    </div>
  );
}
