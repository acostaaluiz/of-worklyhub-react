import { BaseHttpService } from "@core/http/base-http.service";
import type { HttpClient } from "@core/http/interfaces/http-client.interface";

export type CreateSchedulePayload = {
  start: string; // ISO
  end: string; // ISO
  scheduleId?: string | null;
  workspaceId?: string | null;
  resourceId?: string | null;
  clientId?: string | null;
  durationMinutes?: number | null;
  title?: string | null;
  description?: string | null;
  services?: Array<{ serviceId: string; quantity?: number; priceCents?: number }>;
  workers?: Array<{ workspaceId?: string | null; userUid: string }>;
};

export type ScheduleServiceItem = {
  id: string;
  scheduleId?: string | null;
  workspaceId?: string | null;
  resourceId?: string | null;
  clientId?: string | null;
  start: string; // ISO
  end: string; // ISO
  durationMinutes?: number | null;
  title?: string | null;
  description?: string | null;
  services?: Array<{ serviceId: string; quantity?: number; priceCents?: number }>;
  workers?: Array<{ workspaceId?: string | null; userUid: string; email?: string; fullName?: string }>; 
  status?: { id?: string; code?: string; label?: string } | null;
  createdAt?: string;
  updatedAt?: string;
};

export type ScheduleListResponse = { data: ScheduleServiceItem[] };

export class SchedulesApi extends BaseHttpService {
  constructor(http: HttpClient) {
    super(http, { correlationNamespace: "schedules-api" });
  }

  async createSchedule(body: CreateSchedulePayload): Promise<unknown> {
    return this.post<unknown, CreateSchedulePayload>("/schedule/internal/schedules", body);
  }

  async deleteSchedule(id: string): Promise<void> {
    await this.delete<void>(`/schedule/internal/schedules/${id}`);
  }

  async listSchedules(workspaceId: string, query?: { from?: string; to?: string }): Promise<ScheduleServiceItem[]> {
    const q: Record<string, unknown> = { workspaceId };
    if (query?.from) q.from = query.from;
    if (query?.to) q.to = query.to;
    const res = await this.get<ScheduleListResponse>('/schedule/internal/schedules', q);
    return res?.data ?? [];
  }
}

export default SchedulesApi;
