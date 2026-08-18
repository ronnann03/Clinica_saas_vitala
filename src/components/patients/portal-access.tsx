"use client";

import { useActionState } from "react";
import { activatePortalAccess, type PortalAccessFormState } from "@/app/dashboard/pacientes/actions";

const initialState: PortalAccessFormState = {};

export function PortalAccess({ patientId, defaultEmail }: { patientId: string; defaultEmail: string | null }) {
  const [state, formAction, isPending] = useActionState(activatePortalAccess, initialState);

  if (state.success) {
    return (
      <div className="rounded-md border border-teal-200 bg-teal-50 p-4 text-sm text-teal-900">
        <p className="font-medium">Acceso al portal activado.</p>
        <p className="mt-2">Email: <span className="font-mono">{state.success.email}</span></p>
        <p>Contraseña temporal: <span className="font-mono">{state.success.tempPassword}</span></p>
        <p className="mt-2 text-xs text-teal-700">
          Compártela con el paciente. No se volverá a mostrar.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-slate-700">Email del paciente</label>
        <input
          type="email"
          name="email"
          defaultValue={defaultEmail ?? ""}
          required
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>
      <input type="hidden" name="patientId" value={patientId} />
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-teal-600 px-3 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
      >
        {isPending ? "Activando..." : "Activar acceso al portal"}
      </button>
    </form>
  );
}
