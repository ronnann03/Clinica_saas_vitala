import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/tenant";
import { ROLE_LABELS } from "@/lib/roles";
import { NewStaffDialog } from "@/components/staff/new-staff-dialog";
import { toggleActive } from "./actions";

export default async function PersonalPage() {
  const { clinicId } = await requireTenant();

  const users = await prisma.user.findMany({
    where: { clinicId },
    orderBy: { firstName: "asc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Personal</h1>
          <p className="mt-1 text-sm text-slate-500">
            {users.length} persona{users.length === 1 ? "" : "s"} con acceso al sistema.
          </p>
        </div>
        <NewStaffDialog />
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Nombre</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Rol</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Estado</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-sm font-medium text-slate-900">
                  <Link href={`/dashboard/personal/${u.id}`} className="hover:text-teal-700">
                    {u.firstName} {u.lastName}
                  </Link>
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">{ROLE_LABELS[u.role]}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{u.email}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
                      u.active
                        ? "border-teal-200 bg-teal-50 text-teal-700"
                        : "border-slate-200 bg-slate-100 text-slate-500"
                    }`}
                  >
                    {u.active ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-sm">
                  <form action={toggleActive}>
                    <input type="hidden" name="id" value={u.id} />
                    <input type="hidden" name="active" value={String(u.active)} />
                    <button type="submit" className="text-teal-700 hover:underline">
                      {u.active ? "Desactivar" : "Activar"}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-400">
                  Aún no hay personal registrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
