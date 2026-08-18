import Link from "next/link";
import { redirect } from "next/navigation";
import { requireTenant } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import { SidebarNav } from "@/components/sidebar-nav";
import { LogoutButton } from "@/components/auth/logout-button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { clinicId, userId, user } = await requireTenant();
  if (user.role === "paciente") redirect("/portal");
  const [clinic, unreadNotifications] = await Promise.all([
    prisma.clinic.findUnique({ where: { id: clinicId } }),
    prisma.notification.count({
      where: { clinicId, readAt: null, OR: [{ userId: null }, { userId }] },
    }),
  ]);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
        <div className="flex h-16 items-center border-b border-slate-200 px-4">
          <span className="truncate text-sm font-semibold text-slate-900">
            {clinic?.name ?? "Clínica"}
          </span>
        </div>
        <SidebarNav unreadNotifications={unreadNotifications} />
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
          <span className="text-sm font-medium text-slate-700 md:hidden">
            {clinic?.name ?? "Clínica"}
          </span>
          <div className="ml-auto flex items-center gap-3">
            <Link href="/dashboard/perfil" className="text-sm text-slate-600 hover:text-teal-700">
              {user.firstName} {user.lastName}
            </Link>
            <LogoutButton />
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
