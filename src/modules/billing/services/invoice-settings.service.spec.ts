jest.mock("./invoice-settings-api", () => ({
  InvoiceSettingsApi: jest.fn(),
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

import { AppError } from "@core/errors/app-error";
import { InvoiceSettingsApi } from "./invoice-settings-api";
import { InvoiceSettingsService } from "./invoice-settings.service";
import { companyService } from "@modules/company/services/company.service";
import { usersAuthService } from "@modules/users/services/auth.service";

type InvoiceSettingsApiMock = {
  getWorkspaceInvoiceSettings: jest.Mock;
  upsertWorkspaceInvoiceSettings: jest.Mock;
  getServiceSaleNfeConfiguration: jest.Mock;
  upsertServiceSaleNfeConfiguration: jest.Mock;
};

function createApiMock(): InvoiceSettingsApiMock {
  return {
    getWorkspaceInvoiceSettings: jest.fn().mockResolvedValue({
      data: {
        workspaceId: "ws-1",
        settings: {
          enabled: true,
          modules: { "work-order": true, schedule: true },
        },
        source: "database",
        updatedAt: "2026-03-10T10:00:00.000Z",
      },
    }),
    upsertWorkspaceInvoiceSettings: jest.fn().mockResolvedValue({
      data: {
        workspaceId: "ws-1",
        settings: {
          enabled: false,
          modules: {
            "work-order": false,
            schedule: false,
            finance: false,
            inventory: false,
            people: false,
            clients: false,
          },
        },
        source: "database",
        updatedAt: "2026-03-10T10:00:00.000Z",
      },
    }),
    getServiceSaleNfeConfiguration: jest.fn().mockResolvedValue({
      data: {
        id: "cfg-1",
        resolution: "workspace",
        updatedAt: "2026-03-10T09:00:00.000Z",
        configuration: {
          environment: "production",
          integration: {
            provider: " govbr ",
            baseUrl: " https://nfe.example ",
            issuePath: " /issue ",
            auth: { type: "basic", username: " user ", password: " pass " },
          },
          issuer: {
            legalName: " Clinic ",
            document: " 123 ",
          },
        },
      },
    }),
    upsertServiceSaleNfeConfiguration: jest.fn().mockResolvedValue({
      data: {
        id: "cfg-1",
        updatedAt: "2026-03-10T11:00:00.000Z",
        configuration: {
          environment: "homologation",
          integration: {
            provider: "govbr",
            baseUrl: "https://nfe.example",
            issuePath: "/issue",
            auth: { type: "none" },
          },
          issuer: {
            legalName: "Clinic",
            document: "123",
          },
        },
      },
    }),
  };
}

describe("InvoiceSettingsService", () => {
  const invoiceApiCtor = jest.mocked(InvoiceSettingsApi);
  const mockedCompanyService = jest.mocked(companyService);
  const mockedAuthService = jest.mocked(usersAuthService);
  let apiMock: InvoiceSettingsApiMock;

  beforeEach(() => {
    jest.clearAllMocks();
    apiMock = createApiMock();
    invoiceApiCtor.mockImplementation(() => apiMock as unknown as InvoiceSettingsApi);
    mockedCompanyService.getWorkspaceValue.mockReturnValue({ workspaceId: "ws-1" } as never);
    mockedAuthService.getSessionValue.mockReturnValue({ uid: "user-1" } as never);
  });

  it("fetches workspace bundle and normalizes settings/configuration", async () => {
    const service = new InvoiceSettingsService();

    const bundle = await service.fetchWorkspaceBundle();

    expect(bundle.workspaceId).toBe("ws-1");
    expect(bundle.settingsSource).toBe("database");
    expect(bundle.workspaceSettings.modules).toMatchObject({
      "work-order": true,
      schedule: true,
      finance: false,
      inventory: false,
      people: false,
      clients: false,
    });
    expect(bundle.nfeResolution).toBe("workspace");
    expect(bundle.nfeConfiguration.integration.provider).toBe(" govbr ");
    expect(apiMock.getWorkspaceInvoiceSettings).toHaveBeenCalledWith(
      "ws-1",
      expect.objectContaining({
        "Content-Type": "application/json",
        "x-workspace-id": "ws-1",
        "x-user-uid": "user-1",
      })
    );
  });

  it("uses default nfe configuration when backend returns not-found app error", async () => {
    apiMock.getServiceSaleNfeConfiguration.mockRejectedValueOnce(
      new AppError({
        kind: "Http",
        message: "Not found",
        statusCode: 404,
        details: { error: { code: "CONFIG_NOT_FOUND" } },
      })
    );
    const service = new InvoiceSettingsService();

    const bundle = await service.fetchWorkspaceBundle();

    expect(bundle.nfeResolution).toBe("none");
    expect(bundle.nfeConfiguration.environment).toBe("homologation");
    expect(bundle.nfeConfiguration.integration.auth?.type).toBe("none");
  });

  it("saves workspace settings with normalized module flags", async () => {
    const service = new InvoiceSettingsService();

    const result = await service.saveWorkspaceSettings({
      enabled: true,
      modules: {
        "work-order": true,
        schedule: false,
        finance: true,
        inventory: false,
        people: true,
        clients: false,
      },
    });

    expect(result.workspaceId).toBe("ws-1");
    expect(apiMock.upsertWorkspaceInvoiceSettings).toHaveBeenCalledWith(
      expect.objectContaining({
        workspaceId: "ws-1",
        updatedByUid: "user-1",
      }),
      expect.any(Object)
    );
  });

  it("saves nfe configuration with sanitation and normalization", async () => {
    const service = new InvoiceSettingsService();

    const result = await service.saveWorkspaceNfeConfiguration({
      environment: "production",
      integration: {
        provider: "  govbr  ",
        baseUrl: " https://nfe.example ",
        issuePath: " /issue ",
        auth: {
          type: "basic",
          username: " user ",
          password: " pass ",
        },
      },
      issuer: {
        legalName: " Clinic ",
        document: " 123 ",
        stateRegistration: " 001 ",
      },
    });

    expect(result.workspaceId).toBe("ws-1");
    expect(apiMock.upsertServiceSaleNfeConfiguration).toHaveBeenCalledWith(
      expect.objectContaining({
        workspaceId: "ws-1",
        updatedByUid: "user-1",
        configuration: expect.objectContaining({
          integration: expect.objectContaining({
            provider: "govbr",
            baseUrl: "https://nfe.example",
            issuePath: "/issue",
          }),
          issuer: expect.objectContaining({
            legalName: "Clinic",
            document: "123",
            stateRegistration: "001",
          }),
        }),
      }),
      expect.any(Object)
    );
    expect(result.configuration.integration.auth?.type).toBe("none");
  });

  it("wraps validation and api failures into AppError", async () => {
    mockedCompanyService.getWorkspaceValue.mockReturnValue(null as never);
    const service = new InvoiceSettingsService();

    await expect(service.fetchWorkspaceBundle()).rejects.toMatchObject({
      message: "Workspace is required to load invoice settings.",
      kind: "Unknown",
    });

    mockedCompanyService.getWorkspaceValue.mockReturnValue({ workspaceId: "ws-1" } as never);
    apiMock.upsertWorkspaceInvoiceSettings.mockRejectedValueOnce(new Error("save-settings-failure"));
    await expect(
      service.saveWorkspaceSettings({
        enabled: false,
        modules: {
          "work-order": false,
          schedule: false,
          finance: false,
          inventory: false,
          people: false,
          clients: false,
        },
      })
    ).rejects.toMatchObject({
      message: "save-settings-failure",
      kind: "Unknown",
    });
  });
});

