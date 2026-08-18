"use client";

import { useActionState } from "react";
import { registerExit, type PharmacyFormState } from "@/app/dashboard/farmacia/actions";

const initialState: PharmacyFormState = {};

type Batch = { id: string; label: string };

export function ExitForm({ medicationId, batches }: { medicationId: string; batches: Batch[] }) {
  const [state, formAction, isPending] = useActionState(registerExit, initialState);

  if (batches.length === 0) {
    return <p className="text-sm text-slate-400">No hay lotes con stock disponible.</p>;
  }

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="medicationId" value={medicationId} />

      <div>
        <label className="block text-sm font-medium text-slate-700">Lote *</label>
        <select name="batchId" required className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
          <option value="">Selecciona</option>
          {batches.map((b) => (
            <option key={b.id} value={b.id}>{b.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Cantidad *</label>
        <input
          type="number"
          min="1"
          name="quantity"
          required
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Motivo</label>
        <input
          name="reason"
          placeholder="Dispensado a paciente, ajuste, vencido, etc."
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400"
        />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-teal-600 px-3 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
      >
        {isPending ? "Guardando..." : "Registrar salida"}
      </button>
    </form>
  );
}
