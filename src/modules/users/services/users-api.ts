import { BaseHttpService } from "@core/http/base-http.service";
import type { HttpClient } from "@core/http/interfaces/http-client.interface";

export type UserProfileResponse = { name: string; email: string };

export class UsersApi extends BaseHttpService {
  constructor(http: HttpClient) {
    super(http, { correlationNamespace: "users-api" });
  }

  async getByEmail(email: string): Promise<UserProfileResponse> {
    return await this.get<UserProfileResponse>("users/internal/users", { email });
  }
}
