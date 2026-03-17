/* eslint-disable @typescript-eslint/no-explicit-any */
jest.mock("@core/auth/firebase/firebase-auth.service", () => ({
  firebaseAuthService: {
    signInWithEmail: jest.fn(),
    sendPasswordReset: jest.fn(),
    signOut: jest.fn(),
  },
}));

jest.mock("@core/auth/auth-manager", () => ({
  authManager: {
    setTokens: jest.fn(),
    signOut: jest.fn(),
    onSignOut: jest.fn(),
  },
}));

jest.mock("@core/auth", () => ({
  authApi: {
    verifyToken: jest.fn(),
    register: jest.fn(),
  },
}));

jest.mock("@core/storage/local-storage.provider", () => ({
  localStorageProvider: {
    get: jest.fn(),
    set: jest.fn(),
    remove: jest.fn(),
  },
}));

jest.mock("@modules/company/services/company.service", () => ({
  companyService: { clear: jest.fn() },
}));

jest.mock("@modules/users/services/user.service", () => ({
  usersService: { clear: jest.fn() },
}));

jest.mock("@core/application/application.service", () => ({
  applicationService: { clear: jest.fn() },
}));

jest.mock("@modules/users/services/overview.service", () => ({
  usersOverviewService: { clear: jest.fn() },
}));

import { authApi } from "@core/auth";
import { authManager } from "@core/auth/auth-manager";
import { firebaseAuthService } from "@core/auth/firebase/firebase-auth.service";
import {
  createUnsignedJwt,
  parseSessionPayload,
} from "@core/auth/session-security";
import { applicationService } from "@core/application/application.service";
import { localStorageProvider } from "@core/storage/local-storage.provider";
import { companyService } from "@modules/company/services/company.service";
import { usersService } from "@modules/users/services/user.service";
import { usersOverviewService } from "@modules/users/services/overview.service";
import { UsersAuthService } from "./auth.service";

