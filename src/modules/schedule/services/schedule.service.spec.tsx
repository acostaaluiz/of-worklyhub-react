/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { render, waitFor } from "@testing-library/react";
import { useMockStore } from "@core/storage/mock-store.provider";
import { SchedulesApi } from "./schedules-api";
import {
  ScheduleService,
  categoriesSeed,
  getNextSchedulesForWorkspace,
  getStatuses,
  useScheduleApi,
} from "./schedule.service";

jest.mock("@core/storage/mock-store.provider", () => ({
  useMockStore: jest.fn(),
}));

type StoreMock = {
  events: Array<DataMap>;
  services: Array<DataMap>;
  finance: Array<DataMap>;
  seed: jest.Mock;
  addEvent: jest.Mock;
  removeEvent: jest.Mock;
  addService: jest.Mock;
  removeService: jest.Mock;
  addFinanceEntry: jest.Mock;
  removeFinanceEntry: jest.Mock;
};

function createStoreMock(events: Array<DataMap> = []): StoreMock {
  const store: StoreMock = {
    events: [...events],
    services: [],
    finance: [],
    seed: jest.fn(),
    addEvent: jest.fn(),
    removeEvent: jest.fn(),
    addService: jest.fn(),
    removeService: jest.fn(),
    addFinanceEntry: jest.fn(),
    removeFinanceEntry: jest.fn(),
  };

  store.addEvent.mockImplementation((event: DataMap) => {
    const id = typeof event.id === "string" && event.id ? event.id : `ev-${store.events.length + 1}`;
    const next = { ...event, id };
    store.events = [next, ...store.events];
    return next;
  });

  store.removeEvent.mockImplementation((id: string) => {
    store.events = store.events.filter((row) => row.id !== id);
  });

  return store;
}

function hookHarness(onReady: (api: ReturnType<typeof useScheduleApi>) => void) {
  function Harness() {
    const api = useScheduleApi();

    React.useEffect(() => {
      onReady(api);
    }, [api]);

    return null;
  }

  return Harness;
}

