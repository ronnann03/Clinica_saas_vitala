import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/tenant";

type VitalSigns = {
  bloodPressure?: string;
  heartRate?: number;
  respiratoryRate?: number;
  temperature?: number;
  oxygenSaturation?: number;
  weightKg?: number;
  heightCm?: number;
};

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 whitespace-pre-wrap text-sm text-slate-800">{value}</p>
    </div>
  );
}

export default async function ConsultaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { clinicId } = await requireTenant();

  const consultation = await prisma.consultation.findFirst({
    where: { id, clinicId },
    include: { patient: true, doctor: { include: { user: true } } },
  });

  if (!consultation) notFound();

  const vitals = (consultation.vitalSigns as VitalSigns | null) ?? null;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-xl font-semibold text-slate-900">
        Consulta — {consultation.patient.firstName} {consultation.patient.lastName}
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Dr(a). {consultation.doctor.user.firstName} {consultation.doctor.user.lastName} ·{" "}
        {consultation.createdAt.toLocaleString("es-PE")}
      </p>

      <div className="mt-6 space-y-5 rounded-lg border border-slate-200 bg-white p-6">
        <Field label="Motivo de consulta" value={consultation.chiefComplaint} />
        <Field label="Anamnesis" value={consultation.anamnesis} />
        <Field label="Examen físico" value={consultation.physicalExam} />

        {vitals && (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Signos vitales</p>
            <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {vitals.bloodPressure && (
                <div><p className="text-xs text-slate-400">PA</p><p className="text-sm text-slate-800">{vitals.bloodPressure}</p></div>
              )}
              {vitals.heartRate != null && (
                <div><p className="text-xs text-slate-400">FC</p><p className="text-sm text-slate-800">{vitals.heartRate} lpm</p></div>
              )}
              {vitals.respiratoryRate != null && (
                <div><p className="text-xs text-slate-400">FR</p><p className="text-sm text-slate-800">{vitals.respiratoryRate} rpm</p></div>
              )}
              {vitals.temperature != null && (
                <div><p className="text-xs text-slate-400">Temp.</p><p className="text-sm text-slate-800">{vitals.temperature} °C</p></div>
              )}
              {vitals.oxygenSaturation != null && (
                <div><p className="text-xs text-slate-400">SatO₂</p><p className="text-sm text-slate-800">{vitals.oxygenSaturation}%</p></div>
              )}
              {vitals.weightKg != null && (
                <div><p className="text-xs text-slate-400">Peso</p><p className="text-sm text-slate-800">{vitals.weightKg} kg</p></div>
              )}
              {vitals.heightCm != null && (
                <div><p className="text-xs text-slate-400">Talla</p><p className="text-sm text-slate-800">{vitals.heightCm} cm</p></div>
              )}
            </div>
          </div>
        )}

        <Field label="Diagnóstico" value={consultation.diagnosis} />
        <Field label="Tratamiento" value={consultation.treatment} />
        <Field label="Observaciones" value={consultation.observations} />
        <Field label="Evolución" value={consultation.evolution} />
        <Field label="Próxima cita sugerida" value={consultation.nextAppointmentSuggestedAt} />
      </div>
    </div>
  );
}
