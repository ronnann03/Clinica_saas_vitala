"use client";

import { useActionState, useEffect, useRef } from "react";
import { changeOwnPassword, type PasswordFormState } from "@/app/dashboard/perfil/actions";

const initialState: PasswordFormState = {};

export function ChangePasswordForm() {
  const [state, formAction, isPending] = useActionState(changeOwnPassword, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700">Contraseña actual *</label>
        <input
          type="password"
          name="currentPassword"
          required
          autoComplete="current-password"
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Nueva contraseña *</label>
        <input
          type="password"
          name="newPassword"
          required
          minLength={8}
          autoComplete="new-password"
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <p className="mt-1 text-xs text-slate-400">Mínimo 8 caracteres.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Confirmar nueva contraseña *</label>
        <input
          type="password"
          name="confirmPassword"
          required
          autoComplete="new-password"
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      {state.success && <p className="text-sm text-teal-700">Contraseña actualizada.</p>}
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-teal-600 px-3 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
      >
        {isPending ? "Actualizando..." : "Cambiar contraseña"}
      </button>
    </form>
  );
}
