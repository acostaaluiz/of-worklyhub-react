import dayjs from "dayjs";
import { httpClient } from "@core/http/client.instance";
import { companyService } from "@modules/company/services/company.service";
import type {
  Client360Bundle,
  ClientProfile,
  ClientTimelineItem,
} from "@modules/clients/interfaces/client-360.model";
import Clients360Api from "@modules/clients/services/clients-360-api";
import {
  listWorkOrdersPage,
} from "@modules/work-order/services/work-order.http.service";
import type { WorkOrder } from "@modules/work-order/interfaces/work-order.model";
import { SchedulesApi, type ScheduleServiceItem } from "@modules/schedule/services/schedules-api";
import { FinanceApi, type FinanceEntryApiRow } from "@modules/finance/services/finance-api";

type FetchClient360Options = {
  workspaceId?: string;
  search?: string;
  from?: string;
  to?: string;
};

type ClientSeed = {
  rawId?: string;
  displayName?: string;
  email?: string;
  phone?: string;
};

type MutableProfile = ClientProfile & {
  tagsSet: Set<string>;
};

const EMAIL_REGEX = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;
const PHONE_REGEX = /(\+?\d[\d\s().-]{7,}\d)/;

function toWorkspaceId(value: DataValue): string | undefined {
  if (typeof value === "string" && value.trim().length > 0) return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return undefined;
}

function toStringSafe(value: DataValue): string | undefined {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return undefined;
}

function normalizeEmail(value?: string): string | undefined {
  if (!value) return undefined;
  const raw = value.trim().toLowerCase();
  if (!raw) return undefined;
  const match = raw.match(EMAIL_REGEX);
  return match?.[0];
}

function normalizePhone(value?: string): string | undefined {
  if (!value) return undefined;
  const match = value.match(PHONE_REGEX);
  const source = match?.[0] ?? value;
  const digits = source.replace(/\D/g, "");
  if (digits.length < 8) return undefined;
  return digits;
}

function extractEmailFromText(value?: string): string | undefined {
  if (!value) return undefined;
  return normalizeEmail(value);
}

function extractPhoneFromText(value?: string): string | undefined {
  if (!value) return undefined;
  return normalizePhone(value);
}

function readMetadataString(metadata: DataMap | undefined, keys: string[]): string | undefined {
  if (!metadata) return undefined;
  for (const key of keys) {
    const val = toStringSafe(metadata[key]);
    if (val) return val;
  }
  return undefined;
}

function asDataMap(value: DataValue): DataMap | undefined {
  if (value && typeof value === "object" && !Array.isArray(value)) return value as DataMap;
  return undefined;
}

function parseAmountCents(value: DataValue): number {
  if (typeof value === "number" && Number.isFinite(value)) return Math.round(value);
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return Math.round(parsed);
  }
  return 0;
}

function inferNameFromWorkOrderTitle(title?: string): string | undefined {
  if (!title) return undefined;
  const parts = title
    .split(" - ")
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length >= 3 && parts[0].toLowerCase().startsWith("wo")) return parts[1];
  return undefined;
}

function inferNameFromScheduleTitle(title?: string): string | undefined {
  if (!title) return undefined;
  const parts = title
    .split(" - ")
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length >= 2) return parts[0];
  return undefined;
}

function normalizeName(value?: string): string | undefined {
  if (!value) return undefined;
  const name = value.replace(/\s+/g, " ").trim();
  return name.length > 0 ? name : undefined;
}

function slug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48);
}

function updateDates(profile: MutableProfile, eventAt: string) {
  if (!profile.firstSeenAt || dayjs(eventAt).isBefore(profile.firstSeenAt)) {
    profile.firstSeenAt = eventAt;
  }
  if (!profile.lastInteractionAt || dayjs(eventAt).isAfter(profile.lastInteractionAt)) {
    profile.lastInteractionAt = eventAt;
  }
}

export class Clients360Service {
  private api = new Clients360Api(httpClient);

  private schedulesApi = new SchedulesApi(httpClient);

  private financeApi = new FinanceApi(httpClient);

  private inFlightRequests = new Map<string, Promise<Client360Bundle>>();

  private resolveWorkspaceId(): string | undefined {
    const ws = companyService.getWorkspaceValue();
    if (!ws) return undefined;
    return toWorkspaceId((ws as DataMap)["workspaceId"]) ?? toWorkspaceId((ws as DataMap)["id"]);
  }

