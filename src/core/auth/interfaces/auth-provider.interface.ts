export type RefreshResult = { accessToken: string; refreshToken?: string } | null;

export interface AuthProvider {
  getAccessToken(): string | null;
  getRefreshToken?(): string | null;
  refresh?(): Promise<string | null>;
  setTokens?(accessToken: string | null, refreshToken?: string | null): void;
  signOut?(): void;
}

export type RefreshHandler = (refreshToken?: string | null) => Promise<RefreshResult>;
