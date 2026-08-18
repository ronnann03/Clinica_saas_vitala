import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/tenant";
import { NewPaymentDialog } from "@/components/payments/new-payment-dialog";
import { updatePaymentStatus } from "./actions";

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  partial: "Parcial",
  paid: "Pagado",
  refunded: "Reembolsado",
  cancelled: "Anulado",
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  partial: "bg-indigo-50 text-indigo-700 border-indigo-200",
  paid: "bg-teal-50 text-teal-700 border-teal-200",
  refunded: "bg-slate-100 text-slate-600 border-slate-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

const METHOD_LABELS: Record<string, string> = {
  cash: "Efectivo",
  card: "Tarjeta",
  transfer: "Transferencia",
  yape: "Yape",
  plin: "Plin",
};

export default async function PagosPage() {
  const { clinicId } = await requireTenant();

  const [payments, patients, appointments] = await Promise.all([
    prisma.payment.findMany({
      where: { clinicId },
      include: { patient: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.patient.findMany({
      where: { clinicId },
      orderBy: { firstName: "asc" },
      select: { id: true, firstName: true, lastName: true },
    }),
    prisma.appointment.findMany({
      where: { clinicId },
      include: { patient: true, doctor: { include: { user: true } } },
      orderBy: { scheduledAt: "desc" },
      take: 100,
    }),
  ]);

  const patientOptions = patients.map((p) => ({
    id: p.id,
    label: `${p.firstName} ${p.lastName}`,
  }));
  const appointmentOptions = appointments.map((a) => ({
    id: a.id,
    label: `${a.patient.firstName} ${a.patient.lastName} — ${a.scheduledAt.toLocaleDateString("es-PE")} — Dr(a). ${a.doctor.user.lastName}`,
  }));

  const totalPending = payments
    .filter((p) => p.status === "pending" || p.status === "partial")
    .reduce((sum, p) => sum + (p.amount.toNumber() - p.amountPaid.toNumber()), 0);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Pagos y facturación</h1>
          <p className="mt-1 text-sm text-slate-500">
            {payments.length} transacción{payments.length === 1 ? "" : "es"} · S/{" "}
            {totalPending.toFixed(2)} pendiente por cobrar
          </p>
        </div>
        <NewPaymentDialog patients={patientOptions} appointments={appointmentOptions} />
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Comprobante</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Paciente</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Monto</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Pagado</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Método</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Estado</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Fecha</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {payments.map((payment) => (
              <tr key={payment.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-mono text-xs text-slate-600">{payment.receiptNumber ?? "—"}</td>
                <td className="px-4 py-3 text-sm font-medium text-slate-900">
                  <Link href={`/dashboard/pacientes/${payment.patientId}`} className="hover:text-teal-700">
                    {payment.patient.firstName} {payment.patient.lastName}
                  </Link>
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">S/ {payment.amount.toFixed(2)}</td>
                <td className="px-4 py-3 text-sm text-slate-600">S/ {payment.amountPaid.toFixed(2)}</td>
                <td className="px-4 py-3 text-sm text-slate-600">
                  {payment.method ? METHOD_LABELS[payment.method] : "—"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full border px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[payment.status]}`}
                  >
                    {STATUS_LABELS[payment.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-slate-500">
                  {payment.createdAt.toLocaleDateString("es-PE")}
                </td>
                <td className="px-4 py-3 text-right text-sm">
                  <div className="flex justify-end gap-3">
                    {(payment.status === "pending" || payment.status === "partial") && (
                      <Link href={`/dashboard/pagos/${payment.id}`} className="text-teal-700 hover:underline">
                        Registrar pago
                      </Link>
                    )}
                    {payment.status !== "cancelled" && payment.status !== "refunded" && (
                      <form action={updatePaymentStatus}>
                        <input type="hidden" name="id" value={payment.id} />
                        <input
                          type="hidden"
                          name="status"
                          value={payment.status === "paid" ? "refunded" : "cancelled"}
                        />
                        <button type="submit" className="text-red-600 hover:underline">
                          {payment.status === "paid" ? "Reembolsar" : "Anular"}
                        </button>
                      </form>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-sm text-slate-400">
                  Aún no hay pagos registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
