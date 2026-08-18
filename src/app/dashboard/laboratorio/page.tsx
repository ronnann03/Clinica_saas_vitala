import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/tenant";
import { NewOrderDialog } from "@/components/lab/new-order-dialog";
import { StatusSelect } from "@/components/lab/status-select";

export default async function LaboratorioPage() {
  const { clinicId } = await requireTenant();

  const [orders, patients, doctors, catalog] = await Promise.all([
    prisma.labOrder.findMany({
      where: { clinicId },
      include: { patient: true, doctor: { include: { user: true } } },
      orderBy: { orderedAt: "desc" },
    }),
    prisma.patient.findMany({
      where: { clinicId },
      orderBy: { firstName: "asc" },
      select: { id: true, firstName: true, lastName: true },
    }),
    prisma.doctor.findMany({
      where: { clinicId },
      include: { user: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.labCatalogItem.findMany({ where: { clinicId }, orderBy: { name: "asc" } }),
  ]);

  const patientOptions = patients.map((p) => ({ id: p.id, label: `${p.firstName} ${p.lastName}` }));
  const doctorOptions = doctors.map((d) => ({ id: d.id, label: `Dr(a). ${d.user.firstName} ${d.user.lastName}` }));
  const catalogOptions = catalog.map((c) => ({ id: c.id, label: c.name }));

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Laboratorio</h1>
          <p className="mt-1 text-sm text-slate-500">
            {orders.length} orden{orders.length === 1 ? "" : "es"} registrada{orders.length === 1 ? "" : "s"}.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard/laboratorio/catalogo"
            className="inline-flex items-center rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Catálogo de exámenes
          </Link>
          <NewOrderDialog patients={patientOptions} doctors={doctorOptions} catalog={catalogOptions} />
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Fecha</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Paciente</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Examen</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Médico</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Estado</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-sm text-slate-500">{order.orderedAt.toLocaleDateString("es-PE")}</td>
                <td className="px-4 py-3 text-sm font-medium text-slate-900">
                  <Link href={`/dashboard/pacientes/${order.patientId}`} className="hover:text-teal-700">
                    {order.patient.firstName} {order.patient.lastName}
                  </Link>
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">{order.examName}</td>
                <td className="px-4 py-3 text-sm text-slate-600">
                  Dr(a). {order.doctor.user.firstName} {order.doctor.user.lastName}
                </td>
                <td className="px-4 py-3"><StatusSelect id={order.id} status={order.status} /></td>
                <td className="px-4 py-3 text-right text-sm">
                  <Link href={`/dashboard/laboratorio/${order.id}`} className="text-teal-700 hover:underline">
                    {order.status === "completed" ? "Ver resultado" : "Agregar resultado"}
                  </Link>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-400">
                  Aún no hay órdenes de laboratorio.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
