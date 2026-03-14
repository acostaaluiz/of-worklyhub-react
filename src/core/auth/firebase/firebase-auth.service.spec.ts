/* eslint-disable @typescript-eslint/no-explicit-any */
jest.mock("./firebase", () => ({
  firebaseAuth: {
    currentUser: null as null | {
      getIdToken: (force?: boolean) => Promise<string>;
    },
  },
}));

jest.mock("firebase/auth", () => ({
  signInWithEmailAndPassword: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  signOut: jest.fn(),
}));

jest.mock("@core/storage/local-storage.provider", () => ({
  localStorageProvider: {
    get: jest.fn(),
    set: jest.fn(),
    remove: jest.fn(),
  },
}));

import { FirebaseAuthService } from "./firebase-auth.service";
import { firebaseAuth } from "./firebase";
import { localStorageProvider } from "@core/storage/local-storage.provider";
import { createUnsignedJwt } from "@core/auth/session-security";
import {
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "firebase/auth";

function createUser(token = "id-token") {
  return {
    getIdToken: jest.fn().mockResolvedValue(token),
  };
}

function setCurrentUser(
  user: null | { getIdToken: (force?: boolean) => Promise<string> },
): void {
  Object.defineProperty(firebaseAuth, "currentUser", {
    configurable: true,
    writable: true,
    value: user,
  });
}

describe("FirebaseAuthService", () => {
  const mockedStorage = jest.mocked(localStorageProvider);
  const mockedSignIn = jest.mocked(signInWithEmailAndPassword);
  const mockedSignOut = jest.mocked(firebaseSignOut);
  const mockedReset = jest.mocked(sendPasswordResetEmail);

  beforeEach(() => {
    jest.clearAllMocks();
    setCurrentUser(null);
    mockedStorage.get.mockReturnValue(null);
  });

  it("signs in, reads token and persists it", async () => {
    const user = createUser("token-from-firebase");
    mockedSignIn.mockResolvedValue({ user } as any);
    const service = new FirebaseAuthService();

    const result = await service.signInWithEmail(
      "person@worklyhub.com",
      "password",
    );

    expect(mockedSignIn).toHaveBeenCalledWith(
      firebaseAuth,
      "person@worklyhub.com",
      "password",
    );
    expect(user.getIdToken).toHaveBeenCalledWith(false);
    expect(result.token).toBe("token-from-firebase");
    expect(service.getAccessToken()).toBe("token-from-firebase");
    expect(mockedStorage.set).toHaveBeenCalledWith(
      "auth.idToken",
      "token-from-firebase",
    );
  });

  it("returns cached token when no firebase user exists", async () => {
    const service = new FirebaseAuthService();
    service.setToken("cached-token");

    await expect(service.getToken()).resolves.toBe("cached-token");
  });

  it("refreshes token from current user in getToken", async () => {
    const user = createUser("fresh-token");
    setCurrentUser(user);
    const service = new FirebaseAuthService();

    const token = await service.getToken();

    expect(token).toBe("fresh-token");
    expect(user.getIdToken).toHaveBeenCalledWith(false);
    expect(service.getAccessToken()).toBe("fresh-token");
  });

  it("removes token and session when setToken receives null", () => {
    const service = new FirebaseAuthService();

    service.setToken(null);

    expect(mockedStorage.remove).toHaveBeenCalledWith("auth.idToken");
    expect(mockedStorage.remove).toHaveBeenCalledWith("auth.session");
    expect(service.getAccessToken()).toBeNull();
  });

  it("refreshes token with force=true and clears token on failure", async () => {
    const successUser = createUser("forced-token");
    setCurrentUser(successUser);
    const service = new FirebaseAuthService();

    await expect(service.refresh()).resolves.toBe("forced-token");
    expect(successUser.getIdToken).toHaveBeenCalledWith(true);

    const failureUser = {
      getIdToken: jest.fn().mockRejectedValue(new Error("refresh-failed")),
    };
    setCurrentUser(failureUser as any);

    await expect(service.refresh()).resolves.toBeNull();
    expect(service.getAccessToken()).toBeNull();
  });

  it("returns null from refresh when there is no current user", async () => {
    const service = new FirebaseAuthService();

    await expect(service.refresh()).resolves.toBeNull();
  });

  it("signs out and always clears token", async () => {
    const service = new FirebaseAuthService();
    service.setToken("token-before-signout");

    mockedSignOut.mockResolvedValue(undefined);
    await service.signOut();
    expect(mockedSignOut).toHaveBeenCalledWith(firebaseAuth);
    expect(service.getAccessToken()).toBeNull();

    service.setToken("token-before-failure");
    mockedSignOut.mockRejectedValueOnce(new Error("firebase-signout-error"));
    await expect(service.signOut()).rejects.toThrow("firebase-signout-error");
    expect(service.getAccessToken()).toBeNull();
  });

  it("delegates password reset to firebase auth", async () => {
    mockedReset.mockResolvedValue(undefined);
    const service = new FirebaseAuthService();

    await service.sendPasswordReset("person@worklyhub.com");

    expect(mockedReset).toHaveBeenCalledWith(
      firebaseAuth,
      "person@worklyhub.com",
    );
  });

  it("restores token from storage when available", () => {
    mockedStorage.get.mockReturnValue("stored-token");
    const service = new FirebaseAuthService();

    service.restoreFromStorage();

    expect(mockedStorage.get).toHaveBeenCalledWith("auth.idToken");
    expect(service.getAccessToken()).toBe("stored-token");
  });

  it("clears persisted auth when stored token is expired JWT", () => {
    const expiredToken = createUnsignedJwt({
      exp: Math.floor((Date.now() - 5 * 60 * 1000) / 1000),
    });
    mockedStorage.get.mockReturnValue(expiredToken);
    const service = new FirebaseAuthService();

    service.restoreFromStorage();

    expect(mockedStorage.remove).toHaveBeenCalledWith("auth.idToken");
    expect(mockedStorage.remove).toHaveBeenCalledWith("auth.session");
    expect(service.getAccessToken()).toBeNull();
  });

  it("returns compatible refresh handler output", async () => {
    const user = createUser("refreshed-token");
    setCurrentUser(user);
    const service = new FirebaseAuthService();

    const refreshHandler = service.getRefreshHandler();
    await expect(refreshHandler()).resolves.toEqual({
      accessToken: "refreshed-token",
    });

    setCurrentUser(null);
    await expect(refreshHandler()).resolves.toBeNull();
  });
});
