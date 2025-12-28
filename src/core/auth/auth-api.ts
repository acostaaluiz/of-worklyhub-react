import { BaseHttpService } from "@core/http/base-http.service";
import type { HttpClient } from "@core/http/interfaces/http-client.interface";

export type VerifyTokenResponse = { uid: string; claims: unknown };

export class AuthApi extends BaseHttpService {
  constructor(http: HttpClient) {
    super(http, { correlationNamespace: "auth-api" });
  }

  async verifyToken(token?: string): Promise<VerifyTokenResponse> {
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    return this.post<VerifyTokenResponse>("/auth/internal/verify-token", undefined, headers);
  }

  async register(payload: { name?: string; email: string; password: string }): Promise<unknown> {
    return this.post<unknown>("/auth/internal/register", payload);
  }
}
