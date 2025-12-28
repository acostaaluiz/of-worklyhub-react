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

const eventsSeed: ScheduleEvent[] = [
  {
    id: "e-1",
    title: "Daily Standup",
    date: "2028-03-01",
    startTime: "09:00",
    endTime: "09:30",
    categoryId: "work",
    description: "Team sync.",
  },
  {
    id: "e-2",
    title: "Client Meeting",
    date: "2028-03-02",
    startTime: "15:00",
    endTime: "16:00",
    categoryId: "work",
  },
  {
    id: "e-3",
    title: "Lunch Break",
    date: "2028-03-14",
    startTime: "12:00",
    endTime: "13:00",
    categoryId: "personal",
  },
  {
    id: "e-4",
    title: "Gaming with friends",
    date: "2028-03-30",
    startTime: "20:00",
    endTime: "22:00",
    categoryId: "gaming",
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
