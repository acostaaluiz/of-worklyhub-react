function loadIndexModule(accessToken: string | null) {
  const restoreFromStorage = jest.fn();
  const getAccessToken = jest.fn().mockReturnValue(accessToken);
  const refreshHandler = jest
    .fn()
    .mockResolvedValue({ accessToken: "refreshed-token" });
  const getRefreshHandler = jest.fn().mockReturnValue(refreshHandler);
  const setTokens = jest.fn();
  const setRefreshHandler = jest.fn();
  const onSignOut = jest.fn();

  jest.isolateModules(() => {
    jest.doMock("./auth-api", () => ({
      AuthApi: jest.fn(() => ({})),
    }));
    jest.doMock("./firebase/firebase-auth.service", () => ({
      firebaseAuthService: {
        restoreFromStorage,
        getAccessToken,
        getRefreshHandler,
      },
    }));
    jest.doMock("./auth-manager", () => ({
      authManager: {
        setTokens,
        setRefreshHandler,
        onSignOut,
      },
    }));
    jest.doMock("@core/http/client.instance", () => ({
      httpClient: {},
    }));

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require("./index");
  });

  return {
    restoreFromStorage,
    getAccessToken,
    getRefreshHandler,
    setTokens,
    setRefreshHandler,
    onSignOut,
  };
}

describe("core/auth index bootstrap", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it("restores persisted token and wires refresh handler", () => {
    const spies = loadIndexModule("token-from-storage");

    expect(spies.restoreFromStorage).toHaveBeenCalledTimes(1);
    expect(spies.getAccessToken).toHaveBeenCalledTimes(1);
    expect(spies.getRefreshHandler).toHaveBeenCalledTimes(1);
    expect(spies.setTokens).toHaveBeenCalledWith("token-from-storage", null);
    expect(spies.setRefreshHandler).toHaveBeenCalledTimes(1);
    expect(spies.onSignOut).toHaveBeenCalledTimes(1);
    expect(spies.onSignOut).toHaveBeenCalledWith(expect.any(Function));
  });

  it("normalizes missing token to null", () => {
    const spies = loadIndexModule(null);

    expect(spies.setTokens).toHaveBeenCalledWith(null, null);
  });
});
