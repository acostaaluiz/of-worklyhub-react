jest.mock('./firebase', () => ({
  firebaseAuth: { currentUser: null },
}));

jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  signOut: jest.fn(),
}));

import { FirebaseAuthService, firebaseAuthService } from './firebase-auth.service';
import { localStorageProvider } from '@core/storage/local-storage.provider';
import { signInWithEmailAndPassword, sendPasswordResetEmail, signOut as firebaseSignOut } from 'firebase/auth';

describe('FirebaseAuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // ensure storage is clean
    jest.spyOn(localStorageProvider, 'set').mockImplementation(() => {});
    jest.spyOn(localStorageProvider, 'remove').mockImplementation(() => {});
  });

  test('setToken stores and removes keys correctly', () => {
    const svc = new FirebaseAuthService();
    svc.setToken('abc');
    expect(localStorageProvider.set).toHaveBeenCalled();
    svc.setToken(null);
    expect(localStorageProvider.remove).toHaveBeenCalled();
  });

  test('getAccessToken returns currentToken', () => {
    const svc = new FirebaseAuthService();
    svc.setToken('tok');
    expect(svc.getAccessToken()).toBe('tok');
  });

  test('signOut calls firebase signOut and clears token', async () => {
    (firebaseSignOut as jest.Mock).mockResolvedValue(undefined);
    const svc = new FirebaseAuthService();
    svc.setToken('t');
    await svc.signOut();
    expect(firebaseSignOut).toHaveBeenCalled();
    expect(svc.getAccessToken()).toBeNull();
  });

  test('sendPasswordReset delegates to firebase', async () => {
    (sendPasswordResetEmail as jest.Mock).mockResolvedValue(undefined);
    const svc = new FirebaseAuthService();
    await svc.sendPasswordReset('a@b.com');
    expect(sendPasswordResetEmail).toHaveBeenCalled();
  });

  test('getRefreshHandler returns null when no user', async () => {
    const svc = new FirebaseAuthService();
    const handler = svc.getRefreshHandler();
    const res = await handler();
    expect(res).toBeNull();
  });
});