  private buildProfileKey(seed: ClientSeed): string {
    const id = toStringSafe(seed.rawId);
    if (id) return `id:${id.toLowerCase()}`;
    const email = normalizeEmail(seed.email);
    if (email) return `email:${email}`;
    const phone = normalizePhone(seed.phone);
    if (phone) return `phone:${phone}`;
    const name = normalizeName(seed.displayName);
    if (name) return `name:${slug(name)}`;
    return "name:unknown-client";
  }

  private findExistingKey(
    map: Map<string, MutableProfile>,
    seed: ClientSeed
  ): string | undefined {
    const email = normalizeEmail(seed.email);
    if (email) {
      const key = `email:${email}`;
      if (map.has(key)) return key;
    }
    const phone = normalizePhone(seed.phone);
    if (phone) {
      const key = `phone:${phone}`;
      if (map.has(key)) return key;
    }
    const id = toStringSafe(seed.rawId);
    if (id) {
      const key = `id:${id.toLowerCase()}`;
      if (map.has(key)) return key;
    }
    return undefined;
  }

  private ensureProfile(
    map: Map<string, MutableProfile>,
    workspaceId: string,
    seed: ClientSeed,
    eventAt: string
  ): { key: string; profile: MutableProfile } {
    const existing = this.findExistingKey(map, seed);
    const key = existing ?? this.buildProfileKey(seed);
    const normalizedName = normalizeName(seed.displayName) ?? "Client";
    const normalizedEmail = normalizeEmail(seed.email) ?? null;
    const normalizedPhone = normalizePhone(seed.phone) ?? null;

    const profile =
      map.get(key) ??
      ({
        id: slug(key) || `client-${map.size + 1}`,
        workspaceId,
        displayName: normalizedName,
        email: normalizedEmail,
        phone: normalizedPhone,
        firstSeenAt: eventAt,
        lastInteractionAt: eventAt,
        totalAppointments: 0,
        totalWorkOrders: 0,
        totalFinanceEntries: 0,
        totalBilledCents: 0,
        tagsSet: new Set<string>(),
      } satisfies MutableProfile);

    if (!profile.email && normalizedEmail) profile.email = normalizedEmail;
    if (!profile.phone && normalizedPhone) profile.phone = normalizedPhone;
    if (profile.displayName === "Client" && normalizedName !== "Client") {
      profile.displayName = normalizedName;
    }
    updateDates(profile, eventAt);
    map.set(key, profile);
    return { key, profile };
  }

  private async listWorkOrders(workspaceId: string): Promise<WorkOrder[]> {
    const rows: WorkOrder[] = [];
    const visitedOffsets = new Set<number>();
    const limit = 100;
    let offset = 0;
    let hasMore = true;
    let guard = 0;

    while (hasMore && guard < 8) {
      if (visitedOffsets.has(offset)) break;
      visitedOffsets.add(offset);

      const page = await listWorkOrdersPage(workspaceId, { limit, offset });
      const chunk = page.data ?? [];
      rows.push(...chunk);

      const nextOffset =
        typeof page.pagination?.nextOffset === "number" &&
        Number.isFinite(page.pagination.nextOffset)
          ? page.pagination.nextOffset
          : null;
      const explicitHasMore = Boolean(page.pagination?.hasMore);
      hasMore = chunk.length > 0 && (explicitHasMore || chunk.length >= limit);
      if (chunk.length < limit) hasMore = false;

      if (nextOffset != null && nextOffset > offset) offset = nextOffset;
      else offset += chunk.length;

      guard += 1;
      if (chunk.length <= 0) break;
    }
    return rows;
  }

