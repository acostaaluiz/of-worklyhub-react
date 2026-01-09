import { BaseHttpService } from "@core/http/base-http.service";
import type { HttpClient } from "@core/http/interfaces/http-client.interface";

export type WorkspaceCreatePayload = {
  creatorUid: string;
  accountType: string;
  fullName: string;
  email: string;
  phone?: string;
  tradeName?: string;
  employeesCount?: number;
  industry?: string;
  primaryService?: string;
  description?: string;
  services?: Array<{ name: string; category?: string; description?: string }>;
};

export type WorkspaceModel = {
  id?: string;
  accountType?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  tradeName?: string;
  employeesCount?: number;
  industry?: string;
  primaryService?: string;
  description?: string;
  [key: string]: unknown;
};

export type WorkspaceCreateResponse = WorkspaceModel;

export type WorkspaceGetResponse = { workspace: WorkspaceModel | null };

export class CompaniesApi extends BaseHttpService {
  constructor(http: HttpClient) {
    super(http, { correlationNamespace: "company-api" });
  }

  async createWorkspace(payload: WorkspaceCreatePayload): Promise<WorkspaceCreateResponse> {
    return this.post<WorkspaceCreateResponse, WorkspaceCreatePayload>(
      "/company/internal/workspaces",
      payload
    );
  }

  async getWorkspace(email: string): Promise<WorkspaceGetResponse> {
    return this.get<WorkspaceGetResponse>("/company/internal/workspace", {
      email,
    });
  }

  async listWorkspaceServices(workspaceId: string): Promise<unknown[]> {
    return this.get<unknown[]>(`/company/internal/workspaces/${workspaceId}/services`);
  }

  async createWorkspaceService(workspaceId: string, body: unknown): Promise<unknown> {
    return this.post<unknown, unknown>(`/company/internal/workspaces/${workspaceId}/services`, body);
  }

  async updateWorkspaceService(workspaceId: string, serviceId: string, body: unknown): Promise<unknown> {
    return this.put<unknown, unknown>(`/company/internal/workspaces/${workspaceId}/services/${serviceId}`, body);
  }

  async requestWallpaperSignature(contentType: string, filename: string): Promise<{ url: string; path: string; maxSize?: number } | null> {
    return this.post<{ url: string; path: string; maxSize?: number }, { contentType: string; filename: string }>(
      "/company/internal/company/profile/wallpaper/signature",
      { contentType, filename }
    ).catch(() => null);
  }
}

export default CompaniesApi;
