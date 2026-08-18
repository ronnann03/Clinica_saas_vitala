import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/tenant";
import { NewDoctorDialog } from "@/components/doctors/new-doctor-dialog";

export default async function MedicosPage() {
  const { clinicId } = await requireTenant();

  const doctors = await prisma.doctor.findMany({
    where: { clinicId },
    include: { user: true, specialty: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Médicos y especialistas</h1>
          <p className="mt-1 text-sm text-slate-500">
            {doctors.length} médico{doctors.length === 1 ? "" : "s"} registrado
            {doctors.length === 1 ? "" : "s"}.
          </p>
        </div>
        <NewDoctorDialog />
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Nombre</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Especialidad</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Consultorio</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Tarifa</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Email</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {doctors.map((doctor) => (
              <tr key={doctor.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-sm font-medium text-slate-900">
                  Dr(a). {doctor.user.firstName} {doctor.user.lastName}
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">{doctor.specialty?.name ?? "—"}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{doctor.consultorio ?? "—"}</td>
                <td className="px-4 py-3 text-sm text-slate-600">
                  {doctor.consultationFee ? `S/ ${doctor.consultationFee.toString()}` : "—"}
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">{doctor.user.email}</td>
              </tr>
            ))}
            {doctors.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-400">
                  Aún no hay médicos registrados. Agrega uno para poder crear citas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
