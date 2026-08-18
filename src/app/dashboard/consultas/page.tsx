import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/tenant";

export default async function ConsultasPage() {
  const { clinicId } = await requireTenant();

  const consultations = await prisma.consultation.findMany({
    where: { clinicId },
    include: { patient: true, doctor: { include: { user: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Consultas médicas</h1>
          <p className="mt-1 text-sm text-slate-500">
            {consultations.length} consulta{consultations.length === 1 ? "" : "s"} registrada
            {consultations.length === 1 ? "" : "s"}.
          </p>
        </div>
        <Link
          href="/dashboard/consultas/nueva"
          className="inline-flex items-center gap-2 rounded-md bg-teal-600 px-3 py-2 text-sm font-medium text-white hover:bg-teal-700"
        >
          <Plus className="h-4 w-4" />
          Nueva consulta
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Fecha</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Paciente</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Médico</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Diagnóstico</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {consultations.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-sm text-slate-500">
                  {c.createdAt.toLocaleDateString("es-PE")}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-slate-900">
                  <Link href={`/dashboard/consultas/${c.id}`} className="hover:text-teal-700">
                    {c.patient.firstName} {c.patient.lastName}
                  </Link>
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">
                  Dr(a). {c.doctor.user.firstName} {c.doctor.user.lastName}
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">
                  {c.diagnosis ? (c.diagnosis.length > 60 ? `${c.diagnosis.slice(0, 60)}…` : c.diagnosis) : "—"}
                </td>
              </tr>
            ))}
            {consultations.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-sm text-slate-400">
                  Aún no hay consultas registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