describe("UsersAuthService", () => {
  const mockedStorage = jest.mocked(localStorageProvider);
  const mockedAuthApi = jest.mocked(authApi);
  const mockedFirebaseService = jest.mocked(firebaseAuthService);
  const mockedAuthManager = jest.mocked(authManager);
  const mockedCompanyService = jest.mocked(companyService);
  const mockedUsersService = jest.mocked(usersService);
  const mockedApplicationService = jest.mocked(applicationService);
  const mockedUsersOverviewService = jest.mocked(usersOverviewService);

  beforeEach(() => {
    jest.clearAllMocks();
    mockedStorage.get.mockReturnValue(null);
    mockedAuthManager.onSignOut.mockReturnValue(() => undefined);
  });

  it("loads session from storage when persisted payload is valid", () => {
    mockedStorage.get.mockImplementation((key: string) => {
      if (key === "auth.idToken") return "id-token";
      if (key === "auth.session") {
        return JSON.stringify({
          uid: "uid-1",
          claims: { role: "admin" },
          email: "person@worklyhub.com",
        });
      }
      return null;
    });

    const service = new UsersAuthService();

    expect(service.getSessionValue()).toEqual({
      uid: "uid-1",
      claims: { role: "admin" },
      email: "person@worklyhub.com",
      name: undefined,
      photoUrl: undefined,
    });
  });

  it("returns null session and clears invalid persisted payload", () => {
    mockedStorage.get.mockImplementation((key: string) => {
      if (key === "auth.idToken") return "id-token";
      if (key === "auth.session") return "{invalid-json";
      return null;
    });

    const service = new UsersAuthService();

    expect(service.getSessionValue()).toBeNull();
    expect(mockedStorage.remove).toHaveBeenCalledWith("auth.session");
    expect(mockedStorage.remove).toHaveBeenCalledWith("auth.idToken");
  });

  it("registers a user through authApi", async () => {
    mockedAuthApi.register.mockResolvedValue({ ok: true });
    const service = new UsersAuthService();

    const result = await service.register(
      "Person",
      "person@worklyhub.com",
      "password",
    );

    expect(mockedAuthApi.register).toHaveBeenCalledWith({
      name: "Person",
      email: "person@worklyhub.com",
      password: "password",
    });
    expect(result).toEqual({ ok: true });
  });

  it("requests password reset through firebase service", async () => {
    mockedFirebaseService.sendPasswordReset.mockResolvedValue(undefined);
    const service = new UsersAuthService();

    await service.requestPasswordReset("person@worklyhub.com");

    expect(mockedFirebaseService.sendPasswordReset).toHaveBeenCalledWith(
      "person@worklyhub.com",
    );
  });

  it("signs in, validates token and stores session", async () => {
    const token = createUnsignedJwt({
      exp: Math.floor((Date.now() + 60 * 60 * 1000) / 1000),
    });
    mockedFirebaseService.signInWithEmail.mockResolvedValue({ token } as any);
    mockedAuthApi.verifyToken.mockResolvedValue({
      uid: "uid-1",
      claims: { role: "owner" },
    });
    const service = new UsersAuthService();

    const session = await service.signIn("person@worklyhub.com", "password");

    expect(mockedFirebaseService.signInWithEmail).toHaveBeenCalledWith(
      "person@worklyhub.com",
      "password",
    );
    expect(mockedAuthApi.verifyToken).toHaveBeenCalledWith(token);
    expect(mockedStorage.set).toHaveBeenCalledWith(
      "auth.session",
      expect.any(String),
    );
    const storedRaw = mockedStorage.set.mock.calls[0]?.[1];
    const parsedStored = parseSessionPayload(storedRaw);
    expect(parsedStored).toMatchObject({
      uid: "uid-1",
      claims: { role: "owner" },
      email: "person@worklyhub.com",
    });
    expect(mockedAuthManager.setTokens).toHaveBeenCalledWith(token, null);
    expect(service.getSessionValue()).toEqual(session);
  });

  it("signs out and always clears all cached services", async () => {
    const service = new UsersAuthService();

    mockedFirebaseService.signOut.mockResolvedValueOnce(undefined);
    await service.signOut();

    expect(mockedStorage.remove).toHaveBeenCalledWith("auth.session");
    expect(mockedStorage.remove).toHaveBeenCalledWith("auth.idToken");
    expect(mockedAuthManager.signOut).toHaveBeenCalledTimes(1);
    expect(mockedUsersService.clear).toHaveBeenCalledTimes(1);
    expect(mockedCompanyService.clear).toHaveBeenCalledTimes(1);
    expect(mockedApplicationService.clear).toHaveBeenCalledTimes(1);
    expect(mockedUsersOverviewService.clear).toHaveBeenCalledTimes(1);
    expect(service.getSessionValue()).toBeNull();

    mockedFirebaseService.signOut.mockRejectedValueOnce(
      new Error("firebase-signout-failure"),
    );
    await expect(service.signOut()).rejects.toThrow("firebase-signout-failure");

    expect(mockedStorage.remove).toHaveBeenCalledTimes(4);
    expect(mockedAuthManager.signOut).toHaveBeenCalledTimes(2);
  });

  it("clears local session and caches when authManager triggers external signOut", () => {
    mockedAuthManager.onSignOut.mockReturnValueOnce(() => undefined);
    const service = new UsersAuthService();

    const listener = mockedAuthManager.onSignOut.mock.calls[0]?.[0] as
      | (() => void)
      | undefined;
    listener?.();

    expect(mockedStorage.remove).toHaveBeenCalledWith("auth.session");
    expect(mockedStorage.remove).toHaveBeenCalledWith("auth.idToken");
    expect(mockedUsersService.clear).toHaveBeenCalledTimes(1);
    expect(mockedCompanyService.clear).toHaveBeenCalledTimes(1);
    expect(mockedApplicationService.clear).toHaveBeenCalledTimes(1);
    expect(mockedUsersOverviewService.clear).toHaveBeenCalledTimes(1);
    expect(service.getSessionValue()).toBeNull();
  });
});
