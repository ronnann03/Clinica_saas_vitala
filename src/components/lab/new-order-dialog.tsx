"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Plus, X } from "lucide-react";
import { createLabOrder, type LabFormState } from "@/app/dashboard/laboratorio/actions";

const initialState: LabFormState = {};

type Option = { id: string; label: string };

export function NewOrderDialog({
  patients,
  doctors,
  catalog,
}: {
  patients: Option[];
  doctors: Option[];
  catalog: Option[];
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(createLabOrder, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const wasPending = useRef(false);
  const hasEntities = patients.length > 0 && doctors.length > 0;

  useEffect(() => {
    if (wasPending.current && !isPending && !state.error) {
      formRef.current?.reset();
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
        Nueva orden
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Nueva orden de laboratorio</h2>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {!hasEntities ? (
              <p className="mt-4 text-sm text-slate-600">
                Necesitas al menos un paciente y un médico registrados.
              </p>
            ) : (
              <form ref={formRef} action={formAction} className="mt-4 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Paciente *</label>
                  <select name="patientId" required className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
                    <option value="">Selecciona</option>
                    {patients.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">Médico solicitante *</label>
                  <select name="doctorId" required className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
                    <option value="">Selecciona</option>
                    {doctors.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">Examen (del catálogo)</label>
                  <select name="examCatalogId" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
                    <option value="">— Escribir manualmente —</option>
                    {catalog.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">O nombre del examen</label>
                  <input
                    name="examName"
                    placeholder="Hemograma completo, glucosa, etc."
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400"
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
                    {isPending ? "Guardando..." : "Crear orden"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
