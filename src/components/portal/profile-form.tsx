"use client";

import { useActionState } from "react";
import { updateProfile, type ProfileFormState } from "@/app/portal/perfil/actions";

const initialState: ProfileFormState = {};

type EmergencyContact = { name?: string; phone?: string } | null;

export function ProfileForm({
  phone,
  address,
  emergencyContact,
}: {
  phone: string | null;
  address: string | null;
  emergencyContact: EmergencyContact;
}) {
  const [state, formAction, isPending] = useActionState(updateProfile, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700">Teléfono</label>
        <input name="phone" defaultValue={phone ?? ""} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Dirección</label>
        <input name="address" defaultValue={address ?? ""} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700">Contacto de emergencia</label>
          <input name="emergencyContactName" defaultValue={emergencyContact?.name ?? ""} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Teléfono de emergencia</label>
          <input name="emergencyContactPhone" defaultValue={emergencyContact?.phone ?? ""} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
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
