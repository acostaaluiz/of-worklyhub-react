import { useCallback, useMemo } from "react";
import dayjs from "dayjs";
import type { ScheduleCategory } from "../interfaces/schedule-category.model";
import type { ScheduleEvent, InventoryItemLine } from "../interfaces/schedule-event.model";
import { useMockStore } from "@core/storage/mock-store.provider";
import { httpClient } from "@core/http/client.instance";
import { SchedulesApi } from "./schedules-api";
import type {
  ListSchedulesQuery,
  MonthViewHint,
  NextScheduleItem,
  ScheduleStatus,
} from "./schedules-api";

type CreateSchedulePayload = {
  start: string; // ISO
  end: string; // ISO
  scheduleId?: string | null;
  workspaceId?: string | null;
  resourceId?: string | null;
  clientId?: string | null;
  durationMinutes?: number | null;
  title?: string | null;
  description?: string | null;
  services?: Array<{ serviceId: string; quantity?: number; priceCents?: number }>;
  workers?: Array<{ workspaceId?: string | null; userUid: string }>;
  inventoryInputs?: InventoryItemLine[];
  inventoryOutputs?: InventoryItemLine[];
  // optional category code expected by backend (e.g. 'work')
  categoryCode?: string | null;
  // optional status id for updates
  statusId?: string | null;
};

const schedulesApi = new SchedulesApi(httpClient);

export async function getNextSchedulesForWorkspace(workspaceId?: string | null, limit = 3): Promise<NextScheduleItem[]> {
  const max = Math.min(Math.max(1, limit ?? 3), 3);

  // try backend when workspaceId provided
  if (workspaceId) {
    try {
      const rows = await schedulesApi.nextSchedules(workspaceId, max);
      return rows ?? [];
    } catch (err) {
      // schedulesApi.nextSchedules failed, falling back to local store
    }
  }

  // fallback: compute from local in-memory DB events
  try {
    const now = dayjs();
    const todayStr = now.format('YYYY-MM-DD');
    const upcoming = inMemoryDb.events
      .filter((e) => e.date === todayStr)
      .map((e) => ({ ...e }))
      .filter((e) => {
        const start = dayjs(`${e.date}T${(e.startTime ?? '00:00')}:00.000Z`);
        return start.isAfter(now) || start.isSame(now);
      })
      .sort((a, b) => {
        const ad = dayjs(`${a.date}T${(a.startTime ?? '00:00')}:00.000Z`);
        const bd = dayjs(`${b.date}T${(b.startTime ?? '00:00')}:00.000Z`);
        return ad.valueOf() - bd.valueOf();
      })
      .slice(0, max)
      .map((e) => {
        const start = dayjs(`${e.date}T${(e.startTime ?? '00:00')}:00.000Z`);
        const diffMinutes = Math.max(0, start.diff(dayjs(), 'minute'));
        const hours = Math.floor(diffMinutes / 60);
        const minutes = diffMinutes % 60;
        const startsIn = hours > 0 ? (minutes > 0 ? `starts in ${hours}h ${minutes}m` : `starts in ${hours}h`) : `starts in ${minutes} minutes`;
        return {
          id: e.id,
          scheduleId: undefined,
          workspaceId: undefined,
          resourceId: undefined,
          clientId: undefined,
          start: new Date(`${e.date}T${(e.startTime ?? '00:00')}:00.000Z`).toISOString(),
          end: new Date(`${e.date}T${(e.endTime ?? '00:00')}:00.000Z`).toISOString(),
          durationMinutes: undefined,
          title: e.title ?? 'Untitled',
          description: e.description ?? null,
          services: undefined,
          workers: undefined,
          category: undefined,
          status: undefined,
          createdAt: new Date().toISOString(),
          updatedAt: undefined,
          startsInMinutes: diffMinutes,
          startsIn,
        } as NextScheduleItem;
      });

    return upcoming;
  } catch (err) {
    // getNextSchedulesForWorkspace fallback failed
    return [] as NextScheduleItem[];
  }
}

