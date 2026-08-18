"use client";

import { useActionState } from "react";
import { registerEntry, type PharmacyFormState } from "@/app/dashboard/farmacia/actions";

const initialState: PharmacyFormState = {};

export function EntryForm({ medicationId }: { medicationId: string }) {
  const [state, formAction, isPending] = useActionState(registerEntry, initialState);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="medicationId" value={medicationId} />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700">N.º de lote</label>
          <input name="batchNumber" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Vencimiento</label>
          <input type="date" name="expirationDate" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
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

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-teal-600 px-3 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
      >
        {isPending ? "Guardando..." : "Registrar entrada"}
      </button>
    </form>
  );
}
