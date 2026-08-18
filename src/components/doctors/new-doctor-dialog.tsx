"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Plus, X } from "lucide-react";
import { createDoctor, type DoctorFormState } from "@/app/dashboard/medicos/actions";

const initialState: DoctorFormState = {};

export function NewDoctorDialog() {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(createDoctor, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-md bg-teal-600 px-3 py-2 text-sm font-medium text-white hover:bg-teal-700"
      >
        <Plus className="h-4 w-4" />
        Nuevo médico
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Nuevo médico</h2>
              <button
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {state.success ? (
              <div className="mt-4 space-y-3">
                <div className="rounded-md border border-teal-200 bg-teal-50 p-4 text-sm text-teal-900">
                  <p className="font-medium">Médico creado correctamente.</p>
                  <p className="mt-2">
                    Cuenta de acceso: <span className="font-mono">{state.success.email}</span>
                  </p>
                  <p>
                    Contraseña temporal:{" "}
                    <span className="font-mono">{state.success.tempPassword}</span>
                  </p>
                  <p className="mt-2 text-xs text-teal-700">
                    Compártela con el médico para su primer inicio de sesión. No se
                    volverá a mostrar.
                  </p>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => setOpen(false)}
                    className="rounded-md bg-teal-600 px-3 py-2 text-sm font-medium text-white hover:bg-teal-700"
                  >
                    Listo
                  </button>
                </div>
              </div>
            ) : (
              <form ref={formRef} action={formAction} className="mt-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Nombres *</label>
                    <input
                      name="firstName"
                      required
                      className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Apellidos *</label>
                    <input
                      name="lastName"
                      required
                      className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Email (será su usuario de acceso) *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Especialidad</label>
                    <input
                      name="specialty"
                      placeholder="Medicina general"
                      className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">N.º colegiatura</label>
                    <input
                      name="licenseNumber"
                      className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Tarifa (S/)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      name="consultationFee"
                      className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Duración (min)</label>
                    <input
                      type="number"
                      min="5"
                      step="5"
                      name="consultationDurationMinutes"
                      defaultValue={30}
                      className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Consultorio</label>
                    <input
                      name="consultorio"
                      className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>
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
                    {isPending ? "Creando..." : "Crear médico"}
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
