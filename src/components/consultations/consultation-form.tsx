"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createConsultation, type ConsultationFormState } from "@/app/dashboard/consultas/actions";

const initialState: ConsultationFormState = {};

type Option = { id: string; label: string };

export function ConsultationForm({
  patients,
  doctors,
  appointments,
}: {
  patients: Option[];
  doctors: Option[];
  appointments: Option[];
}) {
  const [state, formAction, isPending] = useActionState(createConsultation, initialState);

  return (
    <form action={formAction} className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900">Datos generales</h2>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-slate-700">Paciente *</label>
            <select name="patientId" required className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
              <option value="">Selecciona</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Médico *</label>
            <select name="doctorId" required className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
              <option value="">Selecciona</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>{d.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Cita relacionada</label>
            <select name="appointmentId" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
              <option value="">Sin cita asociada</option>
              {appointments.map((a) => (
                <option key={a.id} value={a.id}>{a.label}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900">Evaluación</h2>
        <div className="mt-3 space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700">Motivo de consulta</label>
            <input name="chiefComplaint" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Anamnesis</label>
            <textarea name="anamnesis" rows={3} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Examen físico</label>
            <textarea name="physicalExam" rows={3} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900">Signos vitales</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div>
            <label className="block text-xs font-medium text-slate-500">PA (mmHg)</label>
            <input name="bloodPressure" placeholder="120/80" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500">FC (lpm)</label>
            <input type="number" name="heartRate" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500">FR (rpm)</label>
            <input type="number" name="respiratoryRate" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500">Temp. (°C)</label>
            <input type="number" step="0.1" name="temperature" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500">SatO₂ (%)</label>
            <input type="number" name="oxygenSaturation" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500">Peso (kg)</label>
            <input type="number" step="0.1" name="weightKg" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500">Talla (cm)</label>
            <input type="number" name="heightCm" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900">Diagnóstico y plan</h2>
        <div className="mt-3 space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700">Diagnóstico</label>
            <textarea name="diagnosis" rows={2} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Tratamiento</label>
            <textarea name="treatment" rows={2} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Observaciones</label>
            <textarea name="observations" rows={2} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Evolución</label>
            <textarea name="evolution" rows={2} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Próxima cita sugerida</label>
            <input type="date" name="nextAppointmentDate" className="mt-1 w-full max-w-xs rounded-md border border-slate-300 px-3 py-2 text-sm" />
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900">Receta médica</h2>
        <p className="mt-1 text-xs text-slate-500">
          Opcional. Si la completas, queda disponible para Farmacia.
        </p>
        <textarea
          name="prescriptionNotes"
          rows={3}
          placeholder="Ej: Paracetamol 500mg, 1 tableta cada 8h por 3 días."
          className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400"
        />
      </section>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <div className="flex justify-end gap-2">
        <Link href="/dashboard/consultas" className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
        >
          {isPending ? "Guardando..." : "Guardar consulta"}
        </button>
      </div>
    </form>
  );
}
