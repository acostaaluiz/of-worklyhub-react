import { useCallback, useMemo } from "react";
import dayjs from "dayjs";
import type { ScheduleCategory } from "../interfaces/schedule-category.model";
import type { ScheduleEvent } from "../interfaces/schedule-event.model";
import { useMockStore } from "@core/storage/mock-store.provider";
import { httpClient } from "@core/http/client.instance";
import type { HttpClient } from "@core/http/interfaces/http-client.interface";
import { SchedulesApi } from "./schedules-api";

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
};

const schedulesApi = new SchedulesApi(httpClient as unknown as HttpClient);

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
        console.log("useScheduleApi.getEvents: fetched rows", (rows ?? []).length, rows);
        // rows expected to be Schedule[] with ISO start/end
        const mapped = (rows ?? []).map((r) => r as Record<string, unknown>).map((s) => {
          const startIso = String(s["start"] ?? s["starts_at"] ?? s["startAt"] ?? "");
          const endIso = String(s["end"] ?? s["ends_at"] ?? s["endAt"] ?? "");

          const sd = startIso ? dayjs(startIso) : null;
          const ed = endIso ? dayjs(endIso) : null;

          const date = sd ? sd.format("YYYY-MM-DD") : "";
          const startTime = sd ? sd.format("HH:mm") : "09:00";
          const endTime = ed ? ed.format("HH:mm") : "09:30";

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
              "schedule",
              // preserve the backend category object when available (contains code/label)
              category: (s["category"] as Record<string, unknown> | null) ?? null,
              categoryCode: ((s["category"] as Record<string, unknown> | undefined)?.["code"] as string | undefined) ?? undefined,
            description: (s["description"] as string) ?? undefined,
            // preserve status object from backend so UI can color by status.code
              status: ((s["status"] ?? null) as unknown) as Record<string, unknown> | null,
              // preserve workers and services from backend for UI details
              workers: ((s["workers"] ?? null) as unknown) as Array<Record<string, unknown>> | null,
              services: ((s["services"] ?? null) as unknown) as Array<Record<string, unknown>> | null,
            _sd: sd,
          } as ScheduleEvent & { _sd?: dayjs.Dayjs | null };
        });

        const fromStart = dayjs(from).startOf("day").valueOf();
        const toEnd = dayjs(to).endOf("day").valueOf();

        const filtered = mapped.filter((e) => {
          const sd = ((e as unknown) as { _sd?: dayjs.Dayjs | null })._sd as dayjs.Dayjs | null | undefined;
          if (!sd) return false;
          const t = sd.startOf("day").valueOf();
          return t >= fromStart && t <= toEnd;
        });

        const result = filtered.map((e) => {
          const { _sd, ...rest } = e as unknown as Record<string, unknown>;
          return rest as ScheduleEvent;
        });

        console.log("useScheduleApi.getEvents: mapped -> filtered -> result", mapped.length, filtered.length, result.length, result.map((r) => ({ id: r.id, date: r.date, startTime: r.startTime })));
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
        console.debug('schedulesApi.deleteSchedule failed, falling back to local store', err);
      }

      store.removeEvent(id);
      return true;
    } catch (err) {
      console.error('removeEvent failed', err);
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

  return useMemo(() => ({ getCategories, getEvents, createEvent, createSchedule, removeEvent }), [getCategories, getEvents, createEvent, createSchedule, removeEvent]);
}
