import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/tenant";
import { RegisterPaymentForm } from "@/components/payments/register-payment-form";

export default async function RegistrarPagoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { clinicId } = await requireTenant();

  const payment = await prisma.payment.findFirst({
    where: { id, clinicId },
    include: { patient: true },
  });

  if (!payment) notFound();

  const balance = payment.amount.toNumber() - payment.amountPaid.toNumber();

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-xl font-semibold text-slate-900">Registrar pago</h1>
      <p className="mt-1 text-sm text-slate-500">
        {payment.patient.firstName} {payment.patient.lastName} · Comprobante{" "}
        {payment.receiptNumber}
      </p>

      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-6">
        <RegisterPaymentForm id={payment.id} balance={balance} />
      </div>
    </div>
  );
}
