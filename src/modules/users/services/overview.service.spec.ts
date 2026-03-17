jest.mock("@core/storage/local-storage.provider", () => ({
  localStorageProvider: {
    get: jest.fn(),
    set: jest.fn(),
    remove: jest.fn(),
  },
}));

jest.mock("./overview-api", () => ({
  UsersOverviewApi: jest.fn(),
}));

jest.mock("@core/i18n", () => ({
  getCurrentAppLanguage: jest.fn(() => "pt-BR"),
}));

import { localStorageProvider } from "@core/storage/local-storage.provider";
import { getCurrentAppLanguage } from "@core/i18n";
import { UsersOverviewApi } from "./overview-api";
import { UsersOverviewService } from "./overview.service";

type OverviewApiMock = {
  getOverview: jest.Mock;
};

function createApiMock(): OverviewApiMock {
  return {
    getOverview: jest.fn().mockResolvedValue({
      profile: {
        email: "owner@worklyhub.com",
        full_name: "Dr. Maria Rita",
        profile_photo_path: "/files/profile.jpg",
      },
      modules: [{ uid: "work-order", name: "Work order" }],
    }),
  };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe("UsersOverviewService", () => {
  const mockedStorage = jest.mocked(localStorageProvider);
  const mockedGetCurrentAppLanguage = jest.mocked(getCurrentAppLanguage);
  const overviewApiCtor = jest.mocked(UsersOverviewApi);
  let apiMock: OverviewApiMock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetCurrentAppLanguage.mockReturnValue("pt-BR");
    apiMock = createApiMock();
    overviewApiCtor.mockImplementation(() => apiMock as unknown as UsersOverviewApi);
    mockedStorage.get.mockReturnValue(null);
  });

  it("ignores cached overview when cached user and session email do not match", () => {
    mockedStorage.get.mockImplementation((key: string) => {
      if (key === "users.overview") {
        return JSON.stringify({
          user: "another@worklyhub.com",
          language: "pt-BR",
          overview: {
            profile: { email: "another@worklyhub.com" },
            modules: [{ uid: "finance", name: "Finance" }],
          },
        });
      }
      if (key === "auth.session") {
        return JSON.stringify({ email: "owner@worklyhub.com" });
      }
      return null;
    });

    const service = new UsersOverviewService();

    expect(service.getOverviewValue()).toBeNull();
  });

  it("loads cached overview when user matches session and modules are available", () => {
    mockedStorage.get.mockImplementation((key: string) => {
      if (key === "users.overview") {
        return JSON.stringify({
          user: "owner@worklyhub.com",
          language: "pt-BR",
          overview: {
            profile: { email: "owner@worklyhub.com", name: "Owner" },
            modules: [{ uid: "clients", name: "Clients" }],
          },
        });
      }
      if (key === "auth.session") {
        return JSON.stringify({ email: "owner@worklyhub.com" });
      }
      return null;
    });

    const service = new UsersOverviewService();

    expect(service.getModulesValue()).toEqual([{ uid: "clients", name: "Clients" }]);
    expect(service.getProfileValue()).toEqual({
      email: "owner@worklyhub.com",
      name: "Owner",
    });
  });

  it("ignores cached overview when cached modules are empty", () => {
    mockedStorage.get.mockImplementation((key: string) => {
      if (key === "users.overview") {
        return JSON.stringify({
          user: "owner@worklyhub.com",
          language: "pt-BR",
          overview: {
            profile: { email: "owner@worklyhub.com", name: "Owner" },
            modules: [],
          },
        });
      }
      if (key === "auth.session") {
        return JSON.stringify({ email: "owner@worklyhub.com" });
      }
      return null;
    });

    const service = new UsersOverviewService();
    expect(service.getOverviewValue()).toBeNull();
    expect(service.getModulesValue()).toBeNull();
    expect(service.getProfileValue()).toBeNull();
  });

  it("fetches overview, normalizes profile and persists cache", async () => {
    mockedStorage.get.mockImplementation((key: string) => {
      if (key === "auth.session") return JSON.stringify({ email: "owner@worklyhub.com" });
      return null;
    });
    const service = new UsersOverviewService();

    const overview = await service.fetchOverview(true);

    expect(overview?.profile).toMatchObject({
      email: "owner@worklyhub.com",
      name: "Dr. Maria Rita",
      profilePhotoUrl: "/files/profile.jpg",
    });
    expect(mockedStorage.set).toHaveBeenCalledWith(
      "users.overview",
      expect.stringContaining('"language":"pt-BR"')
    );
  });

  it("ignores cached overview when cached language differs from current app language", () => {
    mockedStorage.get.mockImplementation((key: string) => {
      if (key === "users.overview") {
        return JSON.stringify({
          user: "owner@worklyhub.com",
          language: "en-US",
          overview: {
            profile: { email: "owner@worklyhub.com", name: "Owner" },
            modules: [{ uid: "clients", name: "Clients" }],
          },
        });
      }
      if (key === "auth.session") {
        return JSON.stringify({ email: "owner@worklyhub.com" });
      }
      return null;
    });

    const service = new UsersOverviewService();

    expect(service.getOverviewValue()).toBeNull();
  });

  it("clears in-memory overview when app language changes and refetches with fresh language", async () => {
    const service = new UsersOverviewService();
    await service.fetchOverview(true);

    mockedGetCurrentAppLanguage.mockReturnValue("en-US");
    apiMock.getOverview.mockResolvedValueOnce({
      profile: {
        email: "owner@worklyhub.com",
        full_name: "Dr. Maria Rita",
      },
      modules: [{ uid: "finance", name: "Finance" }],
    });

    const refreshed = await service.fetchOverview();

    expect(refreshed?.modules).toEqual([{ uid: "finance", name: "Finance" }]);
    expect(mockedStorage.remove).toHaveBeenCalledWith("users.overview");
  });

  it("supports wrapped data payload and defaults modules when response modules are invalid", async () => {
    apiMock.getOverview.mockResolvedValueOnce({
      data: {
        profile: {
          email: "wrapped@worklyhub.com",
          fullName: "Wrapped User",
          profilePhotoPath: "/wrapped/path.jpg",
        },
        modules: null,
      },
    });
    const service = new UsersOverviewService();

    const overview = await service.fetchOverview(true);

    expect(overview).toEqual({
      profile: {
        email: "wrapped@worklyhub.com",
        fullName: "Wrapped User",
        profilePhotoPath: "/wrapped/path.jpg",
        name: "Wrapped User",
        profilePhotoUrl: "/wrapped/path.jpg",
      },
      modules: [],
    });
  });

  it("reuses pending request when fetchOverview is called concurrently", async () => {
    const pending = deferred<{
      profile: { email: string };
      modules: Array<{ uid: string; name: string }>;
    }>();
    apiMock.getOverview.mockReturnValueOnce(pending.promise);
    const service = new UsersOverviewService();

    const first = service.fetchOverview(true);
    const second = service.fetchOverview(true);

    expect(apiMock.getOverview).toHaveBeenCalledTimes(1);

    pending.resolve({
      profile: { email: "owner@worklyhub.com" },
      modules: [{ uid: "home", name: "Home" }],
    });
    await expect(first).resolves.toMatchObject({
      profile: { email: "owner@worklyhub.com" },
    });
    await expect(second).resolves.toMatchObject({
      profile: { email: "owner@worklyhub.com" },
    });
  });

  it("clears cache and resets state", () => {
    const service = new UsersOverviewService();

    service.clear();

    expect(mockedStorage.remove).toHaveBeenCalledWith("users.overview");
    expect(service.getOverviewValue()).toBeNull();
  });

  it("returns null when storage payload is invalid JSON and keeps fetch resilient when cache save fails", async () => {
    mockedStorage.get.mockReturnValue("{invalid-json");
    mockedStorage.set.mockImplementationOnce(() => {
      throw new Error("storage-set-failure");
    });

    const service = new UsersOverviewService();
    expect(service.getOverviewValue()).toBeNull();

    await expect(service.fetchOverview(true)).resolves.toMatchObject({
      profile: expect.objectContaining({
        email: "owner@worklyhub.com",
      }),
    });
  });
});
