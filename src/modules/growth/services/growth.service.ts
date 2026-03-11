import { toAppError } from "@core/errors/to-app-error";
import { httpClient } from "@core/http/client.instance";
import { companyService } from "@modules/company/services/company.service";
import {
  GrowthApi,
  type GrowthSummaryApiResponse,
  type GrowthUpsertPlaybooksPayload,
} from "@modules/growth/services/growth-api";
import type {
  GrowthAttributionSummary,
  GrowthChannel,
  GrowthDashboardBundle,
  GrowthDashboardQuery,
  GrowthDispatchResult,
  GrowthOpportunity,
  GrowthOpportunitySourceModule,
  GrowthOpportunityStatus,
  GrowthPlaybook,
} from "@modules/growth/interfaces/growth.model";
import { usersAuthService } from "@modules/users/services/auth.service";

const DAY_MS = 24 * 60 * 60 * 1000;

const DEFAULT_WINDOW_DAYS = 30;
const DEFAULT_LIMIT = 20;

const BASE_FALLBACK_PLAYBOOKS: Omit<GrowthPlaybook, "workspaceId">[] = [
  {
    id: "reactivation-30d",
    title: "Reactivate inactive clients",
    description: "Target clients without recent activity to recover demand quickly.",
    enabled: true,
    channels: ["whatsapp", "email"],
    goal: "reactivation",
    delayHours: 6,
    maxTouches: 3,
    updatedAt: null,
  },
  {
    id: "upsell-after-completion",
    title: "Upsell after completed service",
    description: "Send a timely recommendation after successful delivery.",
    enabled: true,
    channels: ["whatsapp", "email"],
    goal: "upsell",
    delayHours: 4,
    maxTouches: 2,
    updatedAt: null,
  },
  {
    id: "finance-recovery",
    title: "Recover delayed billing",
    description: "Prioritize unfinished billing moments to protect cashflow.",
    enabled: true,
    channels: ["email", "sms"],
    goal: "recovery",
    delayHours: 2,
    maxTouches: 4,
    updatedAt: null,
  },
];

type GrowthRecord = Record<string, unknown>;

function toRecord(value: unknown): GrowthRecord | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as GrowthRecord;
}

function toStringValue(value: unknown): string | undefined {
  if (typeof value === "string") {
    const normalized = value.trim();
    return normalized.length > 0 ? normalized : undefined;
  }
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return undefined;
}

