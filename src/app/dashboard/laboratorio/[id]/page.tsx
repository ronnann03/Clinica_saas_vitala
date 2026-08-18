import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/tenant";
import { ResultForm } from "@/components/lab/result-form";

export default async function LabOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { clinicId } = await requireTenant();

  const order = await prisma.labOrder.findFirst({
    where: { id, clinicId },
    include: { patient: true, doctor: { include: { user: true } } },
  });
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-xl font-semibold text-slate-900">{order.examName}</h1>
      <p className="mt-1 text-sm text-slate-500">
        {order.patient.firstName} {order.patient.lastName} · Solicitado por Dr(a).{" "}
        {order.doctor.user.firstName} {order.doctor.user.lastName} ·{" "}
        {order.orderedAt.toLocaleDateString("es-PE")}
      </p>

      {order.status === "completed" ? (
        <div className="mt-6 rounded-lg border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Resultado</p>
          <p className="mt-2 whitespace-pre-wrap text-sm text-slate-800">
            {order.resultNotes ?? "Sin notas."}
          </p>
          {order.resultFileUrl && (
            <a
              href={order.resultFileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-sm font-medium text-teal-700 hover:underline"
            >
              Ver archivo adjunto
            </a>
          )}
          <p className="mt-3 text-xs text-slate-400">
            Completado el {order.completedAt?.toLocaleDateString("es-PE")}
          </p>
        </div>
      ) : (
        <div className="mt-6 rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-900">Registrar resultado</h2>
          <div className="mt-3">
            <ResultForm id={order.id} />
          </div>
        </div>
      )}
    </div>
  );
}
