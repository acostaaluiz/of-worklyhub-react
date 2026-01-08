import { useCallback, useMemo } from "react";
import type { ScheduleCategory } from "../interfaces/schedule-category.model";
import type { ScheduleEvent } from "../interfaces/schedule-event.model";
import { useMockStore } from "@core/storage/mock-store.provider";

type GetEventsParams = {
  from: string; // "YYYY-MM-DD"
  to: string; // "YYYY-MM-DD"
  categoryIds?: string[];
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
    const { from, to } = params;
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
  }, [store]);

  const removeEvent = useCallback(async (id: string): Promise<boolean> => {
    store.removeEvent(id);
    return true;
  }, [store]);

  return useMemo(() => ({ getCategories, getEvents, createEvent, removeEvent }), [getCategories, getEvents, createEvent, removeEvent]);
}
