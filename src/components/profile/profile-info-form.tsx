"use client";

import { useActionState } from "react";
import { updateOwnProfile, type ProfileFormState } from "@/app/dashboard/perfil/actions";

const initialState: ProfileFormState = {};

export function ProfileInfoForm({
  firstName,
  lastName,
  phone,
}: {
  firstName: string;
  lastName: string;
  phone: string | null;
}) {
  const [state, formAction, isPending] = useActionState(updateOwnProfile, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700">Nombres *</label>
          <input name="firstName" defaultValue={firstName} required className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Apellidos *</label>
          <input name="lastName" defaultValue={lastName} required className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Teléfono</label>
        <input name="phone" defaultValue={phone ?? ""} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
      </div>

      {state.success && <p className="text-sm text-teal-700">Perfil actualizado.</p>}
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-teal-600 px-3 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
      >
        {isPending ? "Guardando..." : "Guardar cambios"}
      </button>
    </form>
  );
}
