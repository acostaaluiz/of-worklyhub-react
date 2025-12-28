import type { RefreshResult } from "@core/auth/interfaces/auth-provider.interface";
import { firebaseAuth } from "./firebase";
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type UserCredential,
} from "firebase/auth";
import { localStorageProvider } from "@core/storage/local-storage.provider";

const TOKEN_KEY = "auth.idToken";
const SESSION_KEY = "auth.session";

export class FirebaseAuthService {
  private currentToken: string | null = null;

  async signInWithEmail(email: string, password: string) {
    const cred: UserCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
    const user = cred.user;
    const token = await user.getIdToken(false);
    this.setToken(token);
    return { token, user };
  }

  async getToken(): Promise<string | null> {
    const user = firebaseAuth.currentUser;
    if (!user) return this.currentToken;
    const t = await user.getIdToken(false);
    this.setToken(t);
    return t;
  }

  getAccessToken(): string | null {
    return this.currentToken;
  }

  setToken(token: string | null) {
    this.currentToken = token;
    if (token) {
      localStorageProvider.set(TOKEN_KEY, token);
    } else {
      localStorageProvider.remove(TOKEN_KEY);
      localStorageProvider.remove(SESSION_KEY);
    }
  }

  async refresh(): Promise<string | null> {
    const user = firebaseAuth.currentUser;
    if (!user) return null;
    try {
      const token = await user.getIdToken(true);
      this.setToken(token);
      return token;
    } catch {
      this.setToken(null);
      return null;
    }
  }

  async signOut(): Promise<void> {
    try {
      await firebaseSignOut(firebaseAuth);
    } finally {
      this.setToken(null);
    }
  }

  // restore token if present in storage (called on app init)
  restoreFromStorage(): void {
    const t = localStorageProvider.get(TOKEN_KEY);
    if (t) this.currentToken = t;
  }

  // expose refresh handler compatible with AuthManager
  getRefreshHandler(): (refreshToken?: string | null) => Promise<RefreshResult> {
    return async () => {
      const t = await this.refresh();
      if (t) return { accessToken: t };
      return null;
    };
  }
}

export const firebaseAuthService = new FirebaseAuthService();
