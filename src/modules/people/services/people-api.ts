import { BaseHttpService } from "@core/http/base-http.service";
import type { HttpClient } from "@core/http/interfaces/http-client.interface";
import type { HttpQuery } from "@core/http/interfaces/http-client.interface";
import type {
  PeopleWorkspaceSettings,
  PeopleWorkspaceSettingsBundle,
} from "@modules/people/interfaces/people-settings.model";

export type CreateWorkerPayload = {
  workspace_id: string;
  user_email: string;
  user_name: string;
  job_title?: string;
  department?: string;
  access_profile_uid?: string | null;
  employee_code?: string | null;
  hired_at?: string;
  salary_cents?: number;
};

type PeopleSettingsResponse = { data: PeopleWorkspaceSettingsBundle };
type UpsertPeopleSettingsRequest = {
  workspaceId: string;
  settings?: Partial<PeopleWorkspaceSettings>;
  updatedBy?: string | null;
};

export type UpsertWorkerWeeklyAvailabilityPayload = {
  minutesByWeekday: Record<string, number>;
  actorUid?: string;
};

export type CreateWorkerAvailabilityBlockPayload = {
  employeeId: string;
  date: string;
  startTime: string;
  endTime: string;
  reason?: string;
  actorUid?: string;
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

  async getWorkerWeeklyAvailability(workspaceId: string, userUid: string): Promise<DataValue> {
    return this.get<DataValue>(`/people/internal/workspaces/${workspaceId}/workers/${userUid}/weekly-availability`);
  }

  async upsertWorkerWeeklyAvailability(
    workspaceId: string,
    userUid: string,
    payload: UpsertWorkerWeeklyAvailabilityPayload
  ): Promise<DataValue> {
    return this.put<DataValue, UpsertWorkerWeeklyAvailabilityPayload>(
      `/people/internal/workspaces/${workspaceId}/workers/${userUid}/weekly-availability`,
      payload
    );
  }

  async listAvailabilityBlocks(workspaceId: string, query?: HttpQuery): Promise<DataValue> {
    return this.get<DataValue>(`/people/internal/workspaces/${workspaceId}/availability-blocks`, query);
  }

  async createAvailabilityBlock(
    workspaceId: string,
    payload: CreateWorkerAvailabilityBlockPayload
  ): Promise<DataValue> {
    return this.post<DataValue, CreateWorkerAvailabilityBlockPayload>(
      `/people/internal/workspaces/${workspaceId}/availability-blocks`,
      payload
    );
  }

  async deleteAvailabilityBlock(
    workspaceId: string,
    blockId: string,
    query?: HttpQuery
  ): Promise<DataValue> {
    return this.delete<DataValue>(`/people/internal/workspaces/${workspaceId}/availability-blocks/${blockId}`, query);
  }

  async getWorkforceCapacity(workspaceId: string, weekStart?: string): Promise<DataValue> {
    return this.get<DataValue>(
      `/people/internal/workspaces/${workspaceId}/workforce-capacity`,
      weekStart ? { weekStart } : undefined
    );
  }

  async getSettings(workspaceId: string): Promise<PeopleWorkspaceSettingsBundle> {
    const headers = {
      "x-workspace-id": workspaceId,
    };
    const res = await this.get<PeopleSettingsResponse>(
      "/people/internal/settings",
      { workspaceId },
      headers
    );
    return res?.data as PeopleWorkspaceSettingsBundle;
  }

  async upsertSettings(
    payload: UpsertPeopleSettingsRequest
  ): Promise<PeopleWorkspaceSettingsBundle> {
    const headers = {
      "x-workspace-id": payload.workspaceId,
    };
    const res = await this.put<PeopleSettingsResponse, UpsertPeopleSettingsRequest>(
      "/people/internal/settings",
      payload,
      headers
    );
    return res?.data as PeopleWorkspaceSettingsBundle;
  }
}

export default PeopleApi;
