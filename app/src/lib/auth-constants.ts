export const COOKIE_NAME = "seg_session";

export const USER_ROLES = ["cliente", "editor", "admin"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const ROLE_LABELS: Record<UserRole, string> = {
  cliente: "Equipo Ecopetrol",
  editor: "Editor",
  admin: "Administrador",
};
