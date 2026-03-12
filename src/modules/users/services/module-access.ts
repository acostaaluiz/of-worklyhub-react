import type { UserOverviewModule } from "@modules/users/services/overview-api";

const ALWAYS_ALLOWED_PRIVATE_PREFIXES = [
  "/home",
  "/users",
  "/modules",
  "/tutorials",
  "/notifications",
  "/settings",
  "/billing",
  "/company/introduction",
] as const;

const MODULE_ROUTE_REQUIREMENTS: Array<{ prefix: string; anyOf: string[] }> = [
  { prefix: "/company/slas", anyOf: ["sla"] },
  { prefix: "/company", anyOf: ["company", "services"] },
  { prefix: "/schedule", anyOf: ["schedule"] },
  { prefix: "/dashboard", anyOf: ["dashboard"] },
  { prefix: "/finance", anyOf: ["finance"] },
  { prefix: "/clients", anyOf: ["clients"] },
  { prefix: "/inventory", anyOf: ["inventory"] },
  { prefix: "/people", anyOf: ["people"] },
  { prefix: "/work-order", anyOf: ["work-order"] },
  { prefix: "/growth", anyOf: ["growth"] },
];

function normalizePath(pathname: string | null | undefined): string {
  if (!pathname || typeof pathname !== "string") return "/";
  const trimmed = pathname.trim().toLowerCase();
  if (!trimmed) return "/";
  const withLeadingSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  if (withLeadingSlash.length > 1 && withLeadingSlash.endsWith("/")) {
    return withLeadingSlash.slice(0, -1);
  }
  return withLeadingSlash;
}

function matchesPrefix(pathname: string, prefix: string): boolean {
  return (
    pathname === prefix ||
    pathname.startsWith(`${prefix}/`) ||
    pathname.startsWith(`${prefix}?`) ||
    pathname.startsWith(`${prefix}#`)
  );
}

export function toModuleAccessKey(raw: string | null | undefined): string | null {
  if (!raw || typeof raw !== "string") return null;
  const key = raw.trim().toLowerCase();
  if (!key) return null;

  if (key.includes("work-order") || key.includes("workorder")) return "work-order";
  if (key.includes("sla")) return "sla";
  if (key.includes("growth") || key.includes("autopilot") || key.includes("retention")) return "growth";
  if (key === "service" || key === "catalog") return "services";
  if (key === "client") return "clients";
  if (key === "person" || key === "team" || key === "staff") return "people";

  return key;
}

export function getEnabledModuleKeys(modules: UserOverviewModule[] | null | undefined): Set<string> {
  const keys = new Set<string>();
  const current = Array.isArray(modules) ? modules : [];

  current.forEach((module) => {
    const uid = toModuleAccessKey(module.uid);
    const byName = toModuleAccessKey(module.name);
    if (uid) keys.add(uid);
    if (byName) keys.add(byName);
  });

  return keys;
}

export function isAlwaysAllowedPrivatePath(pathname: string | null | undefined): boolean {
  const normalized = normalizePath(pathname);
  return ALWAYS_ALLOWED_PRIVATE_PREFIXES.some((prefix) => matchesPrefix(normalized, prefix));
}

export function getRequiredModuleKeysForPath(pathname: string | null | undefined): string[] | null {
  const normalized = normalizePath(pathname);
  if (isAlwaysAllowedPrivatePath(normalized)) return null;

  const match = MODULE_ROUTE_REQUIREMENTS.find((item) => matchesPrefix(normalized, item.prefix));
  if (!match) return null;
  return match.anyOf;
}

export function canAccessPath(pathname: string | null | undefined, enabledModuleKeys: Set<string>): boolean {
  const required = getRequiredModuleKeysForPath(pathname);
  if (!required || required.length === 0) return true;
  return required.some((key) => enabledModuleKeys.has(key));
}

