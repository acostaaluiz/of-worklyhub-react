jest.mock("./companies-api", () => ({
  CompaniesApi: jest.fn(),
}));

jest.mock("@core/storage/local-storage.provider", () => ({
  localStorageProvider: {
    get: jest.fn().mockReturnValue(null),
    set: jest.fn(),
    remove: jest.fn(),
  },
}));

import { CompaniesApi } from "./companies-api";
import { localStorageProvider } from "@core/storage/local-storage.provider";
import { CompanyService } from "./company.service";
import { AppError } from "@core/errors/app-error";

type CompaniesApiMock = {
  createWorkspace: jest.Mock;
  getWorkspace: jest.Mock;
  updateWorkspaceProfile: jest.Mock;
  requestWallpaperSignature: jest.Mock;
};

function createApiMock(): CompaniesApiMock {
  return {
    createWorkspace: jest.fn().mockResolvedValue({ id: "ws-1", fullName: "Clinic" }),
    getWorkspace: jest.fn().mockResolvedValue({
      workspace: { id: "ws-1", fullName: "Clinic", company_profile: {} },
    }),
    updateWorkspaceProfile: jest.fn().mockResolvedValue({
      workspace: { id: "ws-1", tradeName: "Clinic Co.", company_profile: {} },
    }),
    requestWallpaperSignature: jest.fn().mockResolvedValue({
      url: "https://upload.worklyhub.dev/wallpaper",
      path: "company/ws-1/wallpaper.jpg",
      maxSize: 1024 * 1024,
    }),
  };
}

