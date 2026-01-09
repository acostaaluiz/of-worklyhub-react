import { BaseHttpService } from "@core/http/base-http.service";
import type { HttpClient } from "@core/http/interfaces/http-client.interface";

export type UserProfileResponse = {
  name: string;
  email: string;
  planId?: number;
  phone?: string;
  photoUrl?: string;
};

export class UsersApi extends BaseHttpService {
  constructor(http: HttpClient) {
    super(http, { correlationNamespace: "users-api" });
  }

  async getByEmail(email: string): Promise<UserProfileResponse> {
    return await this.get<UserProfileResponse>("users/internal/users", { email });
  }

  async setPlan(email: string, planId: number): Promise<void> {
    // endpoint returns 204 No Content on success
    await this.post<void, { email: string; planId: number }>("users/internal/users/plan", { email, planId });
  }

  async requestProfilePhotoSignature(body: { contentType: string; filename?: string }) {
    return await this.post<{ url: string; path: string; expiresAt: string; maxSize: number }, { contentType: string; filename?: string }>(
      "users/internal/users/profile/photo/signature",
      body
    );
  }
}
