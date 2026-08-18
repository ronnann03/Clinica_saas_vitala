import { prisma } from "@/lib/prisma";
import { requirePatientSession } from "@/lib/patient-portal";

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  partial: "Parcial",
  paid: "Pagado",
  refunded: "Reembolsado",
  cancelled: "Anulado",
};

const METHOD_LABELS: Record<string, string> = {
  cash: "Efectivo",
  card: "Tarjeta",
  transfer: "Transferencia",
  yape: "Yape",
  plin: "Plin",
};

export default async function PortalPagosPage() {
  const { patient } = await requirePatientSession();

  const payments = await prisma.payment.findMany({
    where: { patientId: patient.id },
    orderBy: { createdAt: "desc" },
  });

  const balance = payments
    .filter((p) => p.status === "pending" || p.status === "partial")
    .reduce((sum, p) => sum + (p.amount.toNumber() - p.amountPaid.toNumber()), 0);

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900">Mis pagos</h1>
      <p className="mt-1 text-sm text-slate-500">Saldo pendiente: S/ {balance.toFixed(2)}</p>

      <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Comprobante</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Monto</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Pagado</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Método</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Estado</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {payments.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3 font-mono text-xs text-slate-600">{p.receiptNumber ?? "—"}</td>
                <td className="px-4 py-3 text-sm text-slate-700">S/ {p.amount.toFixed(2)}</td>
                <td className="px-4 py-3 text-sm text-slate-700">S/ {p.amountPaid.toFixed(2)}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{p.method ? METHOD_LABELS[p.method] : "—"}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{STATUS_LABELS[p.status]}</td>
                <td className="px-4 py-3 text-sm text-slate-500">{p.createdAt.toLocaleDateString("es-PE")}</td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-400">
                  Aún no tienes pagos registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-slate-400">
        El pago en línea todavía no está disponible; los cobros se registran en la clínica.
      </p>
    </div>
  );
}
