import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/tenant";
import { NewMedicationDialog } from "@/components/pharmacy/new-medication-dialog";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export default async function FarmaciaPage() {
  const { clinicId } = await requireTenant();

  const medications = await prisma.medication.findMany({
    where: { clinicId },
    include: { batches: true },
    orderBy: { name: "asc" },
  });

  const now = new Date().getTime();
  const rows = medications.map((med) => {
    const activeBatches = med.batches.filter((b) => b.quantity > 0);
    const stock = activeBatches.reduce((sum, b) => sum + b.quantity, 0);
    const nearestExpiration = activeBatches
      .filter((b) => b.expirationDate)
      .map((b) => b.expirationDate!)
      .sort((a, b) => a.getTime() - b.getTime())[0];
    const expiringSoon = nearestExpiration ? nearestExpiration.getTime() - now <= THIRTY_DAYS_MS : false;
    const lowStock = stock <= med.reorderLevel;
    return { ...med, stock, nearestExpiration, expiringSoon, lowStock };
  });

  const alertCount = rows.filter((r) => r.lowStock || r.expiringSoon).length;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Farmacia</h1>
          <p className="mt-1 text-sm text-slate-500">
            {medications.length} medicamento{medications.length === 1 ? "" : "s"}
            {alertCount > 0 && <span className="ml-2 text-amber-600">· {alertCount} con alertas</span>}
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard/farmacia/recetas"
            className="inline-flex items-center rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Recetas
          </Link>
          <NewMedicationDialog />
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Medicamento</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Presentación</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Stock</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Próx. vencimiento</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((med) => (
              <tr key={med.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-sm font-medium text-slate-900">
                  <Link href={`/dashboard/farmacia/${med.id}`} className="hover:text-teal-700">
                    {med.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">{med.presentation ?? "—"}</td>
                <td className="px-4 py-3 text-sm">
                  <span className={med.lowStock ? "font-medium text-amber-700" : "text-slate-700"}>
                    {med.stock} {med.unit}
                  </span>
                  {med.lowStock && (
                    <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                      Reponer
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm">
                  {med.nearestExpiration ? (
                    <span className={med.expiringSoon ? "font-medium text-red-600" : "text-slate-600"}>
                      {med.nearestExpiration.toLocaleDateString("es-PE")}
                      {med.expiringSoon && " · próximo a vencer"}
                    </span>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right text-sm">
                  <Link href={`/dashboard/farmacia/${med.id}`} className="text-teal-700 hover:underline">
                    Movimiento
                  </Link>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-400">
                  Aún no hay medicamentos registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
