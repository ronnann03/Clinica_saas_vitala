"use client";

import { useActionState } from "react";
import { registerMovement, type InventoryFormState } from "@/app/dashboard/inventario/actions";

const initialState: InventoryFormState = {};

export function MovementForm({ itemId }: { itemId: string }) {
  const [state, formAction, isPending] = useActionState(registerMovement, initialState);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="itemId" value={itemId} />

      <div>
        <label className="block text-sm font-medium text-slate-700">Tipo de movimiento *</label>
        <select name="type" required className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
          <option value="in">Entrada (ingreso de stock)</option>
          <option value="out">Salida (consumo/uso)</option>
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
          placeholder="Compra, ajuste, uso en consulta, etc."
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400"
        />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-teal-600 px-3 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
      >
        {isPending ? "Guardando..." : "Registrar movimiento"}
      </button>
    </form>
  );
}