function toNumberValue(value: unknown): number | undefined {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function toBooleanValue(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

function toDateKey(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function formatISOFromNow(deltaDays: number): string {
  const date = new Date(Date.now() + deltaDays * DAY_MS);
  return date.toISOString();
}

function normalizeStatus(value: unknown): GrowthOpportunityStatus {
  const key = toStringValue(value)?.toLowerCase();
  if (key === "queued") return "queued";
  if (key === "sent") return "sent";
  if (key === "converted") return "converted";
  if (key === "archived") return "archived";
  return "new";
}

function normalizeSourceModule(value: unknown): GrowthOpportunitySourceModule {
  const key = toStringValue(value)?.toLowerCase();
  if (key === "schedule") return "schedule";
  if (key === "work-order" || key === "workorder" || key === "work_order") return "work-order";
  if (key === "finance") return "finance";
  return "clients";
}

function normalizeChannel(value: unknown): GrowthChannel | null {
  const key = toStringValue(value)?.toLowerCase();
  if (key === "email") return "email";
  if (key === "sms") return "sms";
  if (key === "whatsapp") return "whatsapp";
  return null;
}

function normalizeChannels(value: unknown, fallback: GrowthChannel[]): GrowthChannel[] {
  if (!Array.isArray(value) || value.length <= 0) return fallback;
  const normalized = Array.from(
    new Set(
      value
        .map((channel) => normalizeChannel(channel))
        .filter((channel): channel is GrowthChannel => Boolean(channel))
    )
  );
  return normalized.length > 0 ? normalized : fallback;
}

function nowIso(): string {
  return new Date().toISOString();
}

function resolveWorkspaceIdFromValue(value: DataValue): string | undefined {
  if (!value || typeof value !== "object") return undefined;
  const record = value as DataMap;
  const byWorkspaceId = toStringValue(record.workspaceId);
  if (byWorkspaceId) return byWorkspaceId;
  return toStringValue(record.id);
}

function mapOpportunity(value: unknown, fallbackWorkspaceId: string): GrowthOpportunity | null {
  const record = toRecord(value);
  if (!record) return null;

  const id = toStringValue(record.id) ?? toStringValue(record.uid);
  const clientName =
    toStringValue(record.clientName) ??
    toStringValue(record.customerName) ??
    toStringValue(record.contactName);
  const title = toStringValue(record.title) ?? toStringValue(record.trigger);
  const createdAt = toStringValue(record.createdAt) ?? toStringValue(record.created_at) ?? nowIso();

  if (!id || !clientName || !title) return null;

  return {
    id,
    workspaceId:
      toStringValue(record.workspaceId) ??
      toStringValue(record.workspace_id) ??
      fallbackWorkspaceId,
    clientName,
    clientEmail: toStringValue(record.clientEmail) ?? toStringValue(record.email) ?? null,
    clientPhone: toStringValue(record.clientPhone) ?? toStringValue(record.phone) ?? null,
    title,
    summary: toStringValue(record.summary) ?? toStringValue(record.description) ?? null,
    status: normalizeStatus(record.status),
    sourceModule: normalizeSourceModule(record.sourceModule ?? record.module),
    expectedValueCents: toNumberValue(record.expectedValueCents) ?? toNumberValue(record.expected_value_cents) ?? null,
    confidenceScore: toNumberValue(record.confidenceScore) ?? toNumberValue(record.confidence_score) ?? null,
    lastInteractionAt:
      toStringValue(record.lastInteractionAt) ??
      toStringValue(record.last_interaction_at) ??
      null,
    dueAt: toStringValue(record.dueAt) ?? toStringValue(record.due_at) ?? null,
    createdAt,
  };
}

function mapPlaybook(value: unknown, fallbackWorkspaceId: string): GrowthPlaybook | null {
  const record = toRecord(value);
  if (!record) return null;

  const id = toStringValue(record.id);
  const title = toStringValue(record.title) ?? toStringValue(record.name);
  if (!id || !title) return null;

  const goalKey = toStringValue(record.goal)?.toLowerCase();
  const goal: GrowthPlaybook["goal"] =
    goalKey === "recovery"
      ? "recovery"
      : goalKey === "upsell"
      ? "upsell"
      : "reactivation";

  return {
    id,
    workspaceId:
      toStringValue(record.workspaceId) ??
      toStringValue(record.workspace_id) ??
      fallbackWorkspaceId,
    title,
    description: toStringValue(record.description) ?? null,
    enabled: toBooleanValue(record.enabled) ?? true,
    channels: normalizeChannels(record.channels, ["email"]),
    goal,
    delayHours: Math.max(0, Math.round(toNumberValue(record.delayHours) ?? 0)),
    maxTouches: Math.max(1, Math.round(toNumberValue(record.maxTouches) ?? 1)),
    updatedAt: toStringValue(record.updatedAt) ?? toStringValue(record.updated_at) ?? null,
  };
}

function normalizePlaybook(
  playbook: GrowthPlaybook,
  workspaceId: string,
  updatedAt: string
): GrowthPlaybook {
  return {
    id: playbook.id.trim(),
    workspaceId,
    title: playbook.title.trim() || "Playbook",
    description: playbook.description?.trim() || null,
    enabled: !!playbook.enabled,
    channels: normalizeChannels(playbook.channels, ["email"]),
    goal:
      playbook.goal === "upsell" || playbook.goal === "recovery"
        ? playbook.goal
        : "reactivation",
    delayHours: Math.max(0, Math.round(playbook.delayHours)),
    maxTouches: Math.max(1, Math.round(playbook.maxTouches)),
    updatedAt,
  };
}

function mapSummary(
  value: GrowthSummaryApiResponse | null | undefined,
  fallbackWorkspaceId: string,
  from: string,
  to: string
): GrowthAttributionSummary {
  return {
    workspaceId: toStringValue(value?.workspaceId) ?? fallbackWorkspaceId,
    windowStart: toStringValue(value?.windowStart) ?? from,
    windowEnd: toStringValue(value?.windowEnd) ?? to,
    dispatchedCount: Math.max(0, Math.round(toNumberValue(value?.dispatchedCount) ?? 0)),
    convertedCount: Math.max(0, Math.round(toNumberValue(value?.convertedCount) ?? 0)),
    conversionRatePercent: Math.max(0, toNumberValue(value?.conversionRatePercent) ?? 0),
    recoveredRevenueCents: Math.max(0, Math.round(toNumberValue(value?.recoveredRevenueCents) ?? 0)),
    averageHoursToConvert: toNumberValue(value?.averageHoursToConvert) ?? null,
  };
}

function includesSearch(opportunity: GrowthOpportunity, search: string): boolean {
  if (!search) return true;
  const normalized = search.toLowerCase();
  const bucket = [
    opportunity.clientName,
    opportunity.clientEmail,
    opportunity.clientPhone,
    opportunity.title,
    opportunity.summary,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return bucket.includes(normalized);
}

function buildDefaultPlaybooks(workspaceId: string): GrowthPlaybook[] {
  return BASE_FALLBACK_PLAYBOOKS.map((item) => ({
    ...item,
    workspaceId,
    channels: [...item.channels],
    updatedAt: null,
  }));
}

function buildFallbackOpportunities(workspaceId: string): GrowthOpportunity[] {
  return [
    {
      id: "fallback-reactivation-01",
      workspaceId,
      clientName: "Inactive clients segment",
      title: "No appointments in the last 30 days",
      summary: "Launch a reactivation campaign with priority to high-value clients.",
      status: "new",
      sourceModule: "schedule",
      expectedValueCents: 145000,
      confidenceScore: 72,
      lastInteractionAt: formatISOFromNow(-33),
      dueAt: formatISOFromNow(2),
      createdAt: formatISOFromNow(-1),
      clientEmail: null,
      clientPhone: null,
    },
    {
      id: "fallback-upsell-02",
      workspaceId,
      clientName: "Completed work-order clients",
      title: "Post-service upsell window open",
      summary: "Offer complementary service within 48h of positive delivery.",
      status: "queued",
      sourceModule: "work-order",
      expectedValueCents: 92000,
      confidenceScore: 66,
      lastInteractionAt: formatISOFromNow(-2),
      dueAt: formatISOFromNow(1),
      createdAt: formatISOFromNow(-2),
      clientEmail: null,
      clientPhone: null,
    },
    {
      id: "fallback-recovery-03",
      workspaceId,
      clientName: "Pending billing clients",
      title: "Execution completed with delayed billing",
      summary: "Send recovery reminder and convert execution into invoice faster.",
      status: "sent",
      sourceModule: "finance",
      expectedValueCents: 178500,
      confidenceScore: 79,
      lastInteractionAt: formatISOFromNow(-4),
      dueAt: formatISOFromNow(0),
      createdAt: formatISOFromNow(-4),
      clientEmail: null,
      clientPhone: null,
    },
  ];
}

function computeSummaryFromOpportunities(
  workspaceId: string,
  opportunities: GrowthOpportunity[],
  from: string,
  to: string
): GrowthAttributionSummary {
  const dispatchedCount = opportunities.filter((item) => item.status === "sent" || item.status === "converted").length;
  const convertedCount = opportunities.filter((item) => item.status === "converted").length;
  const convertedRevenue = opportunities
    .filter((item) => item.status === "converted")
    .reduce((sum, item) => sum + (item.expectedValueCents ?? 0), 0);
  const conversionRatePercent = dispatchedCount > 0 ? (convertedCount / dispatchedCount) * 100 : 0;

  return {
    workspaceId,
    windowStart: from,
    windowEnd: to,
    dispatchedCount,
    convertedCount,
    conversionRatePercent: Math.round(conversionRatePercent * 100) / 100,
    recoveredRevenueCents: Math.round(convertedRevenue),
    averageHoursToConvert: convertedCount > 0 ? 18 : null,
  };
}

export class GrowthService {
  private readonly api = new GrowthApi(httpClient);

  private readonly inFlightDashboard = new Map<string, Promise<GrowthDashboardBundle>>();

  private readonly fallbackPlaybooksByWorkspace = new Map<string, GrowthPlaybook[]>();

  private readonly fallbackStatusByWorkspace = new Map<string, Map<string, GrowthOpportunityStatus>>();

  private resolveWorkspaceId(explicitWorkspaceId?: string): string | null {
    if (explicitWorkspaceId?.trim()) return explicitWorkspaceId.trim();
    return resolveWorkspaceIdFromValue(companyService.getWorkspaceValue()) ?? null;
  }

  private resolveDateWindow(query: GrowthDashboardQuery): { from: string; to: string } {
    const to = query.to?.trim() || toDateKey(new Date());
    const from =
      query.from?.trim() || toDateKey(new Date(Date.now() - DEFAULT_WINDOW_DAYS * DAY_MS));
    return { from, to };
  }

  private getFallbackPlaybooks(workspaceId: string): GrowthPlaybook[] {
    const existing = this.fallbackPlaybooksByWorkspace.get(workspaceId);
    if (existing && existing.length > 0) {
      return existing.map((item) => ({ ...item, channels: [...item.channels] }));
    }

    const defaults = buildDefaultPlaybooks(workspaceId);
    this.fallbackPlaybooksByWorkspace.set(workspaceId, defaults);
    return defaults.map((item) => ({ ...item, channels: [...item.channels] }));
  }

  private applyStatusOverrides(
    workspaceId: string,
    opportunities: GrowthOpportunity[]
  ): GrowthOpportunity[] {
    const statusMap = this.fallbackStatusByWorkspace.get(workspaceId);
    if (!statusMap || statusMap.size <= 0) return opportunities;

    return opportunities.map((opportunity) => {
      const overrideStatus = statusMap.get(opportunity.id);
      if (!overrideStatus) return opportunity;
      return { ...opportunity, status: overrideStatus };
    });
  }

  private setStatusOverrides(
    workspaceId: string,
    ids: string[],
    status: GrowthOpportunityStatus
  ): void {
    if (ids.length <= 0) return;
    const existing = this.fallbackStatusByWorkspace.get(workspaceId) ?? new Map<string, GrowthOpportunityStatus>();
    ids.forEach((id) => {
      if (id.trim()) existing.set(id.trim(), status);
    });
    this.fallbackStatusByWorkspace.set(workspaceId, existing);
  }

  private buildFallbackBundle(
    workspaceId: string,
    query: GrowthDashboardQuery
  ): GrowthDashboardBundle {
    const { from, to } = this.resolveDateWindow(query);
    const requestedStatus = query.status && query.status !== "all" ? query.status : undefined;
    const requestedSearch = query.search?.trim().toLowerCase() ?? "";

    const opportunitiesRaw = buildFallbackOpportunities(workspaceId);
    const opportunities = this.applyStatusOverrides(workspaceId, opportunitiesRaw)
      .filter((item) => (requestedStatus ? item.status === requestedStatus : true))
      .filter((item) => includesSearch(item, requestedSearch));

    const playbooks = this.getFallbackPlaybooks(workspaceId);
    const summary = computeSummaryFromOpportunities(workspaceId, opportunities, from, to);

    return {
      workspaceId,
      source: "fallback",
      generatedAt: nowIso(),
      opportunities,
      playbooks,
      summary,
    };
  }

  async fetchDashboard(query: GrowthDashboardQuery = {}): Promise<GrowthDashboardBundle> {
    const workspaceId = this.resolveWorkspaceId(query.workspaceId);
    if (!workspaceId) {
      throw toAppError("Workspace is required to load growth autopilot.", {
        kind: "Validation",
      });
    }

    const normalizedStatus = query.status && query.status !== "all" ? query.status : undefined;
    const { from, to } = this.resolveDateWindow(query);
    const search = query.search?.trim() || undefined;
    const limit = Number.isFinite(query.limit) ? query.limit : DEFAULT_LIMIT;
    const offset = Number.isFinite(query.offset) ? query.offset : 0;

    const requestKey = [
      workspaceId,
      search ?? "",
      normalizedStatus ?? "all",
      from,
      to,
      String(limit),
      String(offset),
    ].join("|");

    const inFlight = this.inFlightDashboard.get(requestKey);
    if (inFlight) return inFlight;

    const request = (async () => {
      try {
        const [opportunitiesResponse, playbooksResponse, summaryResponse] = await Promise.all([
          this.api.listOpportunities({
            workspaceId,
            search,
            status: normalizedStatus,
            from,
            to,
            limit: Math.max(1, limit ?? DEFAULT_LIMIT),
            offset: Math.max(0, offset ?? 0),
          }),
          this.api.listPlaybooks(workspaceId),
          this.api.getAttributionSummary(workspaceId, { from, to }),
        ]);

        const opportunitiesRaw = opportunitiesResponse.items ?? opportunitiesResponse.opportunities ?? [];
        const opportunities = opportunitiesRaw
          .map((item) => mapOpportunity(item, workspaceId))
          .filter((item): item is GrowthOpportunity => Boolean(item));
        const playbooksRaw = playbooksResponse.items ?? playbooksResponse.playbooks ?? [];
        const playbooks = playbooksRaw
          .map((item) => mapPlaybook(item, workspaceId))
          .filter((item): item is GrowthPlaybook => Boolean(item));

        if (opportunities.length > 0 || playbooks.length > 0) {
          const summary = mapSummary(summaryResponse, workspaceId, from, to);
          return {
            workspaceId,
            source: "backend" as const,
            generatedAt: nowIso(),
            opportunities: this.applyStatusOverrides(workspaceId, opportunities),
            playbooks,
            summary,
          };
        }
      } catch {
        // Falls back to local snapshot when endpoints are not ready.
      }

      return this.buildFallbackBundle(workspaceId, {
        workspaceId,
        search,
        status: normalizedStatus ?? "all",
        from,
        to,
        limit,
        offset,
      });
    })();

    this.inFlightDashboard.set(requestKey, request);
    try {
      return await request;
    } finally {
      this.inFlightDashboard.delete(requestKey);
    }
  }

  async savePlaybooks(
    workspaceId: string,
    playbooks: GrowthPlaybook[]
  ): Promise<GrowthPlaybook[]> {
    const normalizedWorkspaceId = this.resolveWorkspaceId(workspaceId);
    if (!normalizedWorkspaceId) {
      throw toAppError("Workspace is required to save playbooks.", { kind: "Validation" });
    }

    const updatedAt = nowIso();
    const normalized = playbooks
      .map((item) => normalizePlaybook(item, normalizedWorkspaceId, updatedAt))
      .filter((item) => item.id.length > 0);

    const payload: GrowthUpsertPlaybooksPayload = {
      workspaceId: normalizedWorkspaceId,
      actorUid: usersAuthService.getSessionValue()?.uid ?? undefined,
      playbooks: normalized,
    };

    try {
      const response = await this.api.upsertPlaybooks(payload);
      const rows = response.playbooks ?? response.items ?? [];
      const mapped = rows
        .map((item) => mapPlaybook(item, normalizedWorkspaceId))
        .filter((item): item is GrowthPlaybook => Boolean(item));
      if (mapped.length > 0) {
        this.fallbackPlaybooksByWorkspace.set(normalizedWorkspaceId, mapped);
        return mapped;
      }
    } catch {
      // Uses local persistence fallback in memory.
    }

    this.fallbackPlaybooksByWorkspace.set(normalizedWorkspaceId, normalized);
    return normalized;
  }

  async dispatch(
    workspaceId: string,
    opportunityIds: string[],
    playbookId?: string
  ): Promise<GrowthDispatchResult> {
    const normalizedWorkspaceId = this.resolveWorkspaceId(workspaceId);
    if (!normalizedWorkspaceId) {
      throw toAppError("Workspace is required to dispatch opportunities.", {
        kind: "Validation",
      });
    }

    const normalizedIds = opportunityIds
      .map((id) => id.trim())
      .filter((id) => id.length > 0);
    if (normalizedIds.length <= 0) {
      throw toAppError("Select at least one opportunity to dispatch.", {
        kind: "Validation",
      });
    }

    try {
      const response = await this.api.dispatch({
        workspaceId: normalizedWorkspaceId,
        actorUid: usersAuthService.getSessionValue()?.uid ?? undefined,
        playbookId: playbookId?.trim() || undefined,
        opportunityIds: normalizedIds,
      });

      this.setStatusOverrides(normalizedWorkspaceId, normalizedIds, "sent");

      return {
        workspaceId: normalizedWorkspaceId,
        dispatchedCount: Math.max(
          normalizedIds.length,
          Math.round(toNumberValue(response.dispatchedCount) ?? 0)
        ),
        source: "backend",
      };
    } catch {
      this.setStatusOverrides(normalizedWorkspaceId, normalizedIds, "sent");
      return {
        workspaceId: normalizedWorkspaceId,
        dispatchedCount: normalizedIds.length,
        source: "fallback",
      };
    }
  }
}

export const growthService = new GrowthService();

export default growthService;
