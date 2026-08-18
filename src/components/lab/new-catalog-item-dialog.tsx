"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Plus, X } from "lucide-react";
import { createLabCatalogItem, type LabFormState } from "@/app/dashboard/laboratorio/actions";

const initialState: LabFormState = {};

export function NewCatalogItemDialog() {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(createLabCatalogItem, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const wasPending = useRef(false);

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
        Nuevo examen
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Nuevo examen</h2>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form ref={formRef} action={formAction} className="mt-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700">Nombre *</label>
                <input name="name" required className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Descripción</label>
                <input name="description" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Precio (S/)</label>
                <input type="number" step="0.01" min="0" name="price" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
              </div>

              {state.error && <p className="text-sm text-red-600">{state.error}</p>}

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
                  Cancelar
                </button>
                <button type="submit" disabled={isPending} className="rounded-md bg-teal-600 px-3 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50">
                  {isPending ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
