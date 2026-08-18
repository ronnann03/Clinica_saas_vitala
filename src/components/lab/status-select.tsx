"use client";

import { useRef, useTransition } from "react";
import { updateLabOrderStatus } from "@/app/dashboard/laboratorio/actions";
import type { LabOrderStatus } from "@prisma/client";

const STATUS_LABELS: Record<LabOrderStatus, string> = {
  ordered: "Solicitada",
  in_progress: "En proceso",
  completed: "Completada",
  cancelled: "Anulada",
};

const STATUS_STYLES: Record<LabOrderStatus, string> = {
  ordered: "bg-amber-50 text-amber-700 border-amber-200",
  in_progress: "bg-indigo-50 text-indigo-700 border-indigo-200",
  completed: "bg-teal-50 text-teal-700 border-teal-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

export function StatusSelect({ id, status }: { id: string; status: LabOrderStatus }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form ref={formRef} action={(fd) => startTransition(() => updateLabOrderStatus(fd))}>
      <input type="hidden" name="id" value={id} />
      <select
        name="status"
        defaultValue={status}
        disabled={isPending || status === "completed"}
        onChange={() => formRef.current?.requestSubmit()}
        className={`rounded-full border px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[status]} disabled:opacity-60`}
      >
        {Object.entries(STATUS_LABELS)
          .filter(([value]) => value !== "completed" || status === "completed")
          .map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
      </select>
    </form>
  );
}
