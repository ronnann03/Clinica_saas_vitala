import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { FichaCard } from "@/components/landing/ficha-card";
import { ModuleTabs } from "@/components/landing/module-tabs";
import { TenantTree } from "@/components/landing/tenant-tree";

const ROLES = [
  "Administrador",
  "Médico",
  "Enfermero",
  "Recepcionista",
  "Laboratorio",
  "Farmacia",
  "Paciente",
];

export default async function Home() {
  const session = await getSession();
  if (session) redirect(session.user.role === "paciente" ? "/portal" : "/dashboard");

  return (
    <div className="flex-1 bg-paper text-ink">
      {/* Nav */}
      <header className="border-b border-hairline">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="font-mono text-sm font-semibold tracking-[0.15em] text-ink">
            VITALA
          </span>
          <nav className="flex items-center gap-5">
            <Link href="/login" className="text-sm font-medium text-ink-soft hover:text-ink">
              Iniciar sesión
            </Link>
            <Link
              href="/register"
              className="rounded-sm bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-deep"
            >
              Crear clínica
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 px-6 py-16 sm:py-24 lg:grid-cols-2 lg:gap-10">
        <div>
          <p className="font-mono text-xs font-semibold tracking-[0.2em] text-brand">
            GESTIÓN CLÍNICA · MULTIESPECIALIDAD
          </p>
          <h1 className="mt-4 text-4xl leading-[1.1] font-semibold tracking-tight text-ink sm:text-5xl">
            El kárdex de tu clínica, ahora vive en la nube.
          </h1>
          <p className="mt-5 max-w-md text-[17px] leading-relaxed text-ink-soft">
            Pacientes, citas, historias clínicas y pagos — organizados por
            clínica, no por hoja suelta ni Excel disperso.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/register"
              className="rounded-sm bg-brand px-6 py-3 text-sm font-medium text-white hover:bg-brand-deep"
            >
              Crear mi clínica
            </Link>
            <Link href="/login" className="text-sm font-medium text-ink-soft hover:text-ink">
              Ya tengo cuenta →
            </Link>
          </div>
          <p className="mt-4 font-mono text-xs text-ink-soft">
            Sin tarjeta de crédito. Tu clínica, tus datos.
          </p>
        </div>

        <div className="lg:pl-6">
          <FichaCard />
        </div>
      </section>

      {/* Modules */}
      <section className="border-t border-hairline">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <p className="font-mono text-xs font-semibold tracking-[0.2em] text-brand">
            TODO EL EXPEDIENTE, EN UN SOLO SITIO
          </p>
          <h2 className="mt-3 max-w-xl text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Cada carpeta que usa tu clínica, ahora es una pestaña.
          </h2>
          <div className="mt-10">
            <ModuleTabs />
          </div>
        </div>
      </section>

      {/* Multi-tenant */}
      <section className="border-t border-hairline bg-white">
        <div className="mx-auto max-w-4xl px-6 py-16 sm:py-20">
          <p className="font-mono text-xs font-semibold tracking-[0.2em] text-brand">
            UNA CUENTA, VARIAS CLÍNICAS SI LAS NECESITAS
          </p>
          <h2 className="mt-3 max-w-xl text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Cada clínica tiene su propio expediente. Nada se mezcla entre sedes.
          </h2>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-ink-soft">
            Los datos de una clínica nunca se cruzan con los de otra. Cada
            cuenta administra su propio personal, pacientes, citas y pagos
            de forma independiente.
          </p>

          <div className="mt-12">
            <TenantTree />
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="border-t border-hairline">
        <div className="mx-auto max-w-4xl px-6 py-16 sm:py-20">
          <p className="font-mono text-xs font-semibold tracking-[0.2em] text-brand">
            CADA QUIEN VE LO SUYO
          </p>
          <h2 className="mt-3 max-w-xl text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Permisos por rol, no por buena fe.
          </h2>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-ink-soft">
            El portal del paciente muestra solo sus citas y resultados. El
            área de farmacia solo ve stock y recetas. Nadie ve más de lo que
            su rol necesita.
          </p>
          <div className="mt-6 flex flex-wrap gap-2.5">
            {ROLES.map((role) => (
              <span
                key={role}
                className="rounded-full border border-hairline px-3.5 py-1.5 font-mono text-xs text-ink-soft"
              >
                {role}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-hairline bg-ink">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center sm:py-20">
          <h2 className="text-2xl font-semibold tracking-tight text-paper sm:text-3xl">
            Deja el cuaderno de citas. Empieza tu kárdex digital.
          </h2>
          <Link
            href="/register"
            className="mt-8 inline-block rounded-sm bg-brand px-6 py-3 text-sm font-medium text-white hover:bg-brand-deep"
          >
            Crear mi clínica
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-hairline">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-8 text-sm text-ink-soft sm:flex-row">
          <span className="font-mono text-xs tracking-wider">VITALA</span>
          <span>Gestión clínica multiespecialidad.</span>
        </div>
      </footer>
    </div>
  );
}
