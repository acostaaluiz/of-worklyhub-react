jest.mock("@modules/company/services/company.service", () => ({
  companyService: {
    getWorkspaceValue: jest.fn(),
  },
}));

jest.mock("@modules/clients/services/clients-360-api", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("@modules/work-order/services/work-order.http.service", () => ({
  listWorkOrdersPage: jest.fn(),
}));

jest.mock("@modules/schedule/services/schedules-api", () => ({
  SchedulesApi: jest.fn(),
}));

jest.mock("@modules/finance/services/finance-api", () => ({
  FinanceApi: jest.fn(),
}));

import Clients360Api from "@modules/clients/services/clients-360-api";
import { companyService } from "@modules/company/services/company.service";
import { listWorkOrdersPage } from "@modules/work-order/services/work-order.http.service";
import { SchedulesApi } from "@modules/schedule/services/schedules-api";
import { FinanceApi } from "@modules/finance/services/finance-api";
import { Clients360Service } from "./clients-360.service";

type ClientsApiMock = {
  getBundle: jest.Mock;
};

type SchedulesApiMock = {
  listSchedules: jest.Mock;
};

type FinanceApiMock = {
  listEntries: jest.Mock;
};

function createClientsApiMock(): ClientsApiMock {
  return {
    getBundle: jest.fn().mockResolvedValue({
      generatedAt: "2026-03-10T10:00:00.000Z",
      source: "backend",
      profiles: [],
      timeline: [],
    }),
  };
}

function createSchedulesApiMock(): SchedulesApiMock {
  return {
    listSchedules: jest.fn().mockResolvedValue([]),
  };
}

function createFinanceApiMock(): FinanceApiMock {
  return {
    listEntries: jest.fn().mockResolvedValue([]),
  };
}

describe("Clients360Service", () => {
  const mockedCompanyService = jest.mocked(companyService);
  const clientsApiCtor = jest.mocked(Clients360Api as unknown as jest.Mock);
  const schedulesApiCtor = jest.mocked(SchedulesApi as unknown as jest.Mock);
  const financeApiCtor = jest.mocked(FinanceApi as unknown as jest.Mock);
  const mockedListWorkOrdersPage = jest.mocked(listWorkOrdersPage);
  let clientsApiMock: ClientsApiMock;
  let schedulesApiMock: SchedulesApiMock;
  let financeApiMock: FinanceApiMock;

  beforeEach(() => {
    jest.clearAllMocks();
    clientsApiMock = createClientsApiMock();
    schedulesApiMock = createSchedulesApiMock();
    financeApiMock = createFinanceApiMock();

    clientsApiCtor.mockImplementation(() => clientsApiMock as never);
    schedulesApiCtor.mockImplementation(() => schedulesApiMock as never);
    financeApiCtor.mockImplementation(() => financeApiMock as never);
    mockedListWorkOrdersPage.mockResolvedValue({
      data: [],
      pagination: {
        limit: 100,
        offset: 0,
        total: 0,
        hasMore: false,
        nextOffset: null,
      },
    });
    mockedCompanyService.getWorkspaceValue.mockReturnValue({
      workspaceId: "ws-1",
    } as never);
  });

  it("returns empty aggregated bundle when workspace is unavailable", async () => {
    mockedCompanyService.getWorkspaceValue.mockReturnValue(null as never);
    const service = new Clients360Service();

    const bundle = await service.fetchBundle();

    expect(bundle.source).toBe("aggregated");
    expect(bundle.profiles).toEqual([]);
    expect(bundle.timeline).toEqual([]);
    expect(clientsApiMock.getBundle).not.toHaveBeenCalled();
  });

  it("returns backend bundle when API responds with valid profile and timeline arrays", async () => {
    clientsApiMock.getBundle.mockResolvedValueOnce({
      generatedAt: "2026-03-10T10:30:00.000Z",
      source: "backend",
      profiles: [{ id: "c-1", displayName: "Ana", workspaceId: "ws-1" }],
      timeline: [{ id: "t-1", clientId: "c-1", workspaceId: "ws-1", module: "schedule" }],
    });
    const service = new Clients360Service();

    const bundle = await service.fetchBundle({ workspaceId: "ws-1" });

    expect(bundle.source).toBe("backend");
    expect(bundle.profiles).toHaveLength(1);
    expect(bundle.timeline).toHaveLength(1);
    expect(clientsApiMock.getBundle).toHaveBeenCalledWith("ws-1", undefined);
  });

  it("falls back to aggregated snapshot and links schedule, work-order and finance data", async () => {
    clientsApiMock.getBundle.mockResolvedValueOnce({
      generatedAt: "2026-03-10T10:30:00.000Z",
      source: "backend",
      profiles: null,
      timeline: null,
    });
    schedulesApiMock.listSchedules.mockResolvedValue([
      {
        id: "sch-1",
        title: "Ana Costa - Cleaning",
        description: "contact: ana@clinic.com / +55 (11) 99999-0000",
        start: "2026-03-07T20:00:00.000Z",
        status: { label: "Completed", code: "completed" },
      },
    ]);
    mockedListWorkOrdersPage.mockResolvedValueOnce({
      data: [
        {
          id: "wo-1",
          title: "WO 2026-03-07 - Ana Costa - Deep Cleaning",
          description: "Deep cleaning completed",
          status: { label: "Completed" },
          metadata: {
            patientName: "Ana Costa",
            patientEmail: "ana@clinic.com",
            patientPhone: "+55 (11) 99999-0000",
          },
          totalEstimatedCents: 25905,
          completedAt: "2026-03-07T21:00:00.000Z",
        },
      ],
      pagination: {
        limit: 100,
        offset: 0,
        total: 1,
        hasMore: false,
        nextOffset: null,
      },
    });
    financeApiMock.listEntries.mockResolvedValueOnce([
      {
        id: "fe-1",
        work_order_id: "wo-1",
        amount_cents: 25905,
        occurred_at: "2026-03-07T22:00:00.000Z",
        description: "Patient payment - Ana Costa",
      },
    ]);
    const service = new Clients360Service();

    const bundle = await service.fetchBundle({ workspaceId: "ws-1" });

    expect(bundle.source).toBe("aggregated");
    expect(bundle.profiles).toHaveLength(1);
    expect(bundle.profiles[0]).toMatchObject({
      displayName: "Ana Costa",
      email: "ana@clinic.com",
      totalAppointments: 1,
      totalWorkOrders: 1,
      totalFinanceEntries: 1,
      totalBilledCents: 25905,
    });
    expect(bundle.timeline).toHaveLength(3);
    expect(bundle.timeline.map((item) => item.module).sort()).toEqual([
      "finance",
      "schedule",
      "work-order",
    ]);
  });

  it("applies search filtering by email and phone on aggregated profiles", async () => {
    clientsApiMock.getBundle.mockRejectedValue(new Error("backend-down"));
    schedulesApiMock.listSchedules.mockResolvedValueOnce([
      {
        id: "sch-ana",
        title: "Ana Costa - Follow up",
        description: "ana@clinic.com | +55 (11) 99999-0000",
        start: "2026-03-01T10:00:00.000Z",
      },
      {
        id: "sch-bruno",
        title: "Bruno Lima - Follow up",
        description: "bruno@clinic.com | +55 (21) 98888-7777",
        start: "2026-03-01T12:00:00.000Z",
      },
    ]);
    const service = new Clients360Service();

    const byEmail = await service.fetchBundle({
      workspaceId: "ws-1",
      search: "ana@clinic.com",
      from: "2026-03-01",
      to: "2026-03-10",
    });
    expect(byEmail.profiles).toHaveLength(1);
    expect(byEmail.profiles[0].displayName).toContain("Ana");
  });

  it("reuses in-flight request for the same dashboard key", async () => {
    let resolveBackend: ((value: DataValue) => void) | null = null;
    clientsApiMock.getBundle.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveBackend = resolve;
      })
    );
    const service = new Clients360Service();

    const first = service.fetchBundle({ workspaceId: "ws-1", search: "ana" });
    const second = service.fetchBundle({ workspaceId: "ws-1", search: "ana" });
    expect(clientsApiMock.getBundle).toHaveBeenCalledTimes(1);

    resolveBackend?.({
      generatedAt: "2026-03-10T10:30:00.000Z",
      source: "backend",
      profiles: [],
      timeline: [],
    });

    await expect(first).resolves.toMatchObject({ source: "backend" });
    await expect(second).resolves.toMatchObject({ source: "backend" });
  });
});