type GetEventsParams = {
  from: string; // "YYYY-MM-DD"
  to: string; // "YYYY-MM-DD"
  categoryIds?: string[];
  workspaceId?: string | null;
};

export type GetEventsWithHintParams = GetEventsParams &
  Pick<
    ListSchedulesQuery,
    "calendarView" | "includeViewHint" | "monthCellVisibleLimit" | "monthViewTimeZone"
  >;

export type ScheduleEventsWithHintResult = {
  events: ScheduleEvent[];
  monthViewHint: MonthViewHint | null;
};

export const categoriesSeed: ScheduleCategory[] = [
  { id: "work", label: "Work", color: "var(--color-primary)" },
  { id: "personal", label: "Personal", color: "var(--color-secondary)" },
  { id: "schedule", label: "Schedule", color: "var(--color-tertiary)" },
  { id: "gaming", label: "Gaming", color: "rgba(233, 171, 19, 0.95)" },
];

// create a small dynamic seed relative to today so local metrics are visible
function fmtDate(d: Date) {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const now = new Date();
const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
const tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1);
const inThree = new Date(today);
inThree.setDate(today.getDate() + 3);
const inSeven = new Date(today);
inSeven.setDate(today.getDate() + 7);

const eventsSeed: ScheduleEvent[] = [
  {
    id: "e-1",
    title: "Initial Consultation",
    date: fmtDate(today),
    startTime: "09:00",
    endTime: "09:45",
    categoryId: "schedule",
    description: "New client consult",
  },
  {
    id: "e-2",
    title: "Cleaning",
    date: fmtDate(tomorrow),
    startTime: "11:00",
    endTime: "12:00",
    categoryId: "schedule",
    description: "Routine cleaning",
  },
  {
    id: "e-3",
    title: "Extraction",
    date: fmtDate(inThree),
    startTime: "14:00",
    endTime: "15:00",
    categoryId: "schedule",
  },
  {
    id: "e-4",
    title: "Follow up",
    date: fmtDate(inSeven),
    startTime: "10:00",
    endTime: "10:30",
    categoryId: "personal",
  },
];

const inMemoryDb = {
  categories: [...categoriesSeed],
  events: [...eventsSeed],
};

function readStringRecordValue(
  record: DataMap | null | undefined,
  keys: string[]
): string | undefined {
  if (!record) return undefined;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }
  }
  return undefined;
}

function extractCategoryRecord(source: DataMap): DataMap | null {
  const nestedRaw = source["category"];
  const nested =
    nestedRaw && typeof nestedRaw === "object" ? (nestedRaw as DataMap) : null;

  const id =
    readStringRecordValue(source, ["categoryId", "category_id"]) ??
    readStringRecordValue(nested, ["id"]);
  const code =
    readStringRecordValue(source, ["categoryCode", "category_code"]) ??
    readStringRecordValue(nested, ["code"]);
  const label =
    readStringRecordValue(source, ["categoryLabel", "category_label"]) ??
    readStringRecordValue(nested, ["label", "name"]);
  const color =
    readStringRecordValue(source, ["categoryColor", "category_color"]) ??
    readStringRecordValue(nested, ["color"]);

  if (!nested && !id && !code && !label && !color) return null;

  const merged: DataMap = { ...(nested ?? {}) };
  if (id) merged["id"] = id;
  if (code) merged["code"] = code;
  if (label) merged["label"] = label;
  if (color) merged["color"] = color;
  return merged;
}

function extractCategoryId(source: DataMap, category: DataMap | null): string | undefined {
  return (
    readStringRecordValue(source, [
      "categoryId",
      "category_id",
      "calendarId",
      "calendar_id",
    ]) ??
    readStringRecordValue(category, ["id", "code"])
  );
}

