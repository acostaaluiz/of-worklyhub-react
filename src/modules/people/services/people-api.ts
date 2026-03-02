import { BaseHttpService } from "@core/http/base-http.service";
import type { HttpClient } from "@core/http/interfaces/http-client.interface";

export type CreateWorkerPayload = {
  workspace_id: string;
  user_email: string;
  user_name: string;
  job_title?: string;
  department?: string;
  employee_code?: string | null;
  hired_at?: string;
  salary_cents?: number;
};

export class PeopleApi extends BaseHttpService {
  constructor(http: HttpClient) {
    super(http, { correlationNamespace: "people-api" });
  }

  async createWorker(payload: CreateWorkerPayload): Promise<DataValue> {
    return this.post<DataValue, CreateWorkerPayload>("/people/workers", payload);
  }

  async updateWorker(workspaceId: string, userUid: string, body: DataValue): Promise<DataValue> {
    return this.put<DataValue, DataValue>(`/people/workers/${workspaceId}/${userUid}`, body);
  }

  async listWorkspaceWorkers(workspaceId: string): Promise<DataValue[]> {
    return this.get<DataValue[]>(`/people/internal/workspaces/${workspaceId}/workers`);
  }
}

export default PeopleApi;
