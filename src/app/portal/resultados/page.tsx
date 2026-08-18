import { prisma } from "@/lib/prisma";
import { requirePatientSession } from "@/lib/patient-portal";

export default async function PortalResultadosPage() {
  const { patient } = await requirePatientSession();

  const orders = await prisma.labOrder.findMany({
    where: { patientId: patient.id },
    orderBy: { orderedAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900">Mis resultados</h1>

      <div className="mt-6 space-y-3">
        {orders.map((o) => (
          <div key={o.id} className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-900">{o.examName}</p>
              <span
                className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
                  o.status === "completed"
                    ? "border-teal-200 bg-teal-50 text-teal-700"
                    : "border-amber-200 bg-amber-50 text-amber-700"
                }`}
              >
                {o.status === "completed" ? "Listo" : "En proceso"}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">Solicitado el {o.orderedAt.toLocaleDateString("es-PE")}</p>
            {o.status === "completed" && (
              <>
                {o.resultNotes && <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{o.resultNotes}</p>}
                {o.resultFileUrl && (
                  <a
                    href={o.resultFileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-sm font-medium text-teal-700 hover:underline"
                  >
                    Ver archivo adjunto
                  </a>
                )}
              </>
            )}
          </div>
        ))}
        {orders.length === 0 && (
          <p className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-400">
            Aún no tienes exámenes registrados.
          </p>
        )}
      </div>
    </div>
  );
}
