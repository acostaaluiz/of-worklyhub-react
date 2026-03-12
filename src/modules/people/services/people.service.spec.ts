jest.mock("@modules/people/services/people-api", () => ({
  PeopleApi: jest.fn(),
}));

jest.mock("@modules/company/services/company.service", () => ({
  companyService: {
    getWorkspaceValue: jest.fn(),
  },
}));

jest.mock("@modules/users/services/auth.service", () => ({
  usersAuthService: {
    getSessionValue: jest.fn(),
  },
}));

import { PeopleApi } from "@modules/people/services/people-api";
import { companyService } from "@modules/company/services/company.service";
import { usersAuthService } from "@modules/users/services/auth.service";
import { PeopleService } from "./people.service";

type PeopleApiMock = {
  listWorkspaceWorkers: jest.Mock;
  createWorker: jest.Mock;
  updateWorker: jest.Mock;
};

function createApiMock(): PeopleApiMock {
  return {
    listWorkspaceWorkers: jest.fn().mockResolvedValue([
      {
        id: "emp-1",
        first_name: "Ana",
        last_name: "Costa",
        email: "ana@worklyhub.com",
        active: true,
      },
    ]),
    createWorker: jest.fn().mockResolvedValue({
      worker: {
        id: "emp-2",
        first_name: "Bruno",
        last_name: "Silva",
        user_email: "bruno@worklyhub.com",
        job_title: "Dentist",
        active: true,
      },
    }),
    updateWorker: jest.fn().mockResolvedValue({
      id: "emp-1",
      job_title: "Specialist",
      department: "Operations",
      salary_cents: 500000,
    }),
  };
}

