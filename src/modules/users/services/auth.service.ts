import { BehaviorSubject } from "rxjs";
import { firebaseAuthService } from "@core/auth/firebase/firebase-auth.service";
import { authApi } from "@core/auth";
import { authManager } from "@core/auth/auth-manager";
import {
  parsePersistedSession,
  serializeSession,
  type UserSessionPayload,
} from "@core/auth/session-security";
import { localStorageProvider } from "@core/storage/local-storage.provider";
import { companyService } from "@modules/company/services/company.service";
import { usersService } from "@modules/users/services/user.service";
import { applicationService } from "@core/application/application.service";
import { usersOverviewService } from "@modules/users/services/overview.service";
import { themeService } from "@core/config/theme/theme.service";

export type UserSession = UserSessionPayload | null;

const SESSION_KEY = "auth.session";
const TOKEN_KEY = "auth.idToken";

export class UsersAuthService {
  private isSigningOut = false;
  private session$ = new BehaviorSubject<UserSession>(this.loadFromStorage());

  constructor() {
    if (typeof authManager.onSignOut === "function") {
      authManager.onSignOut(() => {
        if (this.isSigningOut) return;
        this.clearCachedData();
      });
    }
  }

  private loadFromStorage(): UserSession {
    const rawSession = localStorageProvider.get(SESSION_KEY);
    const rawToken = localStorageProvider.get(TOKEN_KEY);
    const parsed = parsePersistedSession(rawSession, rawToken);

    if (parsed.shouldClear) {
      localStorageProvider.remove(SESSION_KEY);
      localStorageProvider.remove(TOKEN_KEY);
      return null;
    }

    if (parsed.migratedValue) {
      localStorageProvider.set(SESSION_KEY, parsed.migratedValue);
    }

    return parsed.session;
  }

  private clearCachedData(): void {
    localStorageProvider.remove(SESSION_KEY);
    try {
      usersService.clear();
    } catch {
      // ignore
    }
    try {
      companyService.clear();
    } catch {
      // ignore
    }
    try {
      applicationService.clear();
    } catch {
      // ignore
    }
    try {
      usersOverviewService.clear();
    } catch {
      // ignore
    }

    this.session$.next(null);
    themeService.refreshForCurrentUser();
  }

  getSession$() {
    return this.session$.asObservable();
  }

  getSessionValue(): UserSession {
    return this.session$.getValue();
  }

  async signIn(email: string, password: string): Promise<UserSession> {
    // Authenticate in Firebase (client SDK)
    const { token } = await firebaseAuthService.signInWithEmail(
      email,
      password,
    );

    // Validate token on backend
    const verified = await authApi.verifyToken(token);

    // persist minimal session
    const session: UserSession = {
      uid: verified.uid,
      claims: verified.claims,
      email,
    };
    localStorageProvider.set(SESSION_KEY, serializeSession(session, token));

    // set tokens for http client
    authManager.setTokens(token, null);

    // update subject
    this.session$.next(session);
    themeService.refreshForCurrentUser();

    return session;
  }

  async register(
    name: string | undefined,
    email: string,
    password: string,
  ): Promise<DataValue> {
    // forward to backend register endpoint
    const payload = { name, email, password };
    return authApi.register(payload);
  }

  async requestPasswordReset(email: string): Promise<void> {
    await firebaseAuthService.sendPasswordReset(email);
  }

  async signOut(): Promise<void> {
    this.isSigningOut = true;
    try {
      await firebaseAuthService.signOut();
    } finally {
      this.clearCachedData();
      // clear auth tokens and trigger auth sign-out listeners
      authManager.signOut();
      this.isSigningOut = false;
    }
  }
}

export const usersAuthService = new UsersAuthService();
