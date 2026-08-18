import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/tenant";
import { ROLE_LABELS } from "@/lib/roles";
import { ShiftForm } from "@/components/staff/shift-form";
import { deleteShift, checkIn, checkOut } from "../actions";

const DAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

function formatTime(date: Date) {
  return date.toISOString().slice(11, 16);
}

export default async function StaffMemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { clinicId } = await requireTenant();

  const member = await prisma.user.findFirst({ where: { id, clinicId } });
  if (!member) notFound();

  const [shifts, attendance] = await Promise.all([
    prisma.staffShift.findMany({ where: { userId: id, clinicId }, orderBy: { dayOfWeek: "asc" } }),
    prisma.attendanceRecord.findMany({
      where: { userId: id, clinicId },
      orderBy: { date: "desc" },
      take: 10,
    }),
  ]);

  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const todayRecord = attendance.find((a) => a.date.getTime() === today.getTime());

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-xl font-semibold text-slate-900">{member.firstName} {member.lastName}</h1>
      <p className="mt-1 text-sm text-slate-500">{ROLE_LABELS[member.role]} · {member.email}</p>

      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Asistencia de hoy</h2>
          <div className="flex gap-2">
            <form action={checkIn}>
              <input type="hidden" name="userId" value={id} />
              <button
                type="submit"
                disabled={!!todayRecord?.checkIn}
                className="rounded-md bg-teal-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-40"
              >
                Marcar entrada
              </button>
            </form>
            <form action={checkOut}>
              <input type="hidden" name="userId" value={id} />
              <button
                type="submit"
                disabled={!todayRecord?.checkIn || !!todayRecord?.checkOut}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
              >
                Marcar salida
              </button>
            </form>
          </div>
        </div>
        <p className="mt-2 text-sm text-slate-500">
          {todayRecord?.checkIn ? `Entrada: ${formatTime(todayRecord.checkIn)}` : "Sin marcar"}
          {todayRecord?.checkOut ? ` · Salida: ${formatTime(todayRecord.checkOut)}` : ""}
        </p>

        {attendance.length > 0 && (
          <ul className="mt-4 space-y-1.5 border-t border-slate-100 pt-3">
            {attendance.map((a) => (
              <li key={a.id} className="flex justify-between text-xs text-slate-500">
                <span>{a.date.toLocaleDateString("es-PE")}</span>
                <span>
                  {a.checkIn ? formatTime(a.checkIn) : "—"} / {a.checkOut ? formatTime(a.checkOut) : "—"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-900">Agregar turno</h2>
          <div className="mt-3">
            <ShiftForm userId={id} />
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-900">Horario semanal</h2>
          <ul className="mt-3 space-y-2">
            {shifts.map((s) => (
              <li key={s.id} className="flex items-center justify-between text-sm">
                <span className="text-slate-700">
                  {DAYS[s.dayOfWeek]} {formatTime(s.startTime)}–{formatTime(s.endTime)}
                </span>
                <form action={deleteShift}>
                  <input type="hidden" name="id" value={s.id} />
                  <input type="hidden" name="userId" value={id} />
                  <button type="submit" className="text-xs text-red-600 hover:underline">Quitar</button>
                </form>
              </li>
            ))}
            {shifts.length === 0 && <li className="text-sm text-slate-400">Sin turnos asignados.</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}
