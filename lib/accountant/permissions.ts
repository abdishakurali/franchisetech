export const ACCOUNTANT_PERMISSIONS = ["sales", "cash", "stock", "purchases", "documents"] as const;
export type AccountantPermission = (typeof ACCOUNTANT_PERMISSIONS)[number];
export type PackageSection = "sales" | "payments" | "cash" | "stock" | "purchases" | "documents";

export function normalizeAccountantPermissions(value: unknown): AccountantPermission[] {
  if (value === undefined || value === null) return [...ACCOUNTANT_PERMISSIONS];
  if (!Array.isArray(value)) return [];
  return ACCOUNTANT_PERMISSIONS.filter((permission) => value.includes(permission));
}

export function packageSections(value: unknown): PackageSection[] {
  const permissions = normalizeAccountantPermissions(value);
  const sections: PackageSection[] = [];
  if (permissions.includes("sales")) sections.push("sales", "payments");
  if (permissions.includes("cash")) sections.push("cash");
  if (permissions.includes("stock")) sections.push("stock");
  if (permissions.includes("purchases")) sections.push("purchases");
  // Source documents stay hidden until every exported row can be linked to
  // an actual stored file. An empty category would mislead the accountant.
  return sections;
}
