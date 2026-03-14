import { AuthManager } from "./auth-manager";

describe("AuthManager", () => {
  it("stores and clears tokens", () => {
    const manager = new AuthManager();

    expect(manager.getAccessToken()).toBeNull();
    expect(manager.getRefreshToken()).toBeNull();

    manager.setTokens("access-token", "refresh-token");

    expect(manager.getAccessToken()).toBe("access-token");
    expect(manager.getRefreshToken()).toBe("refresh-token");

    manager.signOut();

    expect(manager.getAccessToken()).toBeNull();
    expect(manager.getRefreshToken()).toBeNull();
  });

  it("notifies registered listeners on signOut", () => {
    const manager = new AuthManager();
    const listener = jest.fn();
    manager.onSignOut(listener);

    manager.signOut();

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("allows removing signOut listeners", () => {
    const manager = new AuthManager();
    const listener = jest.fn();
    const dispose = manager.onSignOut(listener);
    dispose();

    manager.signOut();

    expect(listener).not.toHaveBeenCalled();
  });

  it("refreshes using the configured handler", async () => {
    const refreshHandler = jest.fn().mockResolvedValue({
      accessToken: "new-access-token",
      refreshToken: "new-refresh-token",
    });
    const manager = new AuthManager({ refreshHandler });
    manager.setTokens("old-access-token", "old-refresh-token");

    const refreshedAccessToken = await manager.refresh();

    expect(refreshedAccessToken).toBe("new-access-token");
    expect(manager.getAccessToken()).toBe("new-access-token");
    expect(manager.getRefreshToken()).toBe("new-refresh-token");
    expect(refreshHandler).toHaveBeenCalledWith("old-refresh-token");
  });

  it("keeps previous refresh token when handler omits refreshToken", async () => {
    const refreshHandler = jest.fn().mockResolvedValue({
      accessToken: "new-access-token",
    });
    const manager = new AuthManager({ refreshHandler });
    manager.setTokens("old-access-token", "old-refresh-token");

    const refreshedAccessToken = await manager.refresh();

    expect(refreshedAccessToken).toBe("new-access-token");
    expect(manager.getRefreshToken()).toBe("old-refresh-token");
  });

  it("returns null when refresh cannot be completed", async () => {
    const managerWithoutHandler = new AuthManager();
    managerWithoutHandler.setTokens("access-token", "refresh-token");

    await expect(managerWithoutHandler.refresh()).resolves.toBeNull();

    const managerWithInvalidResult = new AuthManager({
      refreshHandler: jest.fn().mockResolvedValue({}),
    });
    managerWithInvalidResult.setTokens("access-token", "refresh-token");

    await expect(managerWithInvalidResult.refresh()).resolves.toBeNull();
  });
});
