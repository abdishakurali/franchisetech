export const DB_ROLES = ["owner", "manager", "staff", "cashier", "auditor", "kitchen"] as const;

export type DbRole = (typeof DB_ROLES)[number];

export function isDbRole(role: string | null | undefined): role is DbRole {
  return DB_ROLES.includes(role as DbRole);
}

export function canManageBilling(role: string | null | undefined) {
  return role === "owner";
}

export function canManageTeam(role: string | null | undefined) {
  return role === "owner";
}

export function canUsePos(role: string | null | undefined) {
  return role === "owner" || role === "manager" || role === "staff" || role === "cashier";
}

export function canViewReports(role: string | null | undefined) {
  return role === "owner" || role === "manager" || role === "auditor";
}

export function canUpdateKitchen(role: string | null | undefined) {
  return role === "owner" || role === "manager" || role === "kitchen";
}
