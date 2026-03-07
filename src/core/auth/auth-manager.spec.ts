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