function extractCategoryCode(source: DataMap, category: DataMap | null): string | undefined {
  return (
    readStringRecordValue(source, ["categoryCode", "category_code"]) ??
    readStringRecordValue(category, ["code"])
  );
}

export class ScheduleService {
  async getCategories(): Promise<ScheduleCategory[]> {
    return inMemoryDb.categories;
  }

  async getEvents(params: GetEventsParams): Promise<ScheduleEvent[]> {
    const { from, to, categoryIds, workspaceId } = params;

    // if workspaceId provided try backend first
    if (workspaceId) {
      try {
        // use dedicated today endpoint when requesting a single date
        const useTodayEndpoint = from === to;
        const rows = useTodayEndpoint ? await schedulesApi.todaySchedules(workspaceId) : await schedulesApi.listSchedules(workspaceId, { from, to });

        const mapped = (rows ?? []).map((r) => r as DataMap).map((s) => {
          const startIso = String(s["start"] ?? s["starts_at"] ?? s["startAt"] ?? "");
          const endIso = String(s["end"] ?? s["ends_at"] ?? s["endAt"] ?? "");
          const category = extractCategoryRecord(s);
          const categoryId = extractCategoryId(s, category);
          const categoryCode = extractCategoryCode(s, category);

          const pad = (n: number) => n.toString().padStart(2, "0");
          let date = "";
          let startTime = "09:00";
          let endTime = "09:30";
          if (startIso) {
            const d = new Date(startIso);
            date = `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
            startTime = `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
          }
          if (endIso) {
            const e = new Date(endIso);
            endTime = `${pad(e.getUTCHours())}:${pad(e.getUTCMinutes())}`;
          }

          return {
            id: String(s["id"] ?? ""),
            title: (s["title"] as string) ?? "Untitled",
            date,
            startTime,
            endTime,
            categoryId,
            category,
            categoryCode,
            description: (s["description"] as string) ?? undefined,
            status: (s["status"] ?? null) as DataMap | null,
            workers: (s["workers"] ?? null) as Array<DataMap> | null,
            services: (s["services"] ?? null) as Array<DataMap> | null,
            inventoryInputs: (s["inventoryInputs"] ?? null) as Array<DataMap> | null,
            inventoryOutputs: (s["inventoryOutputs"] ?? null) as Array<DataMap> | null,
          } as ScheduleEvent;
        });

        const filtered = mapped.filter((e) => {
          if (!e.date) return false;
          const inRange = e.date >= from && e.date <= to;
          const allowedCategory = !categoryIds || categoryIds.length === 0 ? true : categoryIds.includes(e.categoryId ?? "");
          return inRange && allowedCategory;
        });

        return filtered as ScheduleEvent[];
      } catch (err) {
        // fallback to local in-memory DB
      }
    }

    // fallback to local mock events
    const fromKey = from;
    const toKey = to;

    return inMemoryDb.events.filter((e) => {
      const isInRange = e.date >= fromKey && e.date <= toKey;
      const isAllowedCategory =
        !categoryIds || categoryIds.length === 0
          ? true
          : categoryIds.includes(e.categoryId);

      return isInRange && isAllowedCategory;
    });
  }

  async createEvent(
    payload: Omit<ScheduleEvent, "id">
  ): Promise<ScheduleEvent> {
    const created: ScheduleEvent = {
      ...payload,
      id: `e-${Math.random().toString(16).slice(2)}`,
    };

    inMemoryDb.events.unshift(created);
    return created;
  }

  async removeEvent(id: string): Promise<boolean> {
    const idx = inMemoryDb.events.findIndex((e) => e.id === id);
    if (idx === -1) return false;
    inMemoryDb.events.splice(idx, 1);
    return true;
  }
}

// exported helper to fetch statuses from backend
export async function getStatuses(): Promise<ScheduleStatus[]> {
  try {
    const rows = await schedulesApi.getStatuses();
    return rows ?? [];
  } catch (err) {
    // schedulesApi.getStatuses failed
    return [];
  }
}

