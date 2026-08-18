import type { LucideIcon } from "lucide-react";
import { CalendarDays, FileText, FlaskConical, LayoutDashboard, Receipt, User } from "lucide-react";

export type PortalNavItem = { href: string; label: string; icon: LucideIcon };

export const PORTAL_NAV_ITEMS: PortalNavItem[] = [
  { href: "/portal", label: "Resumen", icon: LayoutDashboard },
  { href: "/portal/citas", label: "Mis citas", icon: CalendarDays },
  { href: "/portal/pagos", label: "Mis pagos", icon: Receipt },
  { href: "/portal/recetas", label: "Mis recetas", icon: FileText },
  { href: "/portal/resultados", label: "Mis resultados", icon: FlaskConical },
  { href: "/portal/perfil", label: "Mi perfil", icon: User },
];
