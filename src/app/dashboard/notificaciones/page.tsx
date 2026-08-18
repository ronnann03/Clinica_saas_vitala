import {
  Bell,
  CalendarCheck,
  CalendarX,
  Clock,
  CreditCard,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/tenant";
import { markAsRead, markAllAsRead } from "./actions";

const TYPE_ICON: Record<string, typeof Bell> = {
  appointment_created: CalendarCheck,
  appointment_confirmed: CalendarCheck,
  appointment_cancelled: CalendarX,
  appointment_rescheduled: Clock,
  appointment_completed: CalendarCheck,
  appointment_no_show: CalendarX,
  payment_received: CreditCard,
  payment_pending: CreditCard,
};

function timeAgo(date: Date) {
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "ahora mismo";
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return `hace ${days} d`;
}

export default async function NotificacionesPage() {
  const { clinicId, userId } = await requireTenant();

  const notifications = await prisma.notification.findMany({
    where: { clinicId, OR: [{ userId: null }, { userId }] },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Notificaciones</h1>
          <p className="mt-1 text-sm text-slate-500">
            {unreadCount > 0 ? `${unreadCount} sin leer` : "Todo al día"}
          </p>
        </div>
        {unreadCount > 0 && (
          <form action={markAllAsRead}>
            <button type="submit" className="text-sm font-medium text-teal-700 hover:underline">
              Marcar todas como leídas
            </button>
          </form>
        )}
      </div>

      <div className="mt-6 space-y-2">
        {notifications.map((n) => {
          const Icon = TYPE_ICON[n.type] ?? Bell;
          const message = (n.payload as { message?: string } | null)?.message ?? n.type;
          const isUnread = !n.readAt;

          return (
            <div
              key={n.id}
              className={`flex items-start gap-3 rounded-lg border p-4 ${
                isUnread ? "border-teal-200 bg-teal-50/50" : "border-slate-200 bg-white"
              }`}
            >
              <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${isUnread ? "text-teal-600" : "text-slate-400"}`} />
              <div className="min-w-0 flex-1">
                <p className={`text-sm ${isUnread ? "font-medium text-slate-900" : "text-slate-600"}`}>
                  {message}
                </p>
                <p className="mt-0.5 text-xs text-slate-400">{timeAgo(n.createdAt)}</p>
              </div>
              {isUnread && (
                <form action={markAsRead}>
                  <input type="hidden" name="id" value={n.id} />
                  <button type="submit" className="text-xs font-medium text-teal-700 hover:underline">
                    Marcar leída
                  </button>
                </form>
              )}
            </div>
          );
        })}
        {notifications.length === 0 && (
          <p className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-400">
            Aún no tienes notificaciones. Aparecerán aquí cuando se creen citas,
            se confirmen, se cancelen o se registren pagos.
          </p>
        )}
      </div>
    </div>
  );
}
