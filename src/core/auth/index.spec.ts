beforeEach(() => jest.resetModules());

jest.mock('./auth-api', () => ({ AuthApi: jest.fn(() => ({})) }));

test('index module restores token and sets auth manager handlers', () => {
  const restoreSpy = jest.fn();
  const getAccessSpy = jest.fn().mockReturnValue('mytoken');
  const getRefreshHandler = jest.fn().mockReturnValue(() => Promise.resolve({ accessToken: 'r' }));

  jest.mock('./firebase/firebase-auth.service', () => ({
    firebaseAuthService: {
      restoreFromStorage: restoreSpy,
      getAccessToken: getAccessSpy,
      getRefreshHandler,
    },
  }));

  const setTokens = jest.fn();
  const setRefreshHandler = jest.fn();
  jest.mock('./auth-manager', () => ({ authManager: { setTokens, setRefreshHandler } }));

  jest.mock('@core/http/client.instance', () => ({ httpClient: {} }));

  const mod = require('./index');
  expect(restoreSpy).toHaveBeenCalled();
  expect(setTokens).toHaveBeenCalledWith('mytoken', null);
  expect(setRefreshHandler).toHaveBeenCalled();
  expect(mod.authApi).toBeDefined();
});
