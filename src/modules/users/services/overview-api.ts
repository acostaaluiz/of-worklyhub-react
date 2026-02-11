import { BaseHttpService } from "@core/http/base-http.service";
import type { HttpClient } from "@core/http/interfaces/http-client.interface";

export type UserOverviewProfile = {
  name?: string;
  fullName?: string;
  email: string;
  phone?: string | null;
  planId?: number;
  planTitle?: string;
  profilePhotoUrl?: string | null;
  profilePhotoPath?: string | null;
};

export type UserOverviewModule = {
  uid: string;
  name: string;
  description?: string;
  icon?: string;
};

export type UserOverviewResponse = {
  profile: UserOverviewProfile;
  modules: UserOverviewModule[];
};

export class UsersOverviewApi extends BaseHttpService {
  constructor(http: HttpClient) {
    super(http, { correlationNamespace: "users-overview-api" });
  }

  async getOverview(): Promise<UserOverviewResponse> {
    return this.get<UserOverviewResponse>("me/overview");
  }
}

export default UsersOverviewApi;
