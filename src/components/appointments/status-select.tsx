"use client";

import { useRef, useTransition } from "react";
import { updateAppointmentStatus } from "@/app/dashboard/citas/actions";
import type { AppointmentStatus } from "@prisma/client";

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  waiting_list: "Lista de espera",
  completed: "Completada",
  cancelled: "Cancelada",
  no_show: "No asistió",
};

const STATUS_STYLES: Record<AppointmentStatus, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-teal-50 text-teal-700 border-teal-200",
  waiting_list: "bg-indigo-50 text-indigo-700 border-indigo-200",
  completed: "bg-slate-100 text-slate-600 border-slate-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
  no_show: "bg-orange-50 text-orange-700 border-orange-200",
};

export function StatusSelect({ id, status }: { id: string; status: AppointmentStatus }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      ref={formRef}
      action={(fd) => startTransition(() => updateAppointmentStatus(fd))}
    >
      <input type="hidden" name="id" value={id} />
      <select
        name="status"
        defaultValue={status}
        disabled={isPending}
        onChange={() => formRef.current?.requestSubmit()}
        className={`rounded-full border px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[status]} disabled:opacity-60`}
      >
        {Object.entries(STATUS_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </form>
  );
}
