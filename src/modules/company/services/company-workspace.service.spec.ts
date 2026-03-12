jest.mock("./companies-api", () => ({
  CompaniesApi: jest.fn(),
}));

jest.mock("./company.service", () => ({
  companyService: {
    getWorkspaceValue: jest.fn(),
  },
}));

import { CompaniesApi } from "./companies-api";
import { companyService } from "./company.service";
import { CompanyWorkspaceService } from "./company-workspace.service";

type CompaniesApiMock = {
  listWorkspaceServices: jest.Mock;
  createWorkspaceService: jest.Mock;
  updateWorkspaceService: jest.Mock;
};

function createApiMock(): CompaniesApiMock {
  return {
    listWorkspaceServices: jest.fn().mockResolvedValue([
      {
        id: "svc-1",
        name: "Cleaning",
        duration_minutes: 45,
        price_cents: 4500,
        is_active: true,
      },
    ]),
    createWorkspaceService: jest.fn().mockResolvedValue({
      id: "svc-2",
      name: "Whitening",
      category: "cosmetic",
      duration_minutes: 60,
      price_cents: 12000,
      is_active: true,
    }),
    updateWorkspaceService: jest.fn().mockResolvedValue({
      id: "svc-1",
      name: "Cleaning Premium",
      duration_minutes: 55,
      price_cents: 5200,
      is_active: true,
    }),
  };
}

describe("CompanyWorkspaceService", () => {
  const companiesApiCtor = jest.mocked(CompaniesApi);
  const mockedCompanyService = jest.mocked(companyService);
  let apiMock: CompaniesApiMock;

  beforeEach(() => {
    jest.clearAllMocks();
    apiMock = createApiMock();
    companiesApiCtor.mockImplementation(() => apiMock as unknown as CompaniesApi);
    mockedCompanyService.getWorkspaceValue.mockReturnValue({ workspaceId: "ws-1" } as never);
  });

  it("lists services and maps array/wrapper payloads", async () => {
    const service = new CompanyWorkspaceService();

    const rows = await service.listServices();
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      id: "svc-1",
      title: "Cleaning",
      durationMinutes: 45,
      priceCents: 4500,
    });

    apiMock.listWorkspaceServices.mockResolvedValueOnce({
      services: [
        {
          id: "svc-3",
          name: "Consultation",
          active: false,
          created_at: "2026-03-10T12:00:00.000Z",
        },
      ],
    });
    const wrapped = await service.listServices();
    expect(wrapped).toHaveLength(1);
    expect(wrapped[0]).toMatchObject({
      id: "svc-3",
      title: "Consultation",
      active: false,
    });
  });

  it("deduplicates concurrent listServices calls", async () => {
    let resolveList: ((value: DataValue[]) => void) | undefined;
    apiMock.listWorkspaceServices.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveList = resolve;
      })
    );
    const service = new CompanyWorkspaceService();

    const first = service.listServices();
    const second = service.listServices();
    expect(apiMock.listWorkspaceServices).toHaveBeenCalledTimes(1);

    resolveList?.([{ id: "svc-1", name: "Cut" }]);
    await expect(first).resolves.toHaveLength(1);
    await expect(second).resolves.toHaveLength(1);
  });

  it("creates service via workspace API and maps response", async () => {
    const service = new CompanyWorkspaceService();

    const created = await service.createService({
      title: "Whitening",
      tags: ["cosmetic"],
      description: "Teeth whitening",
      durationMinutes: 60,
      priceCents: 12000,
      capacity: 1,
      active: true,
    });

    expect(apiMock.createWorkspaceService).toHaveBeenCalledWith(
      "ws-1",
      expect.objectContaining({
        name: "Whitening",
        category: "cosmetic",
        duration_minutes: 60,
        price_cents: 12000,
        is_active: true,
      })
    );
    expect(created).toMatchObject({
      id: "svc-2",
      title: "Whitening",
      tags: ["cosmetic"],
    });
  });

  it("updates service through direct payload, serviceId indirection and fallback refresh", async () => {
    const service = new CompanyWorkspaceService();

    const direct = await service.updateService("svc-1", {
      title: "Cleaning Premium",
      tags: ["hair"],
      durationMinutes: 55,
      priceCents: 5200,
      capacity: 2,
      active: true,
    });
    expect(apiMock.updateWorkspaceService).toHaveBeenCalledWith(
      "ws-1",
      "svc-1",
      expect.objectContaining({
        name: "Cleaning Premium",
        category: "hair",
        duration_minutes: 55,
        price_cents: 5200,
        capacity: 2,
        is_active: true,
      })
    );
    expect(direct.id).toBe("svc-1");

    apiMock.updateWorkspaceService.mockResolvedValueOnce({ serviceId: "svc-4" });
    apiMock.listWorkspaceServices.mockResolvedValueOnce([
      { id: "svc-4", name: "Recovered service", price_cents: 3000 },
    ]);
    const byServiceId = await service.updateService("svc-4", {});
    expect(byServiceId.id).toBe("svc-4");

    apiMock.updateWorkspaceService.mockResolvedValueOnce({});
    apiMock.listWorkspaceServices.mockResolvedValueOnce([
      { id: "svc-5", name: "Fallback refresh", price_cents: 1800 },
    ]);
    const refreshed = await service.updateService("svc-5", {});
    expect(refreshed.id).toBe("svc-5");
  });

  it("wraps workspace validation and refresh failures into AppError", async () => {
    const service = new CompanyWorkspaceService();

    mockedCompanyService.getWorkspaceValue.mockReturnValue(null as never);
    await expect(
      service.createService({
        title: "No workspace",
      })
    ).rejects.toMatchObject({
      message: "No workspace available",
      kind: "Unknown",
    });

    mockedCompanyService.getWorkspaceValue.mockReturnValue({ workspaceId: "ws-1" } as never);
    apiMock.updateWorkspaceService.mockResolvedValueOnce({ serviceId: "svc-x" });
    apiMock.listWorkspaceServices.mockResolvedValueOnce([{ id: "svc-y", name: "other" }]);
    await expect(service.updateService("svc-x", {})).rejects.toMatchObject({
      message: "Updated service not found after update",
      kind: "Unknown",
    });
  });

  it("throws not implemented on deactivateService", async () => {
    const service = new CompanyWorkspaceService();

    await expect(service.deactivateService("svc-1")).rejects.toThrow("Not implemented");
  });
});
