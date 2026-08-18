"use client";

import { useActionState } from "react";
import { addLabResult, type LabFormState } from "@/app/dashboard/laboratorio/actions";

const initialState: LabFormState = {};

export function ResultForm({ id }: { id: string }) {
  const [state, formAction, isPending] = useActionState(addLabResult, initialState);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="id" value={id} />

      <div>
        <label className="block text-sm font-medium text-slate-700">Resultado / notas</label>
        <textarea
          name="resultNotes"
          rows={4}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Enlace al archivo (opcional)</label>
        <input
          type="url"
          name="resultFileUrl"
          placeholder="https://..."
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400"
        />
        <p className="mt-1 text-xs text-slate-400">
          Aún no hay carga de archivos integrada; puedes pegar un enlace si ya tienes el PDF alojado en otro sitio.
        </p>
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-teal-600 px-3 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
      >
        {isPending ? "Guardando..." : "Guardar resultado y completar"}
      </button>
    </form>
  );
}
