import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/tenant";
import { MovementForm } from "@/components/inventory/movement-form";

export default async function InventoryItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { clinicId } = await requireTenant();

  const item = await prisma.inventoryItem.findFirst({ where: { id, clinicId } });
  if (!item) notFound();

  const movements = await prisma.inventoryMovement.findMany({
    where: { itemId: id },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-xl font-semibold text-slate-900">{item.name}</h1>
      <p className="mt-1 text-sm text-slate-500">
        {item.category ?? "Sin categoría"} · {item.warehouse ?? "Sin almacén"}
      </p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">
        {item.stock} <span className="text-base font-normal text-slate-500">{item.unit}</span>
      </p>

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-900">Registrar movimiento</h2>
          <div className="mt-3">
            <MovementForm itemId={item.id} />
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-900">Últimos movimientos</h2>
          <ul className="mt-3 space-y-2">
            {movements.map((m) => (
              <li key={m.id} className="flex items-center justify-between text-sm">
                <span className="text-slate-600">
                  {m.createdAt.toLocaleDateString("es-PE")} · {m.reason ?? "—"}
                </span>
                <span className={m.type === "in" ? "font-medium text-teal-700" : "font-medium text-red-600"}>
                  {m.type === "in" ? "+" : "-"}{m.quantity}
                </span>
              </li>
            ))}
            {movements.length === 0 && (
              <li className="text-sm text-slate-400">Sin movimientos registrados.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
