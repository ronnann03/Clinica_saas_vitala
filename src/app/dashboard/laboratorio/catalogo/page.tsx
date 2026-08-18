import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/tenant";
import { NewCatalogItemDialog } from "@/components/lab/new-catalog-item-dialog";

export default async function CatalogoPage() {
  const { clinicId } = await requireTenant();

  const items = await prisma.labCatalogItem.findMany({
    where: { clinicId },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Catálogo de exámenes</h1>
          <p className="mt-1 text-sm text-slate-500">
            {items.length} examen{items.length === 1 ? "" : "es"} en el catálogo.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/laboratorio" className="inline-flex items-center rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            ← Órdenes
          </Link>
          <NewCatalogItemDialog />
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Examen</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Descripción</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Precio</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-sm font-medium text-slate-900">{item.name}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{item.description ?? "—"}</td>
                <td className="px-4 py-3 text-sm text-slate-600">
                  {item.price ? `S/ ${item.price.toFixed(2)}` : "—"}
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-10 text-center text-sm text-slate-400">
                  Aún no hay exámenes en el catálogo.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
