import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/tenant";
import { EntryForm } from "@/components/pharmacy/entry-form";
import { ExitForm } from "@/components/pharmacy/exit-form";

export default async function MedicationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { clinicId } = await requireTenant();

  const medication = await prisma.medication.findFirst({
    where: { id, clinicId },
    include: { batches: { orderBy: { expirationDate: "asc" } } },
  });
  if (!medication) notFound();

  const stock = medication.batches.reduce((sum, b) => sum + b.quantity, 0);
  const batchOptions = medication.batches
    .filter((b) => b.quantity > 0)
    .map((b) => ({
      id: b.id,
      label: `${b.batchNumber ?? "Sin número"} · ${b.quantity} disp. ${b.expirationDate ? `· vence ${b.expirationDate.toLocaleDateString("es-PE")}` : ""}`,
    }));

  const movements = await prisma.medicationMovement.findMany({
    where: { medicationId: id },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-xl font-semibold text-slate-900">{medication.name}</h1>
      <p className="mt-1 text-sm text-slate-500">{medication.presentation ?? "Sin presentación"}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">
        {stock} <span className="text-base font-normal text-slate-500">{medication.unit}</span>
      </p>

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-900">Ingresar lote</h2>
          <div className="mt-3"><EntryForm medicationId={medication.id} /></div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-900">Registrar salida</h2>
          <div className="mt-3"><ExitForm medicationId={medication.id} batches={batchOptions} /></div>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900">Lotes</h2>
        <table className="mt-3 min-w-full divide-y divide-slate-100 text-sm">
          <thead>
            <tr className="text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              <th className="py-2">N.º de lote</th>
              <th className="py-2">Vencimiento</th>
              <th className="py-2">Cantidad</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {medication.batches.map((b) => (
              <tr key={b.id}>
                <td className="py-2 text-slate-700">{b.batchNumber ?? "—"}</td>
                <td className="py-2 text-slate-700">
                  {b.expirationDate ? b.expirationDate.toLocaleDateString("es-PE") : "—"}
                </td>
                <td className="py-2 text-slate-700">{b.quantity}</td>
              </tr>
            ))}
            {medication.batches.length === 0 && (
              <tr>
                <td colSpan={3} className="py-4 text-center text-slate-400">Sin lotes registrados.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-5">
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
          {movements.length === 0 && <li className="text-sm text-slate-400">Sin movimientos.</li>}
        </ul>
      </div>
    </div>
  );
}
