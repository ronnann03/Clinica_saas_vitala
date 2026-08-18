"use client";

import { useActionState } from "react";
import Link from "next/link";
import { rescheduleAppointment, type AppointmentFormState } from "@/app/dashboard/citas/actions";

const initialState: AppointmentFormState = {};

export function RescheduleForm({
  id,
  defaultDate,
  defaultTime,
}: {
  id: string;
  defaultDate: string;
  defaultTime: string;
}) {
  const [state, formAction, isPending] = useActionState(rescheduleAppointment, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={id} />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700">Fecha</label>
          <input
            type="date"
            name="date"
            required
            defaultValue={defaultDate}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Hora</label>
          <input
            type="time"
            name="time"
            required
            defaultValue={defaultTime}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <div className="flex justify-end gap-2 pt-2">
        <Link
          href="/dashboard/citas"
          className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-teal-600 px-3 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
        >
          {isPending ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}
