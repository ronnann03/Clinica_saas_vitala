import type { LucideIcon } from "lucide-react";
import {
  Bell,
  Boxes,
  CalendarDays,
  FileHeart,
  FlaskConical,
  LayoutDashboard,
  Pill,
  Receipt,
  Stethoscope,
  Users,
  UsersRound,
  BarChart3,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Planned feature bullets — shown on stub pages until the module ships. */
  features: string[];
  live?: boolean;
};

export const NAV_ITEMS: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    live: true,
    features: [
      "Resumen de citas",
      "Pacientes del día",
      "Ingresos",
      "Pagos pendientes",
      "Citas canceladas",
      "Médicos disponibles",
    ],
  },
  {
    href: "/dashboard/pacientes",
    label: "Pacientes",
    icon: Users,
    live: true,
    features: [
      "Registro y edición",
      "Contactos y seguro",
      "Antecedentes y alergias",
      "Historial clínico, citas y pagos",
      "Documentos",
    ],
  },
  {
    href: "/dashboard/medicos",
    label: "Médicos y especialistas",
    icon: Stethoscope,
    live: true,
    features: [
      "Especialidades",
      "Consultorio y tarifas",
      "Cuenta de acceso propia",
      "Duración de consulta",
    ],
  },
  {
    href: "/dashboard/citas",
    label: "Citas",
    icon: CalendarDays,
    live: true,
    features: [
      "Reservar y reprogramar",
      "Confirmar, cancelar, lista de espera",
      "Estado de cita",
      "Agenda por médico",
    ],
  },
  {
    href: "/dashboard/pagos",
    label: "Pagos y facturación",
    icon: Receipt,
    live: true,
    features: [
      "Cobro de citas (total/parcial)",
      "Efectivo, tarjeta, transferencia, Yape/Plin",
      "Comprobantes y reembolsos",
      "Historial de transacciones",
    ],
  },
  {
    href: "/dashboard/consultas",
    label: "Consultas médicas",
    icon: FileHeart,
    live: true,
    features: [
      "Anamnesis y signos vitales",
      "Examen físico y diagnóstico",
      "Tratamiento y evolución",
      "Próxima cita",
    ],
  },
  {
    href: "/dashboard/farmacia",
    label: "Farmacia",
    icon: Pill,
    live: true,
    features: ["Stock y lotes", "Vencimientos", "Recetas", "Alertas de stock"],
  },
  {
    href: "/dashboard/laboratorio",
    label: "Laboratorio",
    icon: FlaskConical,
    live: true,
    features: ["Catálogo de exámenes", "Órdenes médicas", "Resultados"],
  },
  {
    href: "/dashboard/inventario",
    label: "Inventario",
    icon: Boxes,
    live: true,
    features: ["Insumos, materiales y equipos", "Stock por almacén", "Entradas y salidas"],
  },
  {
    href: "/dashboard/personal",
    label: "Personal",
    icon: UsersRound,
    live: true,
    features: ["Roles y permisos", "Horarios y turnos", "Asistencia"],
  },
  {
    href: "/dashboard/notificaciones",
    label: "Notificaciones",
    icon: Bell,
    live: true,
    features: ["Nueva cita, confirmación, cancelación", "Reprogramación", "Pagos recibidos y pendientes"],
  },
  {
    href: "/dashboard/reportes",
    label: "Reportes",
    icon: BarChart3,
    live: true,
    features: ["Citas e ingresos por período", "No asistieron", "Métodos de pago"],
  },
];