export async function getScheduleCategoriesForWorkspace(
  workspaceId?: string | null
): Promise<ScheduleCategory[]> {
  if (!workspaceId) return categoriesSeed.slice();
  try {
    const rows = await schedulesApi.listCategories(workspaceId);
    return rows ?? [];
  } catch (err) {
    // schedulesApi.listCategories failed
    return categoriesSeed.slice();
  }
}

// React hook-based API that integrates with MockStoreProvider
export function useScheduleApi() {
  const store = useMockStore();

  const getCategories = useCallback(async (workspaceId?: string | null): Promise<ScheduleCategory[]> => {
    return getScheduleCategoriesForWorkspace(workspaceId);
  }, []);

  const createCategory = useCallback(async (args: {
    workspaceId: string;
    label: string;
    color?: string | null;
  }): Promise<ScheduleCategory> => {
    return schedulesApi.createCategory({
      workspaceId: args.workspaceId,
      label: args.label,
      color: args.color ?? null,
    });
  }, []);

  const updateCategory = useCallback(async (args: {
    id: string;
    workspaceId: string;
    label?: string;
    color?: string | null;
  }): Promise<ScheduleCategory> => {
    return schedulesApi.updateCategory(args.id, {
      workspaceId: args.workspaceId,
      label: args.label,
      color: args.color,
    });
  }, []);

  const deleteCategory = useCallback(async (id: string, workspaceId: string): Promise<boolean> => {
    try {
      await schedulesApi.deleteCategory(id, workspaceId);
      return true;
    } catch (err) {
      // schedulesApi.deleteCategory failed
      return false;
    }
  }, []);

  const mapBackendEvents = useCallback(
    (rows: DataMap[], from: string, to: string): ScheduleEvent[] => {
      const mapped = rows.map((s) => {
        const startIso = String(s["start"] ?? s["starts_at"] ?? s["startAt"] ?? "");
        const endIso = String(s["end"] ?? s["ends_at"] ?? s["endAt"] ?? "");
        const category = extractCategoryRecord(s);
        const categoryId = extractCategoryId(s, category);
        const categoryCode = extractCategoryCode(s, category);

        const pad = (n: number) => n.toString().padStart(2, "0");
        let date = "";
        let startTime = "09:00";
        let endTime = "09:30";
        if (startIso) {
          const d = new Date(startIso);
          date = `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(
            d.getUTCDate()
          )}`;
          startTime = `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
        }
        if (endIso) {
          const e = new Date(endIso);
          endTime = `${pad(e.getUTCHours())}:${pad(e.getUTCMinutes())}`;
        }

        return {
          id: String(s["id"] ?? ""),
          title: (s["title"] as string) ?? "Untitled",
          date,
          startTime,
          endTime,
          categoryId,
          category,
          categoryCode,
          description: (s["description"] as string) ?? undefined,
          status: (s["status"] ?? null) as DataMap | null,
          workers: (s["workers"] ?? null) as Array<
            DataMap
          > | null,
          services: (s["services"] ?? null) as Array<
            DataMap
          > | null,
          inventoryInputs: (s["inventoryInputs"] ?? null) as Array<
            DataMap
          > | null,
          inventoryOutputs: (s["inventoryOutputs"] ?? null) as Array<
            DataMap
          > | null,
        } as ScheduleEvent;
      });

      // Preserve category when backend omits category id on some responses.
      try {
        for (let i = 0; i < mapped.length; i++) {
          const event = mapped[i];
          if (event.categoryId) continue;

          const found = store.events.find((se) => se.id === event.id) as
            | ScheduleEvent
            | undefined
            | null;
          if (!found || !found.categoryId) continue;

          mapped[i] = {
            ...event,
            categoryId: found.categoryId,
            category: found.category ?? null,
            categoryCode: found.categoryCode ?? found.category?.code ?? undefined,
          };
        }
      } catch (err) {
        // preserve categoryId fallback failed
      }

      return mapped.filter((e) => e.date && e.date >= from && e.date <= to);
    },
    [store.events]
  );

  const getEventsWithHint = useCallback(
    async (params: GetEventsWithHintParams): Promise<ScheduleEventsWithHintResult> => {
      const {
        from,
        to,
        workspaceId,
        calendarView = "month",
        includeViewHint = calendarView === "month",
        monthCellVisibleLimit,
        monthViewTimeZone,
      } = params;

      if (workspaceId) {
        try {
          const useTodayEndpoint = from === to;
          let rows: DataMap[] = [];
          let monthViewHint: MonthViewHint | null = null;

          if (useTodayEndpoint) {
            rows = (await schedulesApi.todaySchedules(workspaceId)) as Array<
              DataMap
            >;
          } else {
            const res = await schedulesApi.listSchedulesWithMeta(workspaceId, {
              from,
              to,
              calendarView,
              includeViewHint,
              monthCellVisibleLimit,
              monthViewTimeZone,
            });
            rows = (res.data ?? []) as Array<DataMap>;
            monthViewHint = res.meta?.monthViewHint ?? null;
          }

          const events = mapBackendEvents(rows, from, to);
          return { events, monthViewHint };
        } catch (err) {
          // fallback to local store if backend fails
        }
      }

      const fallbackEvents = store.events
        .filter((e) => e.date >= from && e.date <= to)
        .map((e) => ({
          id: e.id,
          title: e.title ?? "Untitled",
          date: e.date,
          startTime: e.startTime ?? "09:00",
          endTime: e.endTime ?? "09:30",
          categoryId: e.categoryId ?? "schedule",
          description: e.description,
        }));

      return { events: fallbackEvents, monthViewHint: null };
    },
    [mapBackendEvents, store.events]
  );

  const getEvents = useCallback(
    async (params: GetEventsParams): Promise<ScheduleEvent[]> => {
      const result = await getEventsWithHint(params);
      return result.events;
    },
    [getEventsWithHint]
  );

  const createEvent = useCallback(async (payload: Omit<ScheduleEvent, "id">): Promise<ScheduleEvent> => {
    try {
      // try to create on backend using known fields
      // build minimal payload
      const startIso = new Date(`${payload.date}T${payload.startTime}:00.000Z`).toISOString();
      const endIso = new Date(`${payload.date}T${payload.endTime}:00.000Z`).toISOString();

      const body: CreateSchedulePayload = {
        start: startIso,
        end: endIso,
        title: payload.title ?? null,
        description: payload.description ?? null,
        durationMinutes: null,
      };

      const res = await schedulesApi.createSchedule(body);
      const resp = res as { id?: string };
      const id = resp.id || `e-${Math.random().toString(16).slice(2)}`;

      // map response (best-effort) into ScheduleEvent shape
      const created: ScheduleEvent = {
        id,
        title: payload.title ?? "Untitled",
        date: payload.date,
        startTime: payload.startTime ?? "09:00",
        endTime: payload.endTime ?? "09:30",
        categoryId: payload.categoryId ?? "schedule",
        description: payload.description,
      };

      // also add to local store for offline UI consistency (map to MockEvent)
      store.addEvent({
        id: created.id,
        title: created.title,
        date: created.date,
        startTime: created.startTime,
        endTime: created.endTime,
        categoryId: created.categoryId,
        description: created.description,
      });

      return created;
      } catch (err) {
        // fallback to local store on error
        const next = store.addEvent({ ...payload, id: `e-${Math.random().toString(16).slice(2)}` });
        return {
          id: next.id,
          title: next.title,
          date: next.date,
          startTime: next.startTime ?? "09:00",
          endTime: next.endTime ?? "09:30",
          categoryId: next.categoryId ?? "schedule",
          description: next.description,
        };
      }
  }, [store]);

  const removeEvent = useCallback(async (id: string): Promise<boolean> => {
    try {
      // attempt backend deletion; if it fails we'll still remove locally as fallback
      try {
        await schedulesApi.deleteSchedule(id);
      } catch (err) {
        // schedulesApi.deleteSchedule failed, falling back to local store
      }

      store.removeEvent(id);
      return true;
    } catch (err) {
      // removeEvent failed
      return false;
    }
  }, [store]);

  const createSchedule = useCallback(async (args: {
    event: Omit<ScheduleEvent, "id">;
    serviceIds?: string[];
    employeeIds?: string[];
    totalPriceCents?: number;
    workspaceId?: string | null;
    inventoryInputs?: InventoryItemLine[];
    inventoryOutputs?: InventoryItemLine[];
  }): Promise<ScheduleEvent> => {
    const { event, serviceIds, employeeIds, totalPriceCents, workspaceId, inventoryInputs, inventoryOutputs } = args;

    try {
      const startIso = new Date(`${event.date}T${event.startTime}:00.000Z`).toISOString();
      const endIso = new Date(`${event.date}T${event.endTime}:00.000Z`).toISOString();

      const body: CreateSchedulePayload = {
        start: startIso,
        end: endIso,
        title: event.title ?? null,
        description: event.description ?? null,
        workspaceId: workspaceId ?? null,
        durationMinutes: (event.durationMinutes as number) ?? null,
        services: serviceIds?.map((sid) => ({ serviceId: sid, priceCents: undefined })) ?? undefined,
        workers: employeeIds?.map((eid) => ({ workspaceId: workspaceId ?? null, userUid: eid })) ?? undefined,
        inventoryInputs: inventoryInputs ?? undefined,
        inventoryOutputs: inventoryOutputs ?? undefined,
        statusId: event.statusId ?? null,
      };

      // attach categoryCode when available (prefer explicit code on event, otherwise fallback to categoryId)
      // backend expects a category code (eg. 'work') under `categoryCode`
      body.categoryCode = event.categoryCode ?? event.categoryId ?? null;

      if (typeof totalPriceCents === "number") {
        // attach price on first service element if present
        if (body.services && body.services.length > 0) {
          body.services[0].priceCents = totalPriceCents;
        }
      }

      const res = await schedulesApi.createSchedule(body);
      const resp = res as { id?: string };
      const id = resp.id || `e-${Math.random().toString(16).slice(2)}`;

      const created: ScheduleEvent = {
        id,
        title: event.title ?? "Untitled",
        date: event.date,
        startTime: event.startTime ?? "09:00",
        endTime: event.endTime ?? "09:30",
        categoryId: event.categoryId ?? "schedule",
        description: event.description,
      };

      store.addEvent({
        id: created.id,
        title: created.title,
        date: created.date,
        startTime: created.startTime,
        endTime: created.endTime,
        categoryId: created.categoryId,
        description: created.description,
      });
      return created;
    } catch (err) {
      // fallback local
      const next = store.addEvent({ ...event, id: `e-${Math.random().toString(16).slice(2)}` });
      return {
        id: next.id,
        title: next.title,
        date: next.date,
        startTime: next.startTime ?? "09:00",
        endTime: next.endTime ?? "09:30",
        categoryId: next.categoryId ?? "schedule",
        description: next.description,
      };
    }
  }, [store]);

  const updateEvent = useCallback(async (args: {
    id: string;
    event: Omit<ScheduleEvent, "id">;
    serviceIds?: string[];
    employeeIds?: string[];
    totalPriceCents?: number;
    workspaceId?: string | null;
    inventoryInputs?: InventoryItemLine[];
    inventoryOutputs?: InventoryItemLine[];
  }): Promise<ScheduleEvent> => {
    const { id, event, serviceIds, employeeIds, totalPriceCents, workspaceId, inventoryInputs, inventoryOutputs } = args;

    try {
      const startIso = new Date(`${event.date}T${event.startTime}:00.000Z`).toISOString();
      const endIso = new Date(`${event.date}T${event.endTime}:00.000Z`).toISOString();

      const body: Partial<CreateSchedulePayload> = {
        start: startIso,
        end: endIso,
        title: event.title ?? null,
        description: event.description ?? null,
        workspaceId: workspaceId ?? null,
        durationMinutes: (event.durationMinutes as number) ?? null,
        services: serviceIds?.map((sid) => ({ serviceId: sid, priceCents: undefined })) ?? undefined,
        workers: employeeIds?.map((eid) => ({ workspaceId: workspaceId ?? null, userUid: eid })) ?? undefined,
        inventoryInputs: inventoryInputs ?? undefined,
        inventoryOutputs: inventoryOutputs ?? undefined,
      };

      // include status when provided by UI (event may include statusId or status object)
      try {
        const evt = event as DataMap;
        let evtStatusId: string | null = null;
        const sId = evt['statusId'];
        if (typeof sId === 'string' && sId) evtStatusId = sId;
        else {
          const st = evt['status'];
          if (st && typeof st === 'object') {
            const stId = (st as DataMap)['id'];
            if (typeof stId === 'string' && stId) evtStatusId = stId;
          }
        }
        if (evtStatusId) (body as DataMap)['statusId'] = evtStatusId;
      } catch (err) {
        // no-op
      }

      // For updates send categoryId (backend expects categoryCode only on create).
      try {
        const evtRec = event as DataMap;
        (body as DataMap)['categoryId'] = (evtRec['categoryId'] as string | undefined) ?? null;
      } catch (err) {
        // no-op
      }

      if (typeof totalPriceCents === "number") {
        if (body.services && body.services.length > 0) {
          body.services[0].priceCents = totalPriceCents;
        }
      }

      const res = await schedulesApi.updateSchedule(id, body);
      const resp = (res as DataMap) ?? {};
      const maybeId = resp.id;
      const newId = typeof maybeId === "string" && maybeId ? maybeId : id;

      const updated: ScheduleEvent = {
        id: newId,
        title: event.title ?? "Untitled",
        date: event.date,
        startTime: event.startTime ?? "09:00",
        endTime: event.endTime ?? "09:30",
        categoryId: event.categoryId ?? "schedule",
        description: event.description,
      };

      // update local store for offline UI consistency
      try {
        store.removeEvent(newId);
      } catch (err) {
        // store.removeEvent failed during updateEvent cleanup
      }
      store.addEvent({
        id: updated.id,
        title: updated.title,
        date: updated.date,
        startTime: updated.startTime,
        endTime: updated.endTime,
        categoryId: updated.categoryId,
        description: updated.description,
      });

      return updated;
    } catch (err) {
      // fallback: update local store
      try {
        store.removeEvent(id);
      } catch (e) {
        // store.removeEvent failed in fallback
      }
      const next = store.addEvent({ ...event, id });
      return {
        id: next.id,
        title: next.title,
        date: next.date,
        startTime: next.startTime ?? "09:00",
        endTime: next.endTime ?? "09:30",
        categoryId: next.categoryId ?? "schedule",
        description: next.description,
      };
    }
  }, [store]);

  return useMemo(
    () => ({
      getCategories,
      getEvents,
      getEventsWithHint,
      createEvent,
      createSchedule,
      removeEvent,
      updateEvent,
      getNextSchedules: getNextSchedulesForWorkspace,
      getStatuses,
      createCategory,
      updateCategory,
      deleteCategory,
    }),
    [
      getCategories,
      getEvents,
      getEventsWithHint,
      createEvent,
      createSchedule,
      removeEvent,
      updateEvent,
      createCategory,
      updateCategory,
      deleteCategory,
    ]
  );
}
