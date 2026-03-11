import type { UserOverviewModule } from "@modules/users/services/overview-api";

const GROWTH_FALLBACK_MODULE: UserOverviewModule = {
  uid: "growth-autopilot",
  name: "Growth",
  description: "Automate retention, reactivation, and billing recovery.",
  icon: "sparkles",
};

export function isGrowthModule(module: UserOverviewModule): boolean {
  const bucket = `${module.uid ?? ""} ${module.name ?? ""}`.toLowerCase();
  return (
    bucket.includes("growth") ||
    bucket.includes("autopilot") ||
    bucket.includes("retention") ||
    bucket.includes("reactivation")
  );
}

export function ensureGrowthModule(modules: UserOverviewModule[] | null | undefined): UserOverviewModule[] {
  const current = Array.isArray(modules) ? modules : [];
  if (current.some((module) => isGrowthModule(module))) return current;
  return [...current, GROWTH_FALLBACK_MODULE];
}
