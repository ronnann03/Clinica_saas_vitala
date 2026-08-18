"use client";

import { useActionState } from "react";
import { addShift, type ShiftFormState } from "@/app/dashboard/personal/actions";

const initialState: ShiftFormState = {};

const DAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export function ShiftForm({ userId }: { userId: string }) {
  const [state, formAction, isPending] = useActionState(addShift, initialState);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="userId" value={userId} />

      <div>
        <label className="block text-sm font-medium text-slate-700">Día *</label>
        <select name="dayOfWeek" required className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
          {DAYS.map((day, index) => (
            <option key={day} value={index}>{day}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700">Desde *</label>
          <input type="time" name="startTime" required className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Hasta *</label>
          <input type="time" name="endTime" required className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-teal-600 px-3 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
      >
        {isPending ? "Guardando..." : "Agregar turno"}
      </button>
    </form>
  );
}
