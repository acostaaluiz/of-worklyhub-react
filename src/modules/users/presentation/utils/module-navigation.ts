export type ModuleLookup = { id?: string; title?: string };

export function resolveModulePath(
  { id, title }: ModuleLookup,
  fallback: string | undefined = "/home"
): string | undefined {
  const idKey = (id ?? "").toString().toLowerCase();
  const titleKey = (title ?? "").toString().toLowerCase();
  const key = idKey || titleKey;

  if (key.includes("all-modules") || key.includes("all modules") || key.includes("see-all") || key.includes("see all") || (key.includes("all") && key.includes("services"))) {
    return "/modules";
  }

  if (key.includes("billing") || key.includes("plan")) return "/billing/landing";
  if (key.includes("finance") || key.includes("payment")) return "/finance/landing";
  if (key.includes("schedule") || key.includes("calendar")) return "/schedule/landing";
  if (key.includes("client")) return "/clients/landing";
  if (key.includes("service") || key.includes("services") || key.includes("catalog")) return "/company/landing";
  if (key.includes("inventory") || key.includes("stock")) return "/inventory/landing";
  if (key.includes("people") || key.includes("team") || key.includes("staff")) return "/people/landing";
  if (key.includes("dashboard")) return "/dashboard/landing";
  if (key.includes("company")) return "/company/landing";
  if (key.includes("users") || key.includes("profile")) return "/users";

  return fallback;
}
