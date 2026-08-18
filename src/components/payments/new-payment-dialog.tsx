"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Plus, X } from "lucide-react";
import { createPayment, type PaymentFormState } from "@/app/dashboard/pagos/actions";

const initialState: PaymentFormState = {};

type Option = { id: string; label: string };

const METHODS = [
  { value: "cash", label: "Efectivo" },
  { value: "card", label: "Tarjeta" },
  { value: "transfer", label: "Transferencia" },
  { value: "yape", label: "Yape" },
  { value: "plin", label: "Plin" },
];

export function NewPaymentDialog({
  patients,
  appointments,
}: {
  patients: Option[];
  appointments: Option[];
}) {
  const [open, setOpen] = useState(false);
  const [paymentState, setPaymentState] = useState<"full" | "partial" | "pending">("full");
  const [state, formAction, isPending] = useActionState(createPayment, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !isPending && !state.error) {
      formRef.current?.reset();
      setPaymentState("full");
      setOpen(false);
    }
    wasPending.current = isPending;
  }, [isPending, state]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-md bg-teal-600 px-3 py-2 text-sm font-medium text-white hover:bg-teal-700"
      >
        <Plus className="h-4 w-4" />
        Nuevo cobro
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Nuevo cobro</h2>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form ref={formRef} action={formAction} className="mt-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700">Paciente *</label>
                <select
                  name="patientId"
                  required
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="">Selecciona un paciente</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Cita relacionada</label>
                <select
                  name="appointmentId"
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="">Sin cita asociada</option>
                  {appointments.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Monto total (S/) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    name="amount"
                    required
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  />
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

              <div>
                <label className="block text-sm font-medium text-slate-700">Estado del cobro</label>
                <select
                  name="paymentState"
                  value={paymentState}
                  onChange={(e) => setPaymentState(e.target.value as typeof paymentState)}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="full">Pagado por completo</option>
                  <option value="partial">Pago parcial (abono)</option>
                  <option value="pending">Pendiente — aún no paga</option>
                </select>
              </div>

              {paymentState === "partial" && (
                <div>
                  <label className="block text-sm font-medium text-slate-700">Monto pagado ahora (S/) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    name="amountPaid"
                    required
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700">Notas</label>
                <input
                  name="notes"
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              {state.error && <p className="text-sm text-red-600">{state.error}</p>}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-md bg-teal-600 px-3 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
                >
                  {isPending ? "Guardando..." : "Registrar cobro"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
