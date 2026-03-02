jest.mock('@core/auth/firebase/firebase-auth.service', () => ({
  firebaseAuthService: {
    signInWithEmail: jest.fn(),
    sendPasswordReset: jest.fn(),
    signOut: jest.fn(),
  },
}));

jest.mock('@core/auth/auth-manager', () => ({
  authManager: { setTokens: jest.fn(), signOut: jest.fn() },
}));

jest.mock('@core/auth', () => ({
  authApi: { verifyToken: jest.fn(), register: jest.fn() },
}));

jest.mock('@core/storage/local-storage.provider', () => ({
  localStorageProvider: { get: jest.fn(), set: jest.fn(), remove: jest.fn() },
}));

import { UsersAuthService } from './auth.service';
import { firebaseAuthService } from '@core/auth/firebase/firebase-auth.service';
import { authApi } from '@core/auth';
import { localStorageProvider } from '@core/storage/local-storage.provider';
import { authManager } from '@core/auth/auth-manager';

describe('UsersAuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('register forwards to authApi.register', async () => {
    (authApi.register as jest.Mock).mockResolvedValue({ ok: true });
    const s = new UsersAuthService();
    const result = await s.register('Name', 'a@b.com', 'pass');
    expect(authApi.register).toHaveBeenCalledWith({ name: 'Name', email: 'a@b.com', password: 'pass' });
    expect(result).toEqual({ ok: true });
  });

  test('signIn stores session and sets tokens', async () => {
    (firebaseAuthService.signInWithEmail as jest.Mock).mockResolvedValue({ token: 'tk' });
    (authApi.verifyToken as jest.Mock).mockResolvedValue({ uid: 'u1', claims: { role: 'x' } });
    const s = new UsersAuthService();

    const session = await s.signIn('a@b.com', 'pwd');

    expect(firebaseAuthService.signInWithEmail).toHaveBeenCalledWith('a@b.com', 'pwd');
    expect(authApi.verifyToken).toHaveBeenCalledWith('tk');
    expect(localStorageProvider.set).toHaveBeenCalled();
    expect(authManager.setTokens).toHaveBeenCalledWith('tk', null);
    expect(session).toMatchObject({ uid: 'u1', email: 'a@b.com' });
  });

  test('signOut clears storage and signs out external services', async () => {
    const s = new UsersAuthService();
    await s.signOut();
    expect(localStorageProvider.remove).toHaveBeenCalled();
    expect(authManager.signOut).toHaveBeenCalled();
    expect(firebaseAuthService.signOut).toHaveBeenCalled();
  });
});
