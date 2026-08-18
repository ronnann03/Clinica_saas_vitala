import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/tenant";
import { NewItemDialog } from "@/components/inventory/new-item-dialog";

export default async function InventarioPage() {
  const { clinicId } = await requireTenant();

  const items = await prisma.inventoryItem.findMany({
    where: { clinicId },
    orderBy: { name: "asc" },
  });

  const lowStockCount = items.filter((i) => i.stock <= i.reorderLevel).length;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Inventario</h1>
          <p className="mt-1 text-sm text-slate-500">
            {items.length} insumo{items.length === 1 ? "" : "s"} registrado
            {items.length === 1 ? "" : "s"}
            {lowStockCount > 0 && (
              <span className="ml-2 text-amber-600">
                · {lowStockCount} con stock bajo
              </span>
            )}
          </p>
        </div>
        <NewItemDialog />
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Nombre</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Categoría</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Almacén</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Stock</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => {
              const low = item.stock <= item.reorderLevel;
              return (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">
                    <Link href={`/dashboard/inventario/${item.id}`} className="hover:text-teal-700">
                      {item.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{item.category ?? "—"}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{item.warehouse ?? "—"}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={low ? "font-medium text-amber-700" : "text-slate-700"}>
                      {item.stock} {item.unit}
                    </span>
                    {low && (
                      <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                        Reponer
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-sm">
                    <Link href={`/dashboard/inventario/${item.id}`} className="text-teal-700 hover:underline">
                      Movimiento
                    </Link>
                  </td>
                </tr>
              );
            })}
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-400">
                  Aún no hay insumos registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
