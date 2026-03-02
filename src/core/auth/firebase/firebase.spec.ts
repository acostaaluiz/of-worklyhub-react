beforeEach(() => jest.resetModules());

test('firebase module initializes app and auth', () => {
  const init = jest.fn().mockReturnValue({ app: true });
  const getAuth = jest.fn().mockReturnValue({ auth: true });
  jest.mock('firebase/app', () => ({ initializeApp: init }));
  jest.mock('firebase/auth', () => ({ getAuth }));

  // require after mocks
  const mod = require('./firebase');
  expect(init).toHaveBeenCalled();
  expect(getAuth).toHaveBeenCalled();
  expect(mod.firebaseApp).toEqual({ app: true });
  expect(mod.firebaseAuth).toEqual({ auth: true });
});
