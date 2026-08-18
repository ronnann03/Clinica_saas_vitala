import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/tenant";
import { PortalAccess } from "@/components/patients/portal-access";

export default async function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { clinicId } = await requireTenant();

  const patient = await prisma.patient.findFirst({ where: { id, clinicId } });
  if (!patient) notFound();

  const [appointments, payments, consultations] = await Promise.all([
    prisma.appointment.findMany({
      where: { patientId: id, clinicId },
      include: { doctor: { include: { user: true } } },
      orderBy: { scheduledAt: "desc" },
      take: 5,
    }),
    prisma.payment.findMany({
      where: { patientId: id, clinicId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.consultation.findMany({
      where: { patientId: id, clinicId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-xl font-semibold text-slate-900">
        {patient.firstName} {patient.lastName}
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        {patient.documentId ? `Doc. ${patient.documentId}` : "Sin documento registrado"}
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Contacto</p>
          <p className="mt-2 text-sm text-slate-700">Teléfono: {patient.phone ?? "—"}</p>
          <p className="text-sm text-slate-700">Email: {patient.email ?? "—"}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Datos</p>
          <p className="mt-2 text-sm text-slate-700">
            Nacimiento: {patient.dob ? patient.dob.toLocaleDateString("es-PE") : "—"}
          </p>
          <p className="text-sm text-slate-700">Género: {patient.gender ?? "—"}</p>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Portal del paciente</p>
        {patient.userId ? (
          <p className="mt-2 text-sm text-teal-700">Este paciente ya tiene acceso al portal.</p>
        ) : (
          <div className="mt-3">
            <PortalAccess patientId={patient.id} defaultEmail={patient.email} />
          </div>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Citas</p>
            <Link href="/dashboard/citas" className="text-xs text-teal-700 hover:underline">Ver todas</Link>
          </div>
          <ul className="mt-2 space-y-1.5">
            {appointments.map((a) => (
              <li key={a.id} className="text-sm text-slate-700">
                {a.scheduledAt.toLocaleDateString("es-PE")} — Dr(a). {a.doctor.user.lastName}
              </li>
            ))}
            {appointments.length === 0 && <li className="text-sm text-slate-400">Sin citas.</li>}
          </ul>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Pagos</p>
            <Link href="/dashboard/pagos" className="text-xs text-teal-700 hover:underline">Ver todos</Link>
          </div>
          <ul className="mt-2 space-y-1.5">
            {payments.map((p) => (
              <li key={p.id} className="text-sm text-slate-700">
                S/ {p.amountPaid.toFixed(2)} / {p.amount.toFixed(2)}
              </li>
            ))}
            {payments.length === 0 && <li className="text-sm text-slate-400">Sin pagos.</li>}
          </ul>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Consultas</p>
            <Link href="/dashboard/consultas" className="text-xs text-teal-700 hover:underline">Ver todas</Link>
          </div>
          <ul className="mt-2 space-y-1.5">
            {consultations.map((c) => (
              <li key={c.id}>
                <Link href={`/dashboard/consultas/${c.id}`} className="text-sm text-teal-700 hover:underline">
                  {c.createdAt.toLocaleDateString("es-PE")}
                </Link>
              </li>
            ))}
            {consultations.length === 0 && <li className="text-sm text-slate-400">Sin consultas.</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}
