describe("firebase bootstrap", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it("initializes firebase app and auth singleton", () => {
    const initializeApp = jest.fn().mockReturnValue({ app: true });
    const getAuth = jest.fn().mockReturnValue({ auth: true });

    jest.isolateModules(() => {
      jest.doMock("firebase/app", () => ({ initializeApp }));
      jest.doMock("firebase/auth", () => ({ getAuth }));

      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const mod = require("./firebase");

      expect(initializeApp).toHaveBeenCalledTimes(1);
      expect(getAuth).toHaveBeenCalledWith({ app: true });
      expect(mod.firebaseApp).toEqual({ app: true });
      expect(mod.firebaseAuth).toEqual({ auth: true });
    });
  });
});
