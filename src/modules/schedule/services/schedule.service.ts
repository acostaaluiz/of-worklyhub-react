import { useCallback, useMemo } from "react";
import dayjs from "dayjs";
import type { ScheduleCategory } from "../interfaces/schedule-category.model";
import type { ScheduleEvent } from "../interfaces/schedule-event.model";
import { useMockStore } from "@core/storage/mock-store.provider";
import { httpClient } from "@core/http/client.instance";
import type { HttpClient } from "@core/http/interfaces/http-client.interface";
import { SchedulesApi } from "./schedules-api";
import type { NextScheduleItem } from "./schedules-api";

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
  // optional category code expected by backend (e.g. 'work')
  categoryCode?: string | null;
  // optional status id for updates
  statusId?: string | null;
};

const schedulesApi = new SchedulesApi(httpClient as unknown as HttpClient);

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

export class ScheduleService {
  async getCategories(): Promise<ScheduleCategory[]> {
    return inMemoryDb.categories;
  }

  async getEvents(params: GetEventsParams): Promise<ScheduleEvent[]> {
    const { from, to, categoryIds } = params;

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
export async function getStatuses(): Promise<import("./schedules-api").ScheduleStatus[]> {
  try {
    const rows = await schedulesApi.getStatuses();
    return rows ?? [];
  } catch (err) {
    // schedulesApi.getStatuses failed
    return [];
  }
}

// React hook-based API that integrates with MockStoreProvider
export function useScheduleApi() {
  const store = useMockStore();

  const getCategories = useCallback(async (): Promise<ScheduleCategory[]> => {
    return categoriesSeed.slice();
  }, []);

  const getEvents = useCallback(async (params: GetEventsParams): Promise<ScheduleEvent[]> => {
    const { from, to, workspaceId } = params;

    // if workspaceId is provided, attempt to load from backend schedules API
      if (workspaceId) {
      try {
        const rows = await schedulesApi.listSchedules(workspaceId, { from, to });
        // rows expected to be Schedule[] with ISO start/end
        const mapped = (rows ?? []).map((r) => r as Record<string, unknown>).map((s) => {
          const startIso = String(s["start"] ?? s["starts_at"] ?? s["startAt"] ?? "");
          const endIso = String(s["end"] ?? s["ends_at"] ?? s["endAt"] ?? "");

          // derive date and times using UTC components to reflect backend day boundaries
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
            // prefer categoryId from API if provided; backend may return a `category` object
              categoryId:
                (s["categoryId"] as string) ??
                ((s["category"] as Record<string, unknown> | undefined)?.["id"] as string | undefined) ??
                (s["calendarId"] as string) ??
                undefined,
            // preserve the backend category object when available (contains code/label)
            category: (s["category"] as Record<string, unknown> | null) ?? null,
            categoryCode: ((s["category"] as Record<string, unknown> | undefined)?.["code"] as string | undefined) ?? undefined,
            description: (s["description"] as string) ?? undefined,
            // preserve status object from backend so UI can color by status.code
            status: ((s["status"] ?? null) as unknown) as Record<string, unknown> | null,
            // preserve workers and services from backend for UI details
            workers: ((s["workers"] ?? null) as unknown) as Array<Record<string, unknown>> | null,
            services: ((s["services"] ?? null) as unknown) as Array<Record<string, unknown>> | null,
          } as ScheduleEvent;
        });

        // try to preserve categoryId for events where backend did not return it
        try {
          for (let i = 0; i < mapped.length; i++) {
            const m = mapped[i];
            if (!m.categoryId) {
              const found = store.events.find((se) => se.id === m.id) as ScheduleEvent | undefined | null;
              if (found && found.categoryId) {
                mapped[i] = {
                  ...m,
                  categoryId: found.categoryId,
                  category: found.category ?? null,
                  categoryCode: found.categoryCode ?? found.category?.code ?? undefined,
                } as ScheduleEvent;
              }
            }
          }
        } catch (err) {
          // preserve categoryId fallback failed
        }

        // filter by date string (YYYY-MM-DD) to match backend day boundaries
        const filtered = mapped.filter((e) => {
          if (!e.date) return false;
          return e.date >= from && e.date <= to;
        });

        const result = filtered.map((e) => e as ScheduleEvent);
        return result;
      } catch (err) {
        // fallback to local store if backend fails
      }
    }

    // fallback: use local mock store
    return store.events
      .filter((e) => {
        const isInRange = e.date >= from && e.date <= to;
        return isInRange;
      })
      .map((e) => ({
        id: e.id,
        title: e.title ?? "Untitled",
        date: e.date,
        startTime: e.startTime ?? "09:00",
        endTime: e.endTime ?? "09:30",
        categoryId: e.categoryId ?? "schedule",
        description: e.description,
      }));
  }, [store]);

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
  }): Promise<ScheduleEvent> => {
    const { event, serviceIds, employeeIds, totalPriceCents, workspaceId } = args;

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
      };

      // attach categoryCode when available (prefer explicit code on event, otherwise fallback to categoryId)
      // backend expects a category code (eg. 'work') under `categoryCode`
      body.categoryCode = event.categoryCode ?? event.categoryId ?? null;

      if (typeof totalPriceCents === "number") {
        // attach price on first service element if any
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
  }): Promise<ScheduleEvent> => {
    const { id, event, serviceIds, employeeIds, totalPriceCents, workspaceId } = args;

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
      };

      // include status when provided by UI (event may include statusId or status object)
      try {
        const evt = event as unknown as Record<string, unknown>;
        let evtStatusId: string | null = null;
        const sId = evt['statusId'];
        if (typeof sId === 'string' && sId) evtStatusId = sId;
        else {
          const st = evt['status'];
          if (st && typeof st === 'object') {
            const stId = (st as Record<string, unknown>)['id'];
            if (typeof stId === 'string' && stId) evtStatusId = stId;
          }
        }
        if (evtStatusId) (body as Record<string, unknown>)['statusId'] = evtStatusId;
      } catch (err) {
        // no-op
      }

      // For updates send categoryId (backend expects categoryCode only on create).
      try {
        const evtRec = event as unknown as Record<string, unknown>;
        (body as Record<string, unknown>)['categoryId'] = (evtRec['categoryId'] as string | undefined) ?? null;
      } catch (err) {
        // no-op
      }

      if (typeof totalPriceCents === "number") {
        if (body.services && body.services.length > 0) {
          body.services[0].priceCents = totalPriceCents;
        }
      }

      const res = await schedulesApi.updateSchedule(id, body);
      const resp = (res as unknown as Record<string, unknown>) ?? {};
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

  return useMemo(() => ({ getCategories, getEvents, createEvent, createSchedule, removeEvent, updateEvent, getNextSchedules: getNextSchedulesForWorkspace, getStatuses }), [getCategories, getEvents, createEvent, createSchedule, removeEvent, updateEvent]);
}
