import type {
  AuthProvider,
  RefreshHandler,
  RefreshResult,
} from "./interfaces/auth-provider.interface";

export class AuthManager implements AuthProvider {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private refreshHandler?: RefreshHandler;
  private signOutListeners = new Set<() => void>();

  constructor(options?: { refreshHandler?: RefreshHandler }) {
    this.refreshHandler = options?.refreshHandler;
  }

  public setRefreshHandler(handler?: RefreshHandler) {
    this.refreshHandler = handler;
  }

  public onSignOut(listener: () => void): () => void {
    this.signOutListeners.add(listener);
    return () => this.signOutListeners.delete(listener);
  }

  public getAccessToken(): string | null {
    return this.accessToken;
  }

  public getRefreshToken(): string | null {
    return this.refreshToken;
  }

  public setTokens(
    accessToken: string | null,
    refreshToken?: string | null,
  ): void {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken ?? null;
  }

  public async refresh(): Promise<string | null> {
    if (!this.refreshHandler) return null;
    const result: RefreshResult = await this.refreshHandler(this.refreshToken);
    if (result && result.accessToken) {
      this.setTokens(
        result.accessToken,
        result.refreshToken ?? this.refreshToken,
      );
      return result.accessToken;
    }
    return null;
  }

  public signOut(): void {
    this.setTokens(null, null);
    this.signOutListeners.forEach((listener) => {
      try {
        listener();
      } catch {
        // ignore listener failures
      }
    });
  }
}

export const authManager = new AuthManager();
