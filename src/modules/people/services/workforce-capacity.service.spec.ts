jest.mock("@modules/people/services/people-api", () => ({
  PeopleApi: jest.fn(),
}));

jest.mock("@modules/users/services/auth.service", () => ({
  usersAuthService: {
    getSessionValue: jest.fn(),
  },
}));

import { PeopleApi } from "@modules/people/services/people-api";
import { usersAuthService } from "@modules/users/services/auth.service";
import {
  WorkforceCapacityService,
  getWeekDates,
  getWeekStartDate,
} from "./workforce-capacity.service";

type PeopleApiMock = {
  getWorkerWeeklyAvailability: jest.Mock;
  upsertWorkerWeeklyAvailability: jest.Mock;
  listAvailabilityBlocks: jest.Mock;
  createAvailabilityBlock: jest.Mock;
  deleteAvailabilityBlock: jest.Mock;
  getWorkforceCapacity: jest.Mock;
};

function createApiMock(): PeopleApiMock {
  return {
    getWorkerWeeklyAvailability: jest.fn().mockResolvedValue({
      availability: {
        employeeId: "emp-1",
        minutesByWeekday: { "1": 480, "2": 360 },
        updatedAt: "2026-03-10T10:00:00.000Z",
      },
    }),
    upsertWorkerWeeklyAvailability: jest.fn().mockResolvedValue({
      availability: {
        employeeId: "emp-1",
        minutes_by_weekday: { "1": 300, "2": 240 },
        updated_at: "2026-03-10T11:00:00.000Z",
      },
    }),
    listAvailabilityBlocks: jest.fn().mockResolvedValue({
      blocks: [
        {
          id: "block-1",
          workspaceId: "ws-1",
          employeeId: "emp-1",
          date: "2026-03-10",
          startTime: "09:00",
          endTime: "11:00",
        },
        {
          id: "invalid-block",
          employeeId: "",
        },
      ],
    }),
    createAvailabilityBlock: jest.fn().mockResolvedValue({
      block: {
        id: "block-created",
        employeeId: "emp-1",
        workspaceId: "ws-1",
        date: "2026-03-11",
        startTime: "10:00",
        endTime: "12:00",
      },
    }),
    deleteAvailabilityBlock: jest.fn().mockResolvedValue(undefined),
    getWorkforceCapacity: jest.fn().mockResolvedValue({
      weekStart: "2026-03-09",
      rows: [
        {
          employeeId: "emp-1",
          employeeName: "Dr. Ana Costa",
          weeklyAvailabilityMinutesByWeekday: { "1": 480, "2": 480 },
          daily: [
            {
              date: "2026-03-09",
              availabilityMinutes: 480,
              blockedMinutes: 60,
              scheduledMinutes: 120,
              workOrderMinutes: 180,
              plannedMinutes: 300,
              productiveMinutes: 280,
              overloadMinutes: 0,
              isOverallocated: false,
            },
            {
              date: "2026-03-10",
              availabilityMinutes: 480,
              blockedMinutes: 0,
              scheduledMinutes: 400,
              workOrderMinutes: 200,
              plannedMinutes: 600,
              productiveMinutes: 450,
              overloadMinutes: 120,
              isOverallocated: true,
            },
          ],
        },
        {
          employeeId: "emp-inactive",
          employeeName: "Inactive User",
          daily: [],
        },
      ],
      blocks: [
        {
          id: "block-1",
          employeeId: "emp-1",
          date: "2026-03-10",
          startTime: "09:00",
          endTime: "11:00",
        },
      ],
    }),
  };
}

