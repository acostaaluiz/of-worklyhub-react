import { BaseHttpService } from "@core/http/base-http.service";
import type { HttpClient } from "@core/http/interfaces/http-client.interface";
import type { HttpQuery } from "@core/http/interfaces/http-client.interface";

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
  inventoryInputs?: Array<{ itemId: string; quantity?: number }>;
  inventoryOutputs?: Array<{ itemId: string; quantity?: number }>;
  // optional status id for updates
  statusId?: string | null;
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
  inventoryInputs?: Array<{ itemId: string; quantity?: number }> | null;
  inventoryOutputs?: Array<{ itemId: string; quantity?: number }> | null;
  status?: { id?: string; code?: string; label?: string } | null;
  createdAt?: string;
  updatedAt?: string;
};

export type ScheduleListResponse = { data: ScheduleServiceItem[] };
export type MonthViewOverflowDay = {
  date: string;
  totalEvents: number;
  hiddenEvents: number;
};

export type MonthViewHint = {
  shouldSuggestDayWeekView: boolean;
  totalHiddenEvents: number;
  overloadedDays: number;
  visiblePerDay: number;
  suggestedViews: Array<"week" | "day">;
  title: string;
  message: string;
  dayOverflows: MonthViewOverflowDay[];
};

export type ScheduleListMeta = {
  monthViewHint?: MonthViewHint | null;
};

export type ScheduleListResponseWithMeta = {
  data: ScheduleServiceItem[];
  meta?: ScheduleListMeta;
};

export type ScheduleStatus = { id: string; code: string; label: string };
export type ScheduleStatusesResponse = { data: ScheduleStatus[] };

export type NextScheduleItem = ScheduleServiceItem & {
  startsInMinutes: number;
  startsIn: string;
};

export type NextSchedulesResponse = { data: NextScheduleItem[] };
export type ListSchedulesQuery = {
  from?: string;
  to?: string;
  calendarView?: "month" | "week" | "day";
  includeViewHint?: boolean;
  monthCellVisibleLimit?: number;
  monthViewTimeZone?: string;
};

export class SchedulesApi extends BaseHttpService {
  constructor(http: HttpClient) {
    super(http, { correlationNamespace: "schedules-api" });
  }

  async createSchedule(body: CreateSchedulePayload): Promise<DataValue> {
    return this.post<DataValue, CreateSchedulePayload>(
      "/schedule/internal/schedules",
      body
    );
  }

  async deleteSchedule(id: string): Promise<void> {
    await this.delete<void>(`/schedule/internal/schedules/${id}`);
  }

  async updateSchedule(
    id: string,
    body: Partial<CreateSchedulePayload>
  ): Promise<ScheduleServiceItem | DataValue> {
    const res = await this.patch<DataValue, Partial<CreateSchedulePayload>>(
      `/schedule/internal/schedules/${id}`,
      body
    );
    return res;
  }

  async listSchedulesWithMeta(
    workspaceId: string,
    query?: ListSchedulesQuery
  ): Promise<ScheduleListResponseWithMeta> {
    const q: HttpQuery = { workspaceId };
    if (query?.from) q.from = query.from;
    if (query?.to) q.to = query.to;
    if (query?.calendarView) q.calendarView = query.calendarView;
    if (typeof query?.includeViewHint === "boolean") {
      q.includeViewHint = query.includeViewHint;
    }
    if (
      typeof query?.monthCellVisibleLimit === "number" &&
      Number.isFinite(query.monthCellVisibleLimit)
    ) {
      q.monthCellVisibleLimit = query.monthCellVisibleLimit;
    }
    if (query?.monthViewTimeZone) q.monthViewTimeZone = query.monthViewTimeZone;

    const res = await this.get<ScheduleListResponseWithMeta>(
      "/schedule/internal/schedules",
      q
    );
    return { data: res?.data ?? [], meta: res?.meta };
  }

  async listSchedules(
    workspaceId: string,
    query?: ListSchedulesQuery
  ): Promise<ScheduleServiceItem[]> {
    const res = await this.listSchedulesWithMeta(workspaceId, query);
    return res?.data ?? [];
  }

  async nextSchedules(workspaceId: string, limit?: number): Promise<NextScheduleItem[]> {
    const q: HttpQuery = { workspaceId };
    if (typeof limit === 'number') q.limit = limit;
    const res = await this.get<NextSchedulesResponse>('/schedule/internal/schedules/next', q);
    return res?.data ?? [];
  }

  async todaySchedules(workspaceId: string): Promise<ScheduleServiceItem[]> {
    const q: HttpQuery = { workspaceId };
    const res = await this.get<ScheduleListResponse>('/schedule/internal/schedules/today', q);
    return res?.data ?? [];
  }

  async getStatuses(): Promise<ScheduleStatus[]> {
    const res = await this.get<ScheduleStatusesResponse>('/schedule/internal/statuses');
    return res?.data ?? [];
  }
}

export default SchedulesApi;