describe("schedule.service", () => {
  const mockedUseMockStore = jest.mocked(useMockStore);

  let store: StoreMock;
  let nextSchedulesSpy: jest.SpyInstance;
  let todaySchedulesSpy: jest.SpyInstance;
  let listSchedulesSpy: jest.SpyInstance;
  let listSchedulesWithMetaSpy: jest.SpyInstance;
  let getStatusesSpy: jest.SpyInstance;
  let createScheduleSpy: jest.SpyInstance;
  let updateScheduleSpy: jest.SpyInstance;
  let deleteScheduleSpy: jest.SpyInstance;

  async function mountHookApi() {
    let capturedApi: ReturnType<typeof useScheduleApi> | null = null;
    const Harness = hookHarness((api) => {
      capturedApi = api;
    });

    render(<Harness />);
    await waitFor(() => expect(capturedApi).not.toBeNull());

    return capturedApi as ReturnType<typeof useScheduleApi>;
  }

  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();

    store = createStoreMock();
    mockedUseMockStore.mockReturnValue(store as any);

    nextSchedulesSpy = jest.spyOn(SchedulesApi.prototype, "nextSchedules").mockResolvedValue([]);
    todaySchedulesSpy = jest.spyOn(SchedulesApi.prototype, "todaySchedules").mockResolvedValue([]);
    listSchedulesSpy = jest.spyOn(SchedulesApi.prototype, "listSchedules").mockResolvedValue([]);
    listSchedulesWithMetaSpy = jest
      .spyOn(SchedulesApi.prototype, "listSchedulesWithMeta")
      .mockResolvedValue({ data: [], meta: {} });
    getStatusesSpy = jest.spyOn(SchedulesApi.prototype, "getStatuses").mockResolvedValue([]);
    createScheduleSpy = jest.spyOn(SchedulesApi.prototype, "createSchedule").mockResolvedValue({ id: "api-created" });
    updateScheduleSpy = jest.spyOn(SchedulesApi.prototype, "updateSchedule").mockResolvedValue({ id: "api-updated" });
    deleteScheduleSpy = jest.spyOn(SchedulesApi.prototype, "deleteSchedule").mockResolvedValue(undefined);
  });

  it("returns seeded categories and supports in-memory create/remove", async () => {
    const service = new ScheduleService();

    await expect(service.getCategories()).resolves.toEqual(categoriesSeed);

    const created = await service.createEvent({
      title: "Repair",
      date: "2099-01-10",
      startTime: "10:00",
      endTime: "11:00",
      categoryId: "work",
      description: "On-site repair",
    } as any);

    expect(created.id).toBeTruthy();
    await expect(service.removeEvent(created.id)).resolves.toBe(true);
    await expect(service.removeEvent("missing-id")).resolves.toBe(false);
  });

  it("maps backend rows in getEvents using today endpoint", async () => {
    todaySchedulesSpy.mockResolvedValueOnce([
      {
        id: "ev-1",
        title: "Consultation",
        start: "2025-01-10T09:00:00.000Z",
        end: "2025-01-10T09:45:00.000Z",
        category: { id: "work", code: "work" },
      },
    ]);

    const service = new ScheduleService();
    const rows = await service.getEvents({
      from: "2025-01-10",
      to: "2025-01-10",
      workspaceId: "ws-1",
      categoryIds: ["work"],
    });

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      id: "ev-1",
      date: "2025-01-10",
      startTime: "09:00",
      endTime: "09:45",
      categoryId: "work",
    });
  });

  it("uses listSchedules for ranged requests and applies category filter", async () => {
    listSchedulesSpy.mockResolvedValueOnce([
      {
        id: "ev-work",
        title: "Work Task",
        start: "2025-01-11T08:00:00.000Z",
        end: "2025-01-11T08:30:00.000Z",
        categoryId: "work",
      },
      {
        id: "ev-personal",
        title: "Personal Task",
        start: "2025-01-11T09:00:00.000Z",
        end: "2025-01-11T09:30:00.000Z",
        categoryId: "personal",
      },
    ]);

    const service = new ScheduleService();
    const rows = await service.getEvents({
      from: "2025-01-10",
      to: "2025-01-11",
      workspaceId: "ws-1",
      categoryIds: ["work"],
    });

    expect(rows).toHaveLength(1);
    expect(rows[0].id).toBe("ev-work");
  });

  it("falls back to in-memory events when backend getEvents fails", async () => {
    listSchedulesSpy.mockRejectedValueOnce(new Error("backend-failure"));
    const service = new ScheduleService();

    const fallbackRows = await service.getEvents({
      from: "2000-01-01",
      to: "2099-12-31",
      workspaceId: "ws-1",
    });

    expect(Array.isArray(fallbackRows)).toBe(true);
    expect(fallbackRows.length).toBeGreaterThan(0);
  });

  it("maps alternative backend field names and ignores rows without valid date", async () => {
    listSchedulesSpy.mockResolvedValueOnce([
      {
        id: "ev-alt",
        starts_at: "2025-01-12T07:00:00.000Z",
        endAt: "2025-01-12T08:00:00.000Z",
        calendarId: "calendar-1",
      },
      {
        id: "ev-invalid",
        title: "Missing start",
        end: "2025-01-12T09:00:00.000Z",
      },
    ]);

    const service = new ScheduleService();
    const rows = await service.getEvents({
      from: "2025-01-12",
      to: "2025-01-13",
      workspaceId: "ws-1",
      categoryIds: [],
    });

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      id: "ev-alt",
      title: "Untitled",
      categoryId: "calendar-1",
      startTime: "07:00",
      endTime: "08:00",
    });
  });

  it("filters in-memory events by category when workspace is not provided", async () => {
    const service = new ScheduleService();
    const rows = await service.getEvents({
      from: "2000-01-01",
      to: "2099-12-31",
      categoryIds: ["personal"],
    });

    expect(rows.every((row) => row.categoryId === "personal")).toBe(true);
  });

  it("returns statuses from backend and [] when backend fails", async () => {
    getStatusesSpy.mockResolvedValueOnce([{ id: "s-1", code: "open", label: "Open" }]);

    await expect(getStatuses()).resolves.toEqual([{ id: "s-1", code: "open", label: "Open" }]);

    getStatusesSpy.mockRejectedValueOnce(new Error("statuses-failure"));
    await expect(getStatuses()).resolves.toEqual([]);

    getStatusesSpy.mockResolvedValueOnce(null);
    await expect(getStatuses()).resolves.toEqual([]);
  });

  it("returns backend next schedules and clamps limit", async () => {
    const backendRows = [
      {
        id: "n-1",
        start: "2025-01-10T09:00:00.000Z",
        end: "2025-01-10T10:00:00.000Z",
        startsInMinutes: 30,
        startsIn: "starts in 30 minutes",
      },
    ];
    nextSchedulesSpy.mockResolvedValueOnce(backendRows);

    const result = await getNextSchedulesForWorkspace("ws-1", 99);

    expect(nextSchedulesSpy).toHaveBeenCalledWith("ws-1", 3);
    expect(result).toEqual(backendRows);
  });

  it("returns [] when nextSchedules API resolves to null and uses default limit", async () => {
    nextSchedulesSpy.mockResolvedValueOnce(null);

    const result = await getNextSchedulesForWorkspace("ws-1");

    expect(nextSchedulesSpy).toHaveBeenCalledWith("ws-1", 3);
    expect(result).toEqual([]);
  });

  it("falls back to in-memory next schedules when backend fails", async () => {
    nextSchedulesSpy.mockRejectedValueOnce(new Error("next-failure"));

    const now = new Date();
    now.setHours(8, 0, 0, 0);
    jest.useFakeTimers().setSystemTime(now);

    const service = new ScheduleService();
    await service.createEvent({
      title: "Future Event",
      date: now.toISOString().split("T")[0],
      startTime: "23:59",
      endTime: "23:59",
      categoryId: "work",
    } as any);

    const rows = await getNextSchedulesForWorkspace("ws-1", 2);
    expect(Array.isArray(rows)).toBe(true);
    expect(rows.length).toBeGreaterThan(0);

    jest.useRealTimers();
  });

  it("handles missing start/end times while building in-memory next schedules", async () => {
    nextSchedulesSpy.mockRejectedValueOnce(new Error("next-failure"));

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    jest.useFakeTimers().setSystemTime(now);

    const service = new ScheduleService();
    await service.createEvent({
      title: "No time event",
      date: now.toISOString().split("T")[0],
      categoryId: "work",
    } as any);

    const rows = await getNextSchedulesForWorkspace(undefined, 1);
    expect(Array.isArray(rows)).toBe(true);
    expect(rows.length).toBeGreaterThan(0);

    jest.useRealTimers();
  });

  it("exposes hook methods and category fallback in mapBackendEvents", async () => {
    store.events = [
      {
        id: "ev-store",
        categoryId: "work",
        category: { id: "work", code: "work" },
        title: "Stored event",
        date: "2025-01-20",
        startTime: "09:00",
        endTime: "10:00",
      },
    ];

    todaySchedulesSpy.mockResolvedValueOnce([
      {
        id: "ev-store",
        title: "Backend event without category",
        start: "2025-01-20T09:00:00.000Z",
        end: "2025-01-20T10:00:00.000Z",
      },
    ]);

    const api = await mountHookApi();

    await expect(api.getCategories()).resolves.toEqual(categoriesSeed);

    const result = await api.getEventsWithHint({
      from: "2025-01-20",
      to: "2025-01-20",
      workspaceId: "ws-1",
    } as any);

    expect(result.events).toHaveLength(1);
    expect(result.events[0].categoryId).toBe("work");
  });

  it("returns month view hint from listSchedulesWithMeta", async () => {
    const monthViewHint = {
      shouldSuggestDayWeekView: true,
      totalHiddenEvents: 2,
      overloadedDays: 1,
      visiblePerDay: 3,
      suggestedViews: ["week"],
      title: "Dense month",
      message: "Try week view",
      dayOverflows: [],
    };
    listSchedulesWithMetaSpy.mockResolvedValueOnce({
      data: [
        {
          id: "ev-2",
          title: "Long Event",
          start: "2025-02-12T08:00:00.000Z",
          end: "2025-02-12T09:00:00.000Z",
          categoryId: "schedule",
        },
      ],
      meta: { monthViewHint },
    });

    const api = await mountHookApi();
    const result = await api.getEventsWithHint({
      from: "2025-02-01",
      to: "2025-02-28",
      workspaceId: "ws-1",
      calendarView: "month",
      includeViewHint: true,
      monthCellVisibleLimit: 4,
      monthViewTimeZone: "UTC",
    });

    expect(result.events).toHaveLength(1);
    expect(result.monthViewHint).toEqual(monthViewHint);
    expect(listSchedulesWithMetaSpy).toHaveBeenCalledWith("ws-1", {
      from: "2025-02-01",
      to: "2025-02-28",
      calendarView: "month",
      includeViewHint: true,
      monthCellVisibleLimit: 4,
      monthViewTimeZone: "UTC",
    });
  });

  it("returns empty month payload when listSchedulesWithMeta response is undefined", async () => {
    listSchedulesWithMetaSpy.mockResolvedValueOnce(undefined);

    const api = await mountHookApi();
    const result = await api.getEventsWithHint({
      from: "2025-02-01",
      to: "2025-02-28",
      workspaceId: "ws-1",
      calendarView: "month",
    });

    expect(result).toEqual({ events: [], monthViewHint: null });
  });

  it("falls back to local store events when hook backend path fails", async () => {
    store.events = [
      {
        id: "local-1",
        title: "Local Event",
        date: "2025-03-01",
        startTime: "07:00",
        endTime: "07:30",
      },
    ];
    listSchedulesWithMetaSpy.mockRejectedValueOnce(new Error("meta-failure"));

    const api = await mountHookApi();
    const withHint = await api.getEventsWithHint({
      from: "2025-03-01",
      to: "2025-03-02",
      workspaceId: "ws-1",
      calendarView: "month",
    } as any);
    const withoutHint = await api.getEvents({
      from: "2025-03-01",
      to: "2025-03-02",
    });

    expect(withHint.monthViewHint).toBeNull();
    expect(withHint.events[0].categoryId).toBe("schedule");
    expect(withoutHint[0].id).toBe("local-1");
  });

  it("applies fallback defaults for local events without title/time/category", async () => {
    store.events = [{ id: "local-minimal", date: "2025-07-01" }];

    const api = await mountHookApi();
    const result = await api.getEventsWithHint({
      from: "2025-07-01",
      to: "2025-07-01",
    } as any);

    expect(result.events[0]).toMatchObject({
      id: "local-minimal",
      title: "Untitled",
      startTime: "09:00",
      endTime: "09:30",
      categoryId: "schedule",
    });
  });

  it("creates events through backend path and fallback path", async () => {
    const api = await mountHookApi();

    createScheduleSpy.mockResolvedValueOnce({ id: "created-by-api" });
    const created = await api.createEvent({
      title: "Create Event",
      date: "2025-04-10",
      startTime: "09:00",
      endTime: "09:45",
      categoryId: "work",
      description: "event body",
    } as any);

    expect(created.id).toBe("created-by-api");
    expect(createScheduleSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        start: "2025-04-10T09:00:00.000Z",
        end: "2025-04-10T09:45:00.000Z",
      })
    );
    expect(store.addEvent).toHaveBeenCalled();

    createScheduleSpy.mockRejectedValueOnce(new Error("create-failure"));
    const fallbackCreated = await api.createEvent({
      title: "Fallback Event",
      date: "2025-04-10",
      startTime: "10:00",
      endTime: "10:30",
    } as any);

    expect(fallbackCreated.categoryId).toBe("schedule");
  });

  it("creates event with generated id and defaults when API omits values", async () => {
    createScheduleSpy.mockResolvedValueOnce({});
    const api = await mountHookApi();

    const created = await api.createEvent({
      date: "2025-08-01",
      startTime: "07:00",
      endTime: "07:30",
    } as any);

    expect(created.id.startsWith("e-")).toBe(true);
    expect(created.title).toBe("Untitled");
    expect(created.categoryId).toBe("schedule");
  });

  it("uses fallback defaults when createEvent local addEvent returns sparse payload", async () => {
    createScheduleSpy.mockRejectedValueOnce(new Error("create-failure"));
    store.addEvent.mockImplementationOnce(() => ({
      id: "fallback-created",
      title: "",
      date: "2025-08-01",
    }));
    const api = await mountHookApi();

    const created = await api.createEvent({
      date: "2025-08-01",
      startTime: "07:00",
      endTime: "07:30",
    } as any);

    expect(created).toMatchObject({
      id: "fallback-created",
      startTime: "09:00",
      endTime: "09:30",
      categoryId: "schedule",
    });
  });

  it("removes events and returns false when local remove fails", async () => {
    const api = await mountHookApi();

    await expect(api.removeEvent("ev-1")).resolves.toBe(true);
    expect(deleteScheduleSpy).toHaveBeenCalledWith("ev-1");
    expect(store.removeEvent).toHaveBeenCalledWith("ev-1");

    deleteScheduleSpy.mockRejectedValueOnce(new Error("delete-failure"));
    store.removeEvent.mockImplementationOnce(() => {
      throw new Error("remove-failure");
    });

    await expect(api.removeEvent("ev-2")).resolves.toBe(false);
  });

  it("creates full schedule payload and supports fallback mode", async () => {
    const api = await mountHookApi();

    createScheduleSpy.mockResolvedValueOnce({ id: "schedule-created" });
    const created = await api.createSchedule({
      event: {
        title: "Create Schedule",
        date: "2025-05-10",
        startTime: "11:00",
        endTime: "12:00",
        categoryId: "work",
        categoryCode: "work",
        description: "description",
      } as any,
      serviceIds: ["svc-1"],
      employeeIds: ["emp-1"],
      totalPriceCents: 5000,
      workspaceId: "ws-1",
      inventoryInputs: [{ itemId: "i-1", quantity: 1 }] as any,
      inventoryOutputs: [{ itemId: "i-2", quantity: 2 }] as any,
    });

    expect(created.id).toBe("schedule-created");
    expect(createScheduleSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        workspaceId: "ws-1",
        categoryCode: "work",
        services: [{ serviceId: "svc-1", priceCents: 5000 }],
        workers: [{ workspaceId: "ws-1", userUid: "emp-1" }],
      })
    );

    createScheduleSpy.mockRejectedValueOnce(new Error("schedule-failure"));
    const fallback = await api.createSchedule({
      event: {
        title: "Fallback Schedule",
        date: "2025-05-10",
        startTime: "13:00",
        endTime: "14:00",
      } as any,
    });

    expect(fallback.categoryId).toBe("schedule");
  });

  it("creates schedule with defaults when optional fields are missing", async () => {
    createScheduleSpy.mockResolvedValueOnce({});
    const api = await mountHookApi();

    const created = await api.createSchedule({
      event: {
        date: "2025-09-01",
        startTime: "08:00",
        endTime: "08:30",
      } as any,
    });

    expect(created.id.startsWith("e-")).toBe(true);
    expect(created.title).toBe("Untitled");
    expect(created.categoryId).toBe("schedule");
    expect(createScheduleSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        services: undefined,
        workers: undefined,
        categoryCode: null,
      })
    );
  });

  it("updates schedule with status/category fields and handles fallback", async () => {
    const api = await mountHookApi();

    store.removeEvent.mockImplementationOnce(() => {
      throw new Error("cleanup-failure");
    });
    updateScheduleSpy.mockResolvedValueOnce({ id: "updated-id" });

    const updated = await api.updateEvent({
      id: "existing-id",
      event: {
        title: "Updated",
        date: "2025-06-01",
        startTime: "15:00",
        endTime: "15:30",
        categoryId: "work",
        status: { id: "status-2" },
      } as any,
      serviceIds: ["svc-1"],
      employeeIds: ["emp-1"],
      totalPriceCents: 9000,
      workspaceId: "ws-1",
    });

    expect(updated.id).toBe("updated-id");
    expect(updateScheduleSpy).toHaveBeenCalledWith(
      "existing-id",
      expect.objectContaining({
        categoryId: "work",
        statusId: "status-2",
        services: [{ serviceId: "svc-1", priceCents: 9000 }],
      })
    );
    expect(store.addEvent).toHaveBeenCalled();

    updateScheduleSpy.mockRejectedValueOnce(new Error("update-failure"));
    store.removeEvent.mockImplementationOnce(() => {
      throw new Error("fallback-remove-failure");
    });

    const fallback = await api.updateEvent({
      id: "fallback-id",
      event: {
        title: "Fallback Updated",
        date: "2025-06-02",
        startTime: "16:00",
        endTime: "16:45",
      } as any,
      totalPriceCents: 100,
    });

    expect(fallback.id).toBe("fallback-id");
  });

  it("updates schedule using direct statusId and keeps source id when API omits id", async () => {
    updateScheduleSpy.mockResolvedValueOnce({});
    const api = await mountHookApi();

    const updated = await api.updateEvent({
      id: "source-id",
      event: {
        title: "Update direct",
        date: "2025-10-01",
        startTime: "09:00",
        endTime: "10:00",
        statusId: "status-direct",
      } as any,
    });

    expect(updated.id).toBe("source-id");
    expect(updateScheduleSpy).toHaveBeenCalledWith(
      "source-id",
      expect.objectContaining({
        statusId: "status-direct",
        categoryId: null,
      })
    );
  });

  it("uses fallback defaults when updateEvent local addEvent returns sparse payload", async () => {
    updateScheduleSpy.mockRejectedValueOnce(new Error("update-failure"));
    store.addEvent.mockImplementationOnce(() => ({
      id: "fallback-updated",
      title: "",
      date: "2025-10-02",
    }));
    const api = await mountHookApi();

    const updated = await api.updateEvent({
      id: "fallback-updated",
      event: {
        date: "2025-10-02",
        startTime: "11:00",
        endTime: "11:30",
      } as any,
    });

    expect(updated).toMatchObject({
      id: "fallback-updated",
      startTime: "09:00",
      endTime: "09:30",
      categoryId: "schedule",
    });
  });
});


