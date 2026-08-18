import type { UserRole } from "@prisma/client";

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "Super admin",
  admin: "Administrador",
  medico: "Médico",
  enfermero: "Enfermero",
  recepcionista: "Recepcionista",
  laboratorio: "Laboratorio",
  farmacia: "Farmacia",
  paciente: "Paciente",
};

/** Roles staff can assign when creating a team member from /dashboard/personal.
 *  Médico has its own flow at /dashboard/medicos (creates a Doctor profile too),
 *  and paciente/super_admin are not created this way. */
export const ASSIGNABLE_STAFF_ROLES: UserRole[] = [
  "admin",
  "enfermero",
  "recepcionista",
  "laboratorio",
  "farmacia",
];
