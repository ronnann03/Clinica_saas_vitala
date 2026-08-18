import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/tenant";
import { NewPatientDialog } from "@/components/patients/new-patient-dialog";

export default async function PacientesPage() {
  const { clinicId } = await requireTenant();

  const rows = await prisma.patient.findMany({
    where: { clinicId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Pacientes</h1>
          <p className="mt-1 text-sm text-slate-500">
            {rows.length} paciente{rows.length === 1 ? "" : "s"} registrado{rows.length === 1 ? "" : "s"}.
          </p>
        </div>
        <NewPatientDialog />
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Nombre</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Documento</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Teléfono</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Email</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((patient) => (
              <tr key={patient.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-sm font-medium text-slate-900">
                  <Link href={`/dashboard/pacientes/${patient.id}`} className="hover:text-teal-700">
                    {patient.firstName} {patient.lastName}
                  </Link>
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">{patient.documentId ?? "—"}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{patient.phone ?? "—"}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{patient.email ?? "—"}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-sm text-slate-400">
                  Aún no hay pacientes registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
