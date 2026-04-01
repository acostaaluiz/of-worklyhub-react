import { i18n as appI18n } from "@core/i18n";
import type { UserOverviewModule } from "@modules/users/services/overview-api";

export type ModuleCatalogKey =
  | "billing"
  | "clients"
  | "company"
  | "dashboard"
  | "finance"
  | "growth"
  | "inventory"
  | "people"
  | "schedule"
  | "services"
  | "sla"
  | "workOrder";

export function getLocalizedModuleCopy(
  service: UserOverviewModule,
  to: string | undefined
): { title: string; description?: string } {
  const catalogKey = resolveModuleCatalogKey(service, to);
  if (!catalogKey) {
    return { title: service.name, description: service.description };
  }

  const titleKey = `allModules.catalog.${catalogKey}.title`;
  const descriptionKey = `allModules.catalog.${catalogKey}.description`;

  const title = appI18n.t(titleKey, { defaultValue: service.name });
  const description = appI18n.t(descriptionKey, {
    defaultValue: service.description ?? "",
  });

  return { title, description: description || undefined };
}

export function resolveModuleCatalogKey(
  service: UserOverviewModule,
  to: string | undefined
): ModuleCatalogKey | null {
  const key = normalizeText(`${service.uid ?? ""} ${service.name ?? ""} ${service.description ?? ""}`);

  if (to === "/billing/landing" || key.includes("billing") || key.includes("plan") || key.includes("faturamento") || key.includes("assinatura") || key.includes("cobranca")) return "billing";
  if (to === "/clients/landing") return "clients";
  if (to === "/dashboard/landing" || key.includes("dashboard") || key.includes("indicador") || key.includes("kpi")) return "dashboard";
  if (to === "/finance/landing" || key.includes("finance") || key.includes("payment") || key.includes("financial") || key.includes("financeiro") || key.includes("pagamento")) return "finance";
  if (
    to === "/growth/landing" ||
    key.includes("growth") ||
    key.includes("autopilot") ||
    key.includes("retention") ||
    key.includes("reactivation") ||
    key.includes("retencao") ||
    key.includes("reativacao")
  ) {
    return "growth";
  }
  if (to === "/inventory/landing" || key.includes("inventory") || key.includes("stock") || key.includes("estoque") || key.includes("insumo")) return "inventory";
  if (to === "/people/landing" || key.includes("people") || key.includes("team") || key.includes("staff") || key.includes("pessoa") || key.includes("equipe")) return "people";
  if (to === "/schedule/landing" || key.includes("schedule") || key.includes("calendar") || key.includes("appointment") || key.includes("agenda") || key.includes("agendamento")) return "schedule";
  if (to === "/work-order/landing" || key.includes("work-order") || key.includes("work order") || key.includes("workorder") || key.includes("ordem de servico")) {
    return "workOrder";
  }
  if (to === "/company/slas" || key.includes("sla") || key.includes("service-level") || key.includes("nivel de servico")) return "sla";
  if (to === "/company/landing") {
    if (key.includes("service") || key.includes("catalog") || key.includes("servico") || key.includes("catalogo")) return "services";
    return "company";
  }

  if (key.includes("company") || key.includes("empresa")) return "company";
  if (key.includes("service") || key.includes("catalog") || key.includes("servico") || key.includes("catalogo")) return "services";

  return null;
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}
