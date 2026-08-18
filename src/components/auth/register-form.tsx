"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerClinic } from "@/app/register/actions";

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(registerClinic, {});

  return (
    <form action={formAction} className="w-full max-w-md space-y-4 rounded-lg border border-slate-200 bg-white p-8">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Crea tu clínica</h1>
        <p className="mt-1 text-sm text-slate-500">
          Tu cuenta será la administradora de la clínica.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Nombre de la clínica</label>
        <input
          name="clinicName"
          required
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700">Nombres</label>
          <input
            name="firstName"
            required
            autoComplete="given-name"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Apellidos</label>
          <input
            name="lastName"
            required
            autoComplete="family-name"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Email</label>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Contraseña</label>
        <input
          type="password"
          name="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <p className="mt-1 text-xs text-slate-400">Mínimo 8 caracteres.</p>
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-teal-600 px-3 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
      >
        {isPending ? "Creando..." : "Crear clínica"}
      </button>

      <p className="text-center text-sm text-slate-500">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-medium text-teal-700 hover:underline">
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}