describe("workforce-capacity.service", () => {
  const peopleApiCtor = jest.mocked(PeopleApi);
  const mockedAuthService = jest.mocked(usersAuthService);
  let apiMock: PeopleApiMock;

  beforeEach(() => {
    jest.clearAllMocks();
    apiMock = createApiMock();
    peopleApiCtor.mockImplementation(() => apiMock as unknown as PeopleApi);
    mockedAuthService.getSessionValue.mockReturnValue({ uid: "user-1" } as never);
  });

  it("computes monday week start and week dates", () => {
    expect(getWeekStartDate("2026-03-11")).toBe("2026-03-09");
    expect(getWeekDates("2026-03-09")).toEqual([
      "2026-03-09",
      "2026-03-10",
      "2026-03-11",
      "2026-03-12",
      "2026-03-13",
      "2026-03-14",
      "2026-03-15",
    ]);
  });

  it("loads and saves weekly availability with normalization", async () => {
    const service = new WorkforceCapacityService();

    const availability = await service.getWeeklyAvailability("ws-1", "emp-1");
    expect(availability.employeeId).toBe("emp-1");
    expect(availability.minutesByWeekday["1"]).toBe(480);

    const saved = await service.saveWeeklyAvailability("ws-1", {
      employeeId: "emp-1",
      minutesByWeekday: { "1": 240, "2": -50 },
    });
    expect(saved.minutesByWeekday["2"]).toBe(240);
    expect(apiMock.upsertWorkerWeeklyAvailability).toHaveBeenCalledWith(
      "ws-1",
      "emp-1",
      expect.objectContaining({
        actorUid: "user-1",
        minutesByWeekday: expect.objectContaining({
          "1": 240,
          "2": 0,
        }),
      })
    );
  });

  it("lists blocks with normalized query and filters invalid rows", async () => {
    const service = new WorkforceCapacityService();

    const blocks = await service.listBlocks("ws-1", {
      from: "2026-03-09T10:00:00.000Z",
      to: "2026-03-15T10:00:00.000Z",
      employeeId: " emp-1 ",
    });

    expect(apiMock.listAvailabilityBlocks).toHaveBeenCalledWith("ws-1", {
      from: "2026-03-09",
      to: "2026-03-15",
      employeeId: "emp-1",
    });
    expect(blocks).toHaveLength(1);
    expect(blocks[0].id).toBe("block-1");
  });

  it("validates createBlock input and wraps invalid responses", async () => {
    const service = new WorkforceCapacityService();

    await expect(
      service.createBlock("ws-1", {
        employeeId: "",
        date: "2026-03-10",
        startTime: "09:00",
        endTime: "10:00",
      })
    ).rejects.toThrow("employeeId is required");

    await expect(
      service.createBlock("ws-1", {
        employeeId: "emp-1",
        date: "2026-03-10",
        startTime: "bad-time",
        endTime: "10:00",
      })
    ).rejects.toThrow("Invalid block time");

    await expect(
      service.createBlock("ws-1", {
        employeeId: "emp-1",
        date: "2026-03-10",
        startTime: "11:00",
        endTime: "10:00",
      })
    ).rejects.toThrow("Block end time must be after start time");

    const created = await service.createBlock("ws-1", {
      employeeId: "emp-1",
      date: "2026-03-11",
      startTime: "10:00",
      endTime: "12:00",
      reason: "  vacation  ",
    });
    expect(created.id).toBe("block-created");

    apiMock.createAvailabilityBlock.mockResolvedValueOnce({});
    await expect(
      service.createBlock("ws-1", {
        employeeId: "emp-1",
        date: "2026-03-11",
        startTime: "10:00",
        endTime: "12:00",
      })
    ).rejects.toMatchObject({
      message: "Invalid block response",
      kind: "Unknown",
    });
  });

  it("deletes blocks with actor query and ignores blank id", async () => {
    const service = new WorkforceCapacityService();

    await service.deleteBlock("ws-1", "block-1");
    expect(apiMock.deleteAvailabilityBlock).toHaveBeenCalledWith("ws-1", "block-1", {
      actorUid: "user-1",
    });

    await service.deleteBlock("ws-1", "   ");
    expect(apiMock.deleteAvailabilityBlock).toHaveBeenCalledTimes(1);
  });

  it("builds workforce snapshot and filters inactive employees", async () => {
    const service = new WorkforceCapacityService();

    const snapshot = await service.getSnapshot({
      workspaceId: "ws-1",
      weekStart: "2026-03-09",
      employees: [
        {
          id: "emp-1",
          firstName: "Ana",
          lastName: "Costa",
          active: true,
          createdAt: "2026-03-01T00:00:00.000Z",
        },
        {
          id: "emp-inactive",
          firstName: "Inactive",
          lastName: "User",
          active: false,
          createdAt: "2026-03-01T00:00:00.000Z",
        },
      ],
    });

    expect(snapshot.weekStart).toBe("2026-03-09");
    expect(snapshot.rows).toHaveLength(1);
    expect(snapshot.rows[0].employeeId).toBe("emp-1");
    expect(snapshot.rows[0].daily).toHaveLength(7);
    expect(snapshot.summary.employeeCount).toBe(1);
    expect(snapshot.summary.conflictSlots).toBeGreaterThanOrEqual(1);
    expect(snapshot.blocks).toHaveLength(1);
  });
});
