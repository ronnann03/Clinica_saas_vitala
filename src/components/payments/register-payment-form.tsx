"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAdditionalPayment, type PaymentFormState } from "@/app/dashboard/pagos/actions";

const initialState: PaymentFormState = {};

const METHODS = [
  { value: "cash", label: "Efectivo" },
  { value: "card", label: "Tarjeta" },
  { value: "transfer", label: "Transferencia" },
  { value: "yape", label: "Yape" },
  { value: "plin", label: "Plin" },
];

export function RegisterPaymentForm({ id, balance }: { id: string; balance: number }) {
  const [state, formAction, isPending] = useActionState(registerAdditionalPayment, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={id} />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700">Monto a abonar (S/) *</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            max={balance}
            name="amount"
            required
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <p className="mt-1 text-xs text-slate-400">Saldo pendiente: S/ {balance.toFixed(2)}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Método de pago *</label>
          <select
            name="method"
            required
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">Selecciona</option>
            {METHODS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <div className="flex justify-end gap-2 pt-2">
        <Link
          href="/dashboard/pagos"
          className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-teal-600 px-3 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
        >
          {isPending ? "Guardando..." : "Registrar abono"}
        </button>
      </div>
    </form>
  );
}
