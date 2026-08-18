import { prisma } from "@/lib/prisma";
import { requirePatientSession } from "@/lib/patient-portal";

export default async function PortalRecetasPage() {
  const { patient } = await requirePatientSession();

  const prescriptions = await prisma.prescription.findMany({
    where: { patientId: patient.id },
    include: { doctor: { include: { user: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900">Mis recetas</h1>

      <div className="mt-6 space-y-3">
        {prescriptions.map((p) => (
          <div key={p.id} className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm font-medium text-slate-900">
              Dr(a). {p.doctor.user.firstName} {p.doctor.user.lastName}
            </p>
            <p className="text-xs text-slate-500">{p.createdAt.toLocaleDateString("es-PE")}</p>
            {p.notes && <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{p.notes}</p>}
          </div>
        ))}
        {prescriptions.length === 0 && (
          <p className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-400">
            Aún no tienes recetas registradas.
          </p>
        )}
      </div>
    </div>
  );
}
