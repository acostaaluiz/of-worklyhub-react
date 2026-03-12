import type { UserOverviewModule } from "@modules/users/services/overview-api";

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
  return current.map((module) => {
    if (!isGrowthModule(module)) return module;
    return {
      ...module,
      uid: "growth",
      name: module.name ?? "Growth",
      description: module.description ?? "Automate retention, reactivation, and billing recovery.",
      icon: module.icon ?? "sparkles",
    };
  });
}
