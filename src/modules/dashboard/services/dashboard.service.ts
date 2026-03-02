import dayjs from "dayjs";
import { centsToMoney, formatDateShort } from "@core/utils/mask";
import { httpClient } from "@core/http/client.instance";
import { toAppError } from "@core/errors/to-app-error";
import { companyService } from "@modules/company/services/company.service";

import type { DashboardQueryModel } from "../interfaces/dashboard-query.model";
import type { DashboardKpiModel } from "../interfaces/dashboard-kpi.model";
import type { DashboardSeriesPointModel } from "../interfaces/dashboard-series.model";
import type { DashboardServiceSalesModel } from "../interfaces/dashboard-service-sales.model";
import type { DashboardAlertModel } from "../interfaces/dashboard-alert.model";
import { DashboardApi } from "./dashboard-api";

export type DashboardResponse = {
  kpis: DashboardKpiModel[];
  revenueSeries: DashboardSeriesPointModel[];
  serviceBreakdown: DashboardServiceSalesModel[];
  alerts: DashboardAlertModel[];
};

function resolveWorkspaceId(): string | undefined {
  const ws = companyService.getWorkspaceValue() as
    | { workspaceId?: string; workspace_id?: string; id?: string }
    | null;
  return (ws?.workspaceId ?? ws?.workspace_id ?? ws?.id) as string | undefined;
}

function mapBucketLabel(bucket: string, groupBy: DashboardQueryModel["groupBy"]): string {
  const parsed = dayjs(bucket);
  if (!parsed.isValid()) return bucket;

  if (groupBy === "month") return parsed.format("MMM");
  if (groupBy === "week") return formatDateShort(parsed);
  return parsed.format("DD");
}

function toApiQuery(query: DashboardQueryModel) {
  return {
    start: query.from,
    end: query.to,
    bucket: query.groupBy,
  } as const;
}

function buildFallbackTrendBuckets(query: DashboardQueryModel): string[] {
  const start = dayjs(query.from, "YYYY-MM-DD");
  const end = dayjs(query.to, "YYYY-MM-DD");

  if (!start.isValid() || !end.isValid() || start.isAfter(end)) {
    return [];
  }

  const unit: "day" | "week" | "month" = query.groupBy;
  const buckets: string[] = [];
  let cursor = start;
  const maxPoints = 90;

  while (cursor.isBefore(end) || cursor.isSame(end, "day")) {
    buckets.push(cursor.format("YYYY-MM-DD"));
    if (buckets.length >= maxPoints) break;
    cursor = cursor.add(1, unit);
  }

  return buckets;
}

export class DashboardService {
  private api = new DashboardApi(httpClient);

  async getDashboard(query: DashboardQueryModel): Promise<DashboardResponse> {
    try {
      const workspaceId = resolveWorkspaceId();
      if (!workspaceId) {
        throw new Error("workspaceId is required");
      }

      const apiQuery = toApiQuery(query);
      const [summaryResult, trendResult, alertsResult] = await Promise.allSettled([
        this.api.getSummary(workspaceId, apiQuery),
        this.api.getTrend(workspaceId, apiQuery),
        this.api.getAlerts(workspaceId, apiQuery),
      ]);

      if (summaryResult.status === "rejected") {
        throw summaryResult.reason;
      }

      if (trendResult.status === "rejected") {
        throw trendResult.reason;
      }

      const summary = summaryResult.value;
      const trend = trendResult.value;
      const alertsRes =
        alertsResult.status === "fulfilled"
          ? alertsResult.value
          : { alerts: [] as DashboardAlertModel[] };

      const kpis: DashboardKpiModel[] = [
        {
          id: "appointments",
          label: "Appointments today",
          value: summary.kpis.appointmentsToday,
          format: "number",
        },
        {
          id: "work-orders-open",
          label: "Open work orders",
          value: summary.kpis.openWorkOrders,
          format: "number",
        },
        {
          id: "active-workers",
          label: "Active workers",
          value: summary.kpis.activeWorkers,
          format: "number",
        },
        {
          id: "completion-rate",
          label: "Completion rate",
          value: summary.kpis.completionRatePct,
          format: "percent",
        },
      ];

      const trendSeries =
        trend.series.length > 0
          ? trend.series
          : buildFallbackTrendBuckets(query).map((bucket) => ({
              bucket,
              revenueCents: 0,
              profitCents: 0,
            }));

      const revenueSeries: DashboardSeriesPointModel[] = trendSeries.map((point) => ({
        key: point.bucket,
        label: mapBucketLabel(point.bucket, query.groupBy),
        revenue: centsToMoney(point.revenueCents),
        profit: centsToMoney(point.profitCents),
      }));

      const serviceBreakdown: DashboardServiceSalesModel[] = summary.topServices.map((service) => ({
        serviceId: service.serviceId,
        serviceName: service.serviceName,
        count: service.orders,
        revenue: centsToMoney(service.revenueCents),
      }));

      const alerts: DashboardAlertModel[] = alertsRes.alerts.map((alert) => ({
        id: alert.id,
        source: alert.source,
        priority: alert.priority,
        title: alert.title,
        description: alert.description,
        suggestedAction: alert.suggestedAction,
      }));

      return {
        kpis,
        revenueSeries,
        serviceBreakdown,
        alerts,
      };
    } catch (err) {
      throw toAppError(err);
    }
  }
}
