"use client";

import { useActionState } from "react";
import { requestAppointment, type PortalAppointmentFormState } from "@/app/portal/citas/actions";

const initialState: PortalAppointmentFormState = {};

type Option = { id: string; label: string };

export function RequestAppointmentForm({ doctors }: { doctors: Option[] }) {
  const [state, formAction, isPending] = useActionState(requestAppointment, initialState);

  if (doctors.length === 0) {
    return <p className="text-sm text-slate-400">Aún no hay médicos disponibles en esta clínica.</p>;
  }

  return (
    <form action={formAction} className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-slate-700">Médico *</label>
        <select name="doctorId" required className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
          <option value="">Selecciona</option>
          {doctors.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700">Fecha *</label>
          <input type="date" name="date" required className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Hora *</label>
          <input type="time" name="time" required className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Motivo</label>
        <input name="reason" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-teal-600 px-3 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
      >
        {isPending ? "Enviando..." : "Solicitar cita"}
      </button>
      <p className="text-xs text-slate-400">
        La clínica confirmará tu cita. Podrás ver su estado aquí mismo.
      </p>
    </form>
  );
}