describe("CompanyService", () => {
  const companiesApiCtor = jest.mocked(CompaniesApi);
  const mockedStorage = jest.mocked(localStorageProvider);
  let apiMock: CompaniesApiMock;

  beforeEach(() => {
    jest.clearAllMocks();
    apiMock = createApiMock();
    companiesApiCtor.mockImplementation(() => apiMock as unknown as CompaniesApi);
    mockedStorage.get.mockReturnValue(null);
  });

  it("creates workspace and persists in local storage", async () => {
    const service = new CompanyService();
    const workspace = await service.createWorkspace({
      creatorUid: "user-1",
      accountType: "company",
      fullName: "Clinic",
      email: "owner@clinic.com",
    });

    expect(workspace).toMatchObject({ id: "ws-1" });
    expect(mockedStorage.set).toHaveBeenCalledWith(
      "company.workspace",
      JSON.stringify(workspace)
    );
    expect(service.getWorkspaceValue()).toMatchObject({ id: "ws-1" });
  });

  it("fetches workspace by email and clears when no workspace is found", async () => {
    const service = new CompanyService();

    const found = await service.fetchWorkspaceByEmail("owner@clinic.com");
    expect(found).toMatchObject({ id: "ws-1" });
    expect(mockedStorage.set).toHaveBeenCalledWith(
      "company.workspace",
      expect.stringContaining("\"id\":\"ws-1\"")
    );

    apiMock.getWorkspace.mockResolvedValueOnce({ workspace: null });
    const missing = await service.fetchWorkspaceByEmail("missing@clinic.com");
    expect(missing).toBeNull();
    expect(mockedStorage.remove).toHaveBeenCalledWith("company.workspace");
  });

  it("returns null on expected onboarding/auth errors during fetchWorkspaceByEmail", async () => {
    apiMock.getWorkspace.mockRejectedValueOnce(
      new AppError({ kind: "NotFound", message: "workspace_not_found", statusCode: 404 })
    );
    const service = new CompanyService();

    await expect(service.fetchWorkspaceByEmail("owner@clinic.com")).resolves.toBeNull();
    expect(mockedStorage.remove).toHaveBeenCalledWith("company.workspace");
  });

  it("throws unexpected workspace fetch errors", async () => {
    apiMock.getWorkspace.mockRejectedValueOnce(new Error("workspace-failure"));
    const service = new CompanyService();

    await expect(service.fetchWorkspaceByEmail("owner@clinic.com")).rejects.toMatchObject({
      message: "workspace-failure",
    });
  });

  it("deduplicates concurrent fetchWorkspaceByEmail calls for the same email", async () => {
    const deferred = new Promise<{
      workspace: { id: string; fullName: string; company_profile: Record<string, never> };
    }>((resolve) => {
      setTimeout(
        () => resolve({ workspace: { id: "ws-1", fullName: "Clinic", company_profile: {} } }),
        0
      );
    });
    apiMock.getWorkspace.mockReturnValueOnce(deferred);

    const service = new CompanyService();
    const first = service.fetchWorkspaceByEmail("owner@clinic.com");
    const second = service.fetchWorkspaceByEmail("owner@clinic.com");

    const [firstResult, secondResult] = await Promise.all([first, second]);

    expect(firstResult).toMatchObject({ id: "ws-1" });
    expect(secondResult).toMatchObject({ id: "ws-1" });
    expect(apiMock.getWorkspace).toHaveBeenCalledTimes(1);
    expect(apiMock.getWorkspace).toHaveBeenCalledWith("owner@clinic.com");
  });

  it("updates workspace profile and wraps missing-workspace errors", async () => {
    mockedStorage.get.mockReturnValueOnce(JSON.stringify({ id: "ws-1", company_profile: {} }));
    const serviceWithWorkspace = new CompanyService();
    const updated = await serviceWithWorkspace.updateWorkspaceProfile({
      accountType: "company",
      tradeName: "Clinic Co.",
    });

    expect(apiMock.updateWorkspaceProfile).toHaveBeenCalledWith(
      "ws-1",
      expect.objectContaining({
        accountType: "company",
        tradeName: "Clinic Co.",
      })
    );
    expect(updated).toMatchObject({ id: "ws-1", tradeName: "Clinic Co." });

    const serviceWithoutWorkspace = new CompanyService();
    await expect(
      serviceWithoutWorkspace.updateWorkspaceProfile({
        accountType: "company",
        tradeName: "No Workspace",
      })
    ).rejects.toMatchObject({
      message: "No workspace available",
      kind: "Unknown",
    });
  });

  it("returns mocked company profile payload for local development", async () => {
    const service = new CompanyService();

    const profile = await service.getCompanyProfile("company-1");

    expect(profile).toMatchObject({
      id: "company-1",
      name: "Barbearia JJ",
    });
    expect(profile.services).toBeDefined();
    expect(profile.services?.length ?? 0).toBeGreaterThan(0);
  });

  it("uploads workspace wallpaper and updates cached workspace", async () => {
    mockedStorage.get.mockReturnValueOnce(
      JSON.stringify({ id: "ws-1", company_profile: { trade_name: "Clinic" } })
    );

    class FakeXmlHttpRequest {
      upload: {
        onprogress: ((event: ProgressEvent<EventTarget>) => void) | null;
      } = { onprogress: null };
      status = 200;
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      open(): void {}
      setRequestHeader(): void {}
      send(_body: Document | XMLHttpRequestBodyInit | null): void {
        this.upload.onprogress?.({
          lengthComputable: true,
          loaded: 5,
          total: 10,
        } as ProgressEvent<EventTarget>);
        setTimeout(() => this.onload?.(), 0);
      }
    }

    const originalXMLHttpRequest = globalThis.XMLHttpRequest;
    globalThis.XMLHttpRequest = FakeXmlHttpRequest as unknown as typeof XMLHttpRequest;

    try {
      const service = new CompanyService();
      const file = new File(["binary"], "wallpaper.jpg", { type: "image/jpeg" });
      const onProgress = jest.fn();
      const path = await service.uploadWorkspaceWallpaper(file, onProgress);

      expect(path).toBe("company/ws-1/wallpaper.jpg");
      expect(onProgress).toHaveBeenCalledWith(50);
      expect(mockedStorage.set).toHaveBeenCalledWith(
        "company.workspace",
        expect.stringContaining("company/ws-1/wallpaper.jpg")
      );
      expect(service.getWorkspaceValue()).toMatchObject({
        company_profile: { wallpaperUrl: "company/ws-1/wallpaper.jpg" },
      });
    } finally {
      globalThis.XMLHttpRequest = originalXMLHttpRequest;
    }
  });

  it("validates wallpaper signature and file size limits", async () => {
    const service = new CompanyService();
    const file = new File(["binary"], "wallpaper.jpg", { type: "image/jpeg" });

    apiMock.requestWallpaperSignature.mockResolvedValueOnce(null);
    await expect(service.uploadWorkspaceWallpaper(file)).rejects.toThrow(
      "Invalid signature response"
    );

    apiMock.requestWallpaperSignature.mockResolvedValueOnce({
      url: "https://upload.worklyhub.dev/wallpaper",
      path: "company/ws-1/wallpaper.jpg",
      maxSize: 1,
    });
    await expect(service.uploadWorkspaceWallpaper(file)).rejects.toThrow(
      "File exceeds maximum allowed size"
    );
  });
});