describe("PeopleService", () => {
  const peopleApiCtor = jest.mocked(PeopleApi);
  const mockedCompanyService = jest.mocked(companyService);
  const mockedAuthService = jest.mocked(usersAuthService);
  let apiMock: PeopleApiMock;

  beforeEach(() => {
    jest.clearAllMocks();
    apiMock = createApiMock();
    peopleApiCtor.mockImplementation(() => apiMock as unknown as PeopleApi);
    mockedCompanyService.getWorkspaceValue.mockReturnValue({ workspaceId: "ws-1" } as never);
    mockedAuthService.getSessionValue.mockReturnValue({ uid: "user-1" } as never);
  });

  it("lists employees from backend and maps payload", async () => {
    const service = new PeopleService();

    const rows = await service.listEmployees();

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      id: "emp-1",
      firstName: "Ana",
      lastName: "Costa",
      email: "ana@worklyhub.com",
      active: true,
    });
    expect(apiMock.listWorkspaceWorkers).toHaveBeenCalledWith("ws-1");
  });

  it("maps list payload when backend returns workers wrapper object", async () => {
    apiMock.listWorkspaceWorkers.mockResolvedValueOnce({
      workers: [
        {
          id: "emp-wrapped",
          first_name: "Wrapped",
          last_name: "Worker",
          user_email: "wrapped@worklyhub.com",
          active: true,
        },
      ],
    });
    const service = new PeopleService();

    const rows = await service.listEmployees();

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      id: "emp-wrapped",
      firstName: "Wrapped",
      lastName: "Worker",
      email: "wrapped@worklyhub.com",
    });
  });

  it("maps alternative worker fields from backend payload", async () => {
    apiMock.listWorkspaceWorkers.mockResolvedValueOnce([
      {
        worker_id: "emp-alt",
        name: "Nina Walker",
        user_email: "nina@worklyhub.com",
        phone: "5511999990000",
        role: "Assistant",
        hiredAt: "2026-03-01T10:00:00.000Z",
        salaryCents: 123000,
        active: false,
      },
    ]);
    const service = new PeopleService();

    const rows = await service.listEmployees();

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      id: "emp-alt",
      firstName: "Nina",
      lastName: "Walker",
      email: "nina@worklyhub.com",
      phone: "5511999990000",
      role: "Assistant",
      hiredAt: "2026-03-01T10:00:00.000Z",
      salaryCents: 123000,
      active: false,
    });
  });

  it("reuses in-flight list promise to prevent duplicated backend calls", async () => {
    let resolver: ((value: DataValue[]) => void) | undefined;
    apiMock.listWorkspaceWorkers.mockReturnValueOnce(
      new Promise<DataValue[]>((resolve) => {
        resolver = resolve;
      })
    );
    const service = new PeopleService();

    const first = service.listEmployees();
    const second = service.listEmployees();

    expect(apiMock.listWorkspaceWorkers).toHaveBeenCalledTimes(1);
    resolver?.([
      {
        id: "emp-1",
        first_name: "Ana",
      },
    ]);

    await expect(first).resolves.toHaveLength(1);
    await expect(second).resolves.toHaveLength(1);
  });

  it("falls back to local list when workspace is unavailable", async () => {
    mockedCompanyService.getWorkspaceValue.mockReturnValue(null as never);
    const service = new PeopleService();

    const rows = await service.listEmployees();

    expect(rows.length).toBeGreaterThan(0);
    expect(apiMock.listWorkspaceWorkers).not.toHaveBeenCalled();
  });

  it("wraps listEmployees backend failures into AppError", async () => {
    apiMock.listWorkspaceWorkers.mockRejectedValueOnce(new Error("people-list-failure"));
    const service = new PeopleService();

    await expect(service.listEmployees()).rejects.toMatchObject({
      message: "people-list-failure",
      kind: "Unknown",
    });
  });

  it("creates employee from backend response shapes and fallback", async () => {
    const service = new PeopleService();

    const created = await service.createEmployee({
      firstName: "Bruno",
      lastName: "Silva",
      email: "bruno@worklyhub.com",
      active: true,
    });
    expect(created).toMatchObject({
      id: "emp-2",
      firstName: "Bruno",
      lastName: "Silva",
    });

    apiMock.createWorker.mockResolvedValueOnce({
      workers: [
        {
          id: "emp-3",
          first_name: "Carla",
          last_name: "Lima",
        },
      ],
    });
    const createdFromWorkersArray = await service.createEmployee({
      firstName: "Carla",
      lastName: "Lima",
      active: true,
    });
    expect(createdFromWorkersArray.id).toBe("emp-3");

    apiMock.createWorker.mockResolvedValueOnce({});
    const fallbackCreated = await service.createEmployee({
      firstName: "Fallback",
      lastName: "User",
      active: true,
    });
    expect(fallbackCreated.id).toContain("e-");

    apiMock.createWorker.mockResolvedValueOnce({
      id: "emp-flat",
      first_name: "Flat",
      last_name: "Shape",
      user_email: "flat@worklyhub.com",
      job_title: "Nurse",
      active: true,
    });
    const flatCreated = await service.createEmployee({
      firstName: "Flat",
      lastName: "Shape",
      active: true,
    });
    expect(flatCreated).toMatchObject({
      id: "emp-flat",
      role: "Nurse",
      email: "flat@worklyhub.com",
    });
  });

  it("creates employee in local fallback mode when workspace is unavailable", async () => {
    mockedCompanyService.getWorkspaceValue.mockReturnValue(null as never);
    const service = new PeopleService();

    const created = await service.createEmployee({
      firstName: "Local",
      lastName: "Only",
      active: true,
    });

    expect(created.id).toContain("e-");
    expect(apiMock.createWorker).not.toHaveBeenCalled();
  });

  it("wraps createEmployee backend failures into AppError", async () => {
    apiMock.createWorker.mockRejectedValueOnce(new Error("people-create-failure"));
    const service = new PeopleService();

    await expect(
      service.createEmployee({
        firstName: "Will",
        lastName: "Fail",
        active: true,
      })
    ).rejects.toMatchObject({
      message: "people-create-failure",
      kind: "Unknown",
    });
  });

  it("updates employee with backend result and local fallback", async () => {
    const service = new PeopleService();
    const listed = await service.listEmployees();

    const updated = await service.updateEmployee(listed[0].id, {
      role: "Specialist",
      department: "Operations",
      salaryCents: 500000,
    });
    expect(updated).toMatchObject({
      id: listed[0].id,
      role: "Specialist",
      department: "Operations",
      salaryCents: 500000,
    });
    expect(apiMock.updateWorker).toHaveBeenCalledWith(
      "ws-1",
      "user-1",
      expect.objectContaining({
        job_title: "Specialist",
      })
    );

    await service.updateEmployee(listed[0].id, {
      hiredAt: "2026-03-10T08:00:00.000Z",
    });
    expect(apiMock.updateWorker).toHaveBeenCalledWith(
      "ws-1",
      "user-1",
      expect.objectContaining({
        hired_at: "2026-03-10T08:00:00.000Z",
      })
    );

    apiMock.updateWorker.mockResolvedValueOnce({
      id: "emp-not-in-cache",
      first_name: "Mapped",
      last_name: "User",
      email: "mapped@worklyhub.com",
      active: true,
      created_at: "2026-03-10T10:00:00.000Z",
    });
    const mapped = await service.updateEmployee("emp-not-in-cache", {
      firstName: "Mapped",
      lastName: "User",
      active: true,
    });
    expect(mapped).toMatchObject({
      id: "emp-not-in-cache",
      firstName: "Mapped",
    });

    mockedCompanyService.getWorkspaceValue.mockReturnValue(null as never);
    const local = await service.createEmployee({
      firstName: "Local",
      lastName: "Edit",
      active: true,
    });
    const locallyUpdated = await service.updateEmployee(local.id, { role: "Front desk" });
    expect(locallyUpdated.role).toBe("Front desk");
  });

  it("updates locally when workspace exists but auth session is missing", async () => {
    const service = new PeopleService();
    mockedCompanyService.getWorkspaceValue.mockReturnValue(null as never);
    const local = await service.createEmployee({
      firstName: "No",
      lastName: "Session",
      active: true,
    });

    mockedCompanyService.getWorkspaceValue.mockReturnValue({ workspaceId: "ws-1" } as never);
    mockedAuthService.getSessionValue.mockReturnValue(null as never);

    const updated = await service.updateEmployee(local.id, {
      department: "Backoffice",
    });

    expect(updated.department).toBe("Backoffice");
    expect(apiMock.updateWorker).not.toHaveBeenCalled();
  });

  it("throws wrapped errors on update/deactivate not found flows", async () => {
    mockedCompanyService.getWorkspaceValue.mockReturnValue(null as never);
    const service = new PeopleService();

    await expect(service.updateEmployee("missing-id", { role: "X" })).rejects.toMatchObject({
      message: "Employee not found",
      kind: "Unknown",
    });

    await expect(service.deactivateEmployee("missing-id")).rejects.toMatchObject({
      message: "Employee not found",
      kind: "Unknown",
    });
  });

  it("returns employee by id and deactivates existing employee", async () => {
    mockedCompanyService.getWorkspaceValue.mockReturnValue(null as never);
    const service = new PeopleService();
    const created = await service.createEmployee({
      firstName: "Laura",
      lastName: "Mendes",
      active: true,
    });

    const found = await service.getEmployee(created.id);
    expect(found?.id).toBe(created.id);

    await service.deactivateEmployee(created.id);
    const after = await service.getEmployee(created.id);
    expect(after?.active).toBe(false);
    await expect(service.getEmployee("unknown-id")).resolves.toBeNull();
  });

  it("wraps getEmployee internal failures into AppError", async () => {
    const service = new PeopleService();
    (service as unknown as { employees: { find: (predicate: unknown) => unknown } }).employees = {
      find: () => {
        throw new Error("people-get-failure");
      },
    };

    await expect(service.getEmployee("emp-x")).rejects.toMatchObject({
      message: "people-get-failure",
      kind: "Unknown",
    });
  });
});