  private async buildAggregatedBundle(
    workspaceId: string,
    options: FetchClient360Options
  ): Promise<Client360Bundle> {
    const from = options.from ?? dayjs().subtract(180, "day").format("YYYY-MM-DD");
    const to = options.to ?? dayjs().add(30, "day").format("YYYY-MM-DD");

    const [scheduleRows, workOrders, financeRows] = await Promise.all([
      this.schedulesApi.listSchedules(workspaceId, { from, to }).catch(() => [] as ScheduleServiceItem[]),
      this.listWorkOrders(workspaceId).catch(() => [] as WorkOrder[]),
      this.financeApi
        .listEntries(workspaceId, { start: from, end: to, limit: 500, offset: 0 })
        .catch(() => [] as FinanceEntryApiRow[]),
    ]);

    const profilesMap = new Map<string, MutableProfile>();
    const timeline: ClientTimelineItem[] = [];
    const workOrderOwner = new Map<string, string>();
    const scheduleOwner = new Map<string, string>();

    scheduleRows.forEach((row) => {
      const title = toStringSafe(row.title) ?? "Schedule event";
      const description = toStringSafe(row.description);
      const eventAt = toStringSafe(row.start) ?? toStringSafe(row.createdAt) ?? dayjs().toISOString();
      const rawClientId = toStringSafe(row.clientId);
      const inferredName = inferNameFromScheduleTitle(title);
      const email = extractEmailFromText(description);
      const phone = extractPhoneFromText(description);

      const { key, profile } = this.ensureProfile(
        profilesMap,
        workspaceId,
        {
          rawId: rawClientId,
          displayName: inferredName ?? rawClientId ?? "Client",
          email,
          phone,
        },
        eventAt
      );

      profile.totalAppointments += 1;
      profile.tagsSet.add("schedule");
      if (row.id) scheduleOwner.set(row.id, key);

      timeline.push({
        id: `schedule-${row.id ?? timeline.length + 1}`,
        clientId: profile.id,
        workspaceId,
        module: "schedule",
        eventAt,
        title,
        description: description ?? null,
        status: row.status?.label ?? row.status?.code ?? null,
        referenceId: row.id ?? null,
      });
    });

    workOrders.forEach((order) => {
      const metadata = asDataMap(order.metadata);
      const title = toStringSafe(order.title) ?? "Work order";
      const description = toStringSafe(order.description);
      const eventAt =
        toStringSafe(order.completedAt) ??
        toStringSafe(order.scheduledStartAt) ??
        toStringSafe(order.createdAt) ??
        dayjs().toISOString();
      const seedName =
        readMetadataString(metadata, ["clientName", "customerName", "patientName", "client", "name"]) ??
        inferNameFromWorkOrderTitle(title) ??
        "Client";
      const seedEmail =
        readMetadataString(metadata, ["email", "clientEmail", "customerEmail", "patientEmail"]) ??
        extractEmailFromText(description);
      const seedPhone =
        readMetadataString(metadata, ["phone", "clientPhone", "customerPhone", "patientPhone"]) ??
        extractPhoneFromText(description);
      const seedRawId = readMetadataString(metadata, ["clientId", "customerId", "patientId"]);

      const { key, profile } = this.ensureProfile(
        profilesMap,
        workspaceId,
        {
          rawId: seedRawId,
          displayName: seedName,
          email: seedEmail,
          phone: seedPhone,
        },
        eventAt
      );

      profile.totalWorkOrders += 1;
      profile.tagsSet.add("work-order");
      workOrderOwner.set(order.id, key);

      timeline.push({
        id: `work-order-${order.id}`,
        clientId: profile.id,
        workspaceId,
        module: "work-order",
        eventAt,
        title: title,
        description: description ?? null,
        status: order.status?.label ?? null,
        amountCents: parseAmountCents(order.totalEstimatedCents),
        referenceId: order.id,
      });
    });

    financeRows.forEach((row) => {
      const description = toStringSafe(row.description) ?? toStringSafe(row.note);
      const eventAt =
        toStringSafe(row.occurred_at) ??
        toStringSafe(row.date) ??
        toStringSafe(row.created_at) ??
        dayjs().toISOString();
      const metadata = asDataMap(row["metadata"]);
      const workOrderRef =
        toStringSafe(row["work_order_id"]) ?? toStringSafe(metadata?.["workOrderId"]);
      const scheduleRef =
        toStringSafe(row["schedule_id"]) ?? toStringSafe(metadata?.["scheduleId"]);

      const ownerKey =
        (workOrderRef ? workOrderOwner.get(workOrderRef) : undefined) ??
        (scheduleRef ? scheduleOwner.get(scheduleRef) : undefined);

      const rowEmail = extractEmailFromText(description);
      const rowPhone = extractPhoneFromText(description);
      const rowName = toStringSafe(metadata?.["clientName"]) ?? toStringSafe(metadata?.["customerName"]) ?? "Client";

      const existingProfile = ownerKey ? profilesMap.get(ownerKey) : undefined;
      const profile =
        existingProfile ??
        this.ensureProfile(
          profilesMap,
          workspaceId,
          {
            displayName: rowName,
            email: rowEmail,
            phone: rowPhone,
          },
          eventAt
        ).profile;
      updateDates(profile, eventAt);

      profile.totalFinanceEntries += 1;
      profile.tagsSet.add("finance");
      const cents = parseAmountCents(row.amount_cents ?? row.amount);
      if (cents > 0) profile.totalBilledCents += cents;

      timeline.push({
        id: `finance-${toStringSafe(row.id) ?? timeline.length + 1}`,
        clientId: profile.id,
        workspaceId,
        module: "finance",
        eventAt,
        title: description ?? "Finance entry",
        description: description ?? null,
        amountCents: cents,
        status: toStringSafe(row.type_direction) ?? toStringSafe(row.direction) ?? null,
        referenceId: toStringSafe(row.id) ?? null,
      });
    });

    const profiles = Array.from(profilesMap.values())
      .map<ClientProfile>((profile) => ({
        id: profile.id,
        workspaceId: profile.workspaceId,
        displayName: profile.displayName,
        email: profile.email,
        phone: profile.phone,
        firstSeenAt: profile.firstSeenAt,
        lastInteractionAt: profile.lastInteractionAt,
        totalAppointments: profile.totalAppointments,
        totalWorkOrders: profile.totalWorkOrders,
        totalFinanceEntries: profile.totalFinanceEntries,
        totalBilledCents: profile.totalBilledCents,
        tags: Array.from(profile.tagsSet.values()).sort((a, b) => a.localeCompare(b)),
      }))
      .sort((a, b) => dayjs(b.lastInteractionAt ?? 0).valueOf() - dayjs(a.lastInteractionAt ?? 0).valueOf());

    const normalizedSearch = (options.search ?? "").trim().toLowerCase();
    const digitsSearch = normalizedSearch.replace(/\D/g, "");
    const filteredProfiles =
      normalizedSearch.length <= 0
        ? profiles
        : profiles.filter((profile) => {
            const name = profile.displayName.toLowerCase();
            const email = (profile.email ?? "").toLowerCase();
            const phone = (profile.phone ?? "").replace(/\D/g, "");
            return (
              name.includes(normalizedSearch) ||
              email.includes(normalizedSearch) ||
              (digitsSearch.length > 0 && phone.includes(digitsSearch))
            );
          });

    const visibleIds = new Set(filteredProfiles.map((profile) => profile.id));
    const filteredTimeline = timeline
      .filter((item) => visibleIds.has(item.clientId))
      .sort((a, b) => dayjs(b.eventAt).valueOf() - dayjs(a.eventAt).valueOf());

    return {
      generatedAt: new Date().toISOString(),
      source: "aggregated",
      profiles: filteredProfiles,
      timeline: filteredTimeline,
    };
  }

  async fetchBundle(options: FetchClient360Options = {}): Promise<Client360Bundle> {
    const workspaceId = options.workspaceId ?? this.resolveWorkspaceId();
    if (!workspaceId) {
      return {
        generatedAt: new Date().toISOString(),
        source: "aggregated",
        profiles: [],
        timeline: [],
      };
    }

    const requestKey = [
      workspaceId,
      (options.search ?? "").trim().toLowerCase(),
      options.from ?? "",
      options.to ?? "",
    ].join("|");
    const inFlight = this.inFlightRequests.get(requestKey);
    if (inFlight) return inFlight;

    const request = (async () => {
      try {
        const backendBundle = await this.api.getBundle(workspaceId, options.search);
        if (
          backendBundle &&
          Array.isArray(backendBundle.profiles) &&
          Array.isArray(backendBundle.timeline)
        ) {
          return backendBundle;
        }
      } catch {
        // fallback to aggregation for MVP
      }

      return this.buildAggregatedBundle(workspaceId, options);
    })();

    this.inFlightRequests.set(requestKey, request);
    try {
      return await request;
    } finally {
      this.inFlightRequests.delete(requestKey);
    }
  }
}

export const clients360Service = new Clients360Service();

export default clients360Service;
