import { BehaviorSubject } from "rxjs";
import { firebaseAuthService } from "@core/auth/firebase/firebase-auth.service";
import { authApi } from "@core/auth";
import { authManager } from "@core/auth/auth-manager";
import { localStorageProvider } from "@core/storage/local-storage.provider";

export type UserSession = { uid: string; claims: unknown } | null;

const SESSION_KEY = "auth.session";

export class UsersAuthService {
  private session$ = new BehaviorSubject<UserSession>(this.loadFromStorage());

  private loadFromStorage(): UserSession {
    try {
      const raw = localStorageProvider.get(SESSION_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as UserSession;
    } catch {
      return null;
    }
  }

  getSession$() {
    return this.session$.asObservable();
  }

  getSessionValue(): UserSession {
    return this.session$.getValue();
  }

  async signIn(email: string, password: string): Promise<UserSession> {
    // Authenticate in Firebase (client SDK)
    const { token } = await firebaseAuthService.signInWithEmail(email, password);

    // Validate token on backend
    const verified = await authApi.verifyToken(token);

    // persist minimal session
    const session: UserSession = { uid: verified.uid, claims: verified.claims };
    localStorageProvider.set(SESSION_KEY, JSON.stringify(session));

    // set tokens for http client
    authManager.setTokens(token, null);

    // update subject
    this.session$.next(session);

    return session;
  }

  async register(name: string | undefined, email: string, password: string): Promise<unknown> {
    // forward to backend register endpoint
    const payload = { name, email, password };
    return authApi.register(payload);
  }

  async signOut(): Promise<void> {
    try {
      await firebaseAuthService.signOut();
    } finally {
      localStorageProvider.remove(SESSION_KEY);
      authManager.signOut();
      this.session$.next(null);
    }
  }
}

export const usersAuthService = new UsersAuthService();
