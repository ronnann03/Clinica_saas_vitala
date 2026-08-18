import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/tenant";
import { markPrescriptionDispensed } from "../actions";

export default async function RecetasPage() {
  const { clinicId } = await requireTenant();

  const prescriptions = await prisma.prescription.findMany({
    where: { clinicId },
    include: { patient: true, doctor: { include: { user: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Recetas</h1>
          <p className="mt-1 text-sm text-slate-500">
            Recetas registradas desde consultas médicas.
          </p>
        </div>
        <Link href="/dashboard/farmacia" className="text-sm font-medium text-teal-700 hover:underline">
          ← Volver a Farmacia
        </Link>
      </div>

      <div className="mt-6 space-y-3">
        {prescriptions.map((p) => (
          <div key={p.id} className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {p.patient.firstName} {p.patient.lastName}
                </p>
                <p className="text-xs text-slate-500">
                  Dr(a). {p.doctor.user.firstName} {p.doctor.user.lastName} ·{" "}
                  {p.createdAt.toLocaleDateString("es-PE")}
                </p>
              </div>
              {p.dispensedAt ? (
                <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-700">
                  Entregada
                </span>
              ) : (
                <form action={markPrescriptionDispensed}>
                  <input type="hidden" name="id" value={p.id} />
                  <button
                    type="submit"
                    className="rounded-full border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                  >
                    Marcar entregada
                  </button>
                </form>
              )}
            </div>
            {p.notes && <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{p.notes}</p>}
          </div>
        ))}
        {prescriptions.length === 0 && (
          <p className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-400">
            Aún no hay recetas. Se generan al completar una consulta médica con
            el campo &quot;Receta médica&quot; lleno.
          </p>
        )}
      </div>
    </div>
  );
}
