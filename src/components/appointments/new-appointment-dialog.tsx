"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Plus, X } from "lucide-react";
import { createAppointment, type AppointmentFormState } from "@/app/dashboard/citas/actions";

const initialState: AppointmentFormState = {};

type Option = { id: string; label: string };

export function NewAppointmentDialog({
  patients,
  doctors,
}: {
  patients: Option[];
  doctors: Option[];
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(createAppointment, initialState);
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

  function handleOpen() {
    setOpen(true);
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className="inline-flex items-center gap-2 rounded-md bg-teal-600 px-3 py-2 text-sm font-medium text-white hover:bg-teal-700"
      >
        <Plus className="h-4 w-4" />
        Nueva cita
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Nueva cita</h2>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {!hasEntities ? (
              <p className="mt-4 text-sm text-slate-600">
                Necesitas al menos un paciente y un médico registrados antes de
                crear una cita.
              </p>
            ) : (
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
                  <label className="block text-sm font-medium text-slate-700">Médico *</label>
                  <select
                    name="doctorId"
                    required
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  >
                    <option value="">Selecciona un médico</option>
                    {doctors.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Fecha *</label>
                    <input
                      type="date"
                      name="date"
                      required
                      className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Hora *</label>
                    <input
                      type="time"
                      name="time"
                      required
                      className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Duración (min)</label>
                    <input
                      type="number"
                      min="5"
                      step="5"
                      name="durationMinutes"
                      defaultValue={30}
                      className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">Motivo</label>
                  <input
                    name="reason"
                    placeholder="Control, dolor abdominal, etc."
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
                    {isPending ? "Guardando..." : "Guardar"}
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
