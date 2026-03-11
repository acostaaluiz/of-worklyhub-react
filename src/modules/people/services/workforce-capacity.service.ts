import { toAppError } from "@core/errors/to-app-error";
import { httpClient } from "@core/http/client.instance";
import type { HttpQuery } from "@core/http/interfaces/http-client.interface";
import type { EmployeeModel } from "@modules/people/interfaces/employee.model";
import type {
  CreateEmployeeAvailabilityBlockInput,
  EmployeeAvailabilityBlock,
  EmployeeCapacityDay,
  EmployeeCapacityRow,
  EmployeeWeeklyAvailability,
  UpsertEmployeeWeeklyAvailabilityInput,
  WeeklyAvailabilityMinutes,
  WorkforceCapacitySnapshot,
} from "@modules/people/interfaces/workforce-capacity.model";
import {
  PeopleApi,
  type CreateWorkerAvailabilityBlockPayload,
  type UpsertWorkerWeeklyAvailabilityPayload,
} from "@modules/people/services/people-api";
import { usersAuthService } from "@modules/users/services/auth.service";

type GenericRecord = Record<string, unknown>;

type CapacityQuery = {
  workspaceId: string;
  employees: EmployeeModel[];
  weekStart: string;
};

type BlockQuery = {
  from?: string;
  to?: string;
  employeeId?: string;
};

export const DEFAULT_WEEKLY_AVAILABILITY: WeeklyAvailabilityMinutes = {
  "0": 0,
  "1": 480,
  "2": 480,
  "3": 480,
  "4": 480,
  "5": 480,
  "6": 0,
};

function nowIso(): string {
  return new Date().toISOString();
}

function sanitizeMinutes(value: unknown): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.round(parsed);
}

function toRoundedPercent(value: number): number {
  return Math.round(value * 100) / 100;
}

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

function parseTimeToMinutes(value: string): number | null {
  const match = /^(\d{2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return hours * 60 + minutes;
}

function normalizeDateKey(value?: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  const direct = /^(\d{4})-(\d{2})-(\d{2})/.exec(trimmed);
  if (direct) {
    return `${direct[1]}-${direct[2]}-${direct[3]}`;
  }

  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

function parseDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split("-").map((part) => Number(part));
  return new Date(Date.UTC(year, month - 1, day));
}

function dateKeyFromDate(date: Date): string {
  return `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}-${pad2(date.getUTCDate())}`;
}

function normalizeAvailabilityInput(input?: WeeklyAvailabilityMinutes): WeeklyAvailabilityMinutes {
  const out: WeeklyAvailabilityMinutes = {};
  for (let day = 0; day <= 6; day += 1) {
    const key = String(day);
    const value = input && Object.prototype.hasOwnProperty.call(input, key)
      ? input[key]
      : DEFAULT_WEEKLY_AVAILABILITY[key];
    out[key] = sanitizeMinutes(value);
  }
  return out;
}

function formatEmployeeName(employee: EmployeeModel): string {
  const name = `${employee.firstName ?? ""} ${employee.lastName ?? ""}`.trim();
  if (name.length > 0) return name;
  if (employee.email) return employee.email;
  return employee.id;
}

function toRecord(value: unknown): GenericRecord | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as GenericRecord;
}

function toStringValue(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

function toNumberValue(value: unknown): number | undefined {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function toBooleanValue(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

function extractMinutesByWeekday(value: unknown): WeeklyAvailabilityMinutes {
  const record = toRecord(value);
  if (!record) return normalizeAvailabilityInput();

  const minutesByWeekday: WeeklyAvailabilityMinutes = {};
  for (let day = 0; day <= 6; day += 1) {
    const key = String(day);
    minutesByWeekday[key] = sanitizeMinutes(record[key]);
  }
  return normalizeAvailabilityInput(minutesByWeekday);
}

function normalizeTimeOrNull(value: unknown): string | null {
  const text = toStringValue(value);
  if (!text) return null;
  const minutes = parseTimeToMinutes(text);
  if (minutes === null) return null;
  return `${pad2(Math.floor(minutes / 60))}:${pad2(minutes % 60)}`;
}

function mapBlock(value: unknown, workspaceId: string): EmployeeAvailabilityBlock | null {
  const record = toRecord(value);
  if (!record) return null;

  const id = toStringValue(record.id);
  const employeeId = toStringValue(record.employeeId) ?? toStringValue(record.userUid) ?? toStringValue(record.user_uid);
  const date = normalizeDateKey(toStringValue(record.date) ?? toStringValue(record.blockDate) ?? toStringValue(record.block_date));
  const startTime = normalizeTimeOrNull(record.startTime ?? record.start_time);
  const endTime = normalizeTimeOrNull(record.endTime ?? record.end_time);

  if (!id || !employeeId || !date || !startTime || !endTime) return null;

  return {
    id,
    workspaceId: toStringValue(record.workspaceId) ?? toStringValue(record.workspace_id) ?? workspaceId,
    employeeId,
    date,
    startTime,
    endTime,
    reason: toStringValue(record.reason),
    createdAt: toStringValue(record.createdAt) ?? toStringValue(record.created_at) ?? nowIso(),
    updatedAt: toStringValue(record.updatedAt) ?? toStringValue(record.updated_at) ?? nowIso(),
  };
}

function mapDailyRow(value: unknown): EmployeeCapacityDay | null {
  const record = toRecord(value);
  if (!record) return null;

  const date = normalizeDateKey(toStringValue(record.date));
  if (!date) return null;

  const availabilityMinutes = sanitizeMinutes(record.availabilityMinutes);
  const blockedMinutes = sanitizeMinutes(record.blockedMinutes);
  const scheduledMinutes = sanitizeMinutes(record.scheduledMinutes);
  const workOrderMinutes = sanitizeMinutes(record.workOrderMinutes);
  const productiveMinutes = sanitizeMinutes(record.productiveMinutes);
  const plannedMinutes = sanitizeMinutes(
    record.plannedMinutes ?? (scheduledMinutes + workOrderMinutes)
  );
  const overloadMinutes = sanitizeMinutes(
    record.overloadMinutes ?? Math.max(0, plannedMinutes - availabilityMinutes)
  );
  const weekday = sanitizeMinutes(record.weekday);
  const isOverallocated = toBooleanValue(record.isOverallocated) ?? overloadMinutes > 0;

  return {
    date,
    weekday,
    availabilityMinutes,
    blockedMinutes,
    scheduledMinutes,
    workOrderMinutes,
    productiveMinutes,
    plannedMinutes,
    overloadMinutes,
    isOverallocated,
  };
}

function computeSummary(rows: EmployeeCapacityRow[]) {
  const employeeCount = rows.length;
  const totalAvailabilityMinutes = rows.reduce((sum, row) => sum + row.totalAvailabilityMinutes, 0);
  const totalBlockedMinutes = rows.reduce((sum, row) => sum + row.totalBlockedMinutes, 0);
  const totalScheduledMinutes = rows.reduce((sum, row) => sum + row.totalScheduledMinutes, 0);
  const totalWorkOrderMinutes = rows.reduce((sum, row) => sum + row.totalWorkOrderMinutes, 0);
  const totalPlannedMinutes = rows.reduce((sum, row) => sum + row.totalPlannedMinutes, 0);
  const totalProductiveMinutes = rows.reduce((sum, row) => sum + row.totalProductiveMinutes, 0);
  const totalOverloadMinutes = rows.reduce((sum, row) => sum + row.totalOverloadMinutes, 0);
  const conflictSlots = rows.reduce((sum, row) => sum + row.conflictDays, 0);
  const denominator = Math.max(employeeCount * 7, 1);
  const conflictRatePercent = toRoundedPercent((conflictSlots / denominator) * 100);

  return {
    employeeCount,
    totalAvailabilityMinutes,
    totalBlockedMinutes,
    totalScheduledMinutes,
    totalWorkOrderMinutes,
    totalPlannedMinutes,
    totalProductiveMinutes,
    totalOverloadMinutes,
    conflictSlots,
    conflictRatePercent,
  };
}

export function getWeekStartDate(input?: string | Date): string {
  const date = input instanceof Date
    ? new Date(input.getTime())
    : input
      ? new Date(input)
      : new Date();

  if (Number.isNaN(date.getTime())) {
    const fallback = new Date();
    return getWeekStartDate(fallback);
  }

  const utc = new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate()
  ));
  const weekDay = utc.getUTCDay();
  const diffToMonday = weekDay === 0 ? -6 : 1 - weekDay;
  utc.setUTCDate(utc.getUTCDate() + diffToMonday);

  return dateKeyFromDate(utc);
}

export function getWeekDates(weekStart: string): string[] {
  const normalizedWeekStart = normalizeDateKey(weekStart) ?? getWeekStartDate();
  const start = parseDateKey(normalizedWeekStart);
  const out: string[] = [];
  for (let index = 0; index < 7; index += 1) {
    const current = new Date(start.getTime());
    current.setUTCDate(start.getUTCDate() + index);
    out.push(dateKeyFromDate(current));
  }
  return out;
}

export class WorkforceCapacityService {
  private readonly api = new PeopleApi(httpClient);

  private getActorUid(): string | undefined {
    return usersAuthService.getSessionValue()?.uid ?? undefined;
  }

  async getWeeklyAvailability(workspaceId: string, employeeId: string): Promise<EmployeeWeeklyAvailability> {
    try {
      const response = await this.api.getWorkerWeeklyAvailability(workspaceId, employeeId);
      const root = toRecord(response);
      const source = toRecord(root?.availability) ?? root ?? {};

      return {
        employeeId:
          toStringValue(source.employeeId) ??
          toStringValue(source.userUid) ??
          toStringValue(source.user_uid) ??
          employeeId,
        minutesByWeekday: extractMinutesByWeekday(
          source.minutesByWeekday ?? source.minutes_by_weekday
        ),
        updatedAt: toStringValue(source.updatedAt) ?? toStringValue(source.updated_at) ?? nowIso(),
      };
    } catch (err) {
      throw toAppError(err);
    }
  }

  async saveWeeklyAvailability(
    workspaceId: string,
    input: UpsertEmployeeWeeklyAvailabilityInput
  ): Promise<EmployeeWeeklyAvailability> {
    try {
      const payload: UpsertWorkerWeeklyAvailabilityPayload = {
        minutesByWeekday: normalizeAvailabilityInput(input.minutesByWeekday),
        actorUid: this.getActorUid(),
      };

      const response = await this.api.upsertWorkerWeeklyAvailability(workspaceId, input.employeeId, payload);
      const root = toRecord(response);
      const source = toRecord(root?.availability) ?? root ?? {};

      return {
        employeeId:
          toStringValue(source.employeeId) ??
          toStringValue(source.userUid) ??
          toStringValue(source.user_uid) ??
          input.employeeId,
        minutesByWeekday: extractMinutesByWeekday(
          source.minutesByWeekday ?? source.minutes_by_weekday
        ),
        updatedAt: toStringValue(source.updatedAt) ?? toStringValue(source.updated_at) ?? nowIso(),
      };
    } catch (err) {
      throw toAppError(err);
    }
  }

  async listBlocks(workspaceId: string, query: BlockQuery = {}): Promise<EmployeeAvailabilityBlock[]> {
    try {
      const params: HttpQuery = {};
      const from = normalizeDateKey(query.from);
      const to = normalizeDateKey(query.to);
      const employeeId = query.employeeId?.trim() || undefined;

      if (from) params.from = from;
      if (to) params.to = to;
      if (employeeId) params.employeeId = employeeId;

      const response = await this.api.listAvailabilityBlocks(workspaceId, params);
      const root = toRecord(response);
      const rawBlocks = Array.isArray(root?.blocks) ? root.blocks : [];

      return rawBlocks
        .map((row) => mapBlock(row, workspaceId))
        .filter((row): row is EmployeeAvailabilityBlock => Boolean(row));
    } catch (err) {
      throw toAppError(err);
    }
  }

  async createBlock(
    workspaceId: string,
    input: CreateEmployeeAvailabilityBlockInput
  ): Promise<EmployeeAvailabilityBlock> {
    const employeeId = input.employeeId?.trim();
    const date = normalizeDateKey(input.date);
    const startTime = normalizeTimeOrNull(input.startTime);
    const endTime = normalizeTimeOrNull(input.endTime);

    if (!employeeId) throw new Error("employeeId is required");
    if (!date) throw new Error("date is required");
    if (!startTime || !endTime) throw new Error("Invalid block time");

    const startMinutes = parseTimeToMinutes(startTime);
    const endMinutes = parseTimeToMinutes(endTime);
    if (startMinutes === null || endMinutes === null || endMinutes <= startMinutes) {
      throw new Error("Block end time must be after start time");
    }

    try {
      const payload: CreateWorkerAvailabilityBlockPayload = {
        employeeId,
        date,
        startTime,
        endTime,
        reason: input.reason?.trim() || undefined,
        actorUid: this.getActorUid(),
      };

      const response = await this.api.createAvailabilityBlock(workspaceId, payload);
      const root = toRecord(response);
      const block = mapBlock(root?.block ?? root, workspaceId);
      if (!block) throw new Error("Invalid block response");
      return block;
    } catch (err) {
      throw toAppError(err);
    }
  }

  async deleteBlock(workspaceId: string, blockId: string): Promise<void> {
    const normalizedId = blockId.trim();
    if (!normalizedId) return;

    try {
      const actorUid = this.getActorUid();
      await this.api.deleteAvailabilityBlock(
        workspaceId,
        normalizedId,
        actorUid ? { actorUid } : undefined
      );
    } catch (err) {
      throw toAppError(err);
    }
  }

  async getSnapshot(query: CapacityQuery): Promise<WorkforceCapacitySnapshot> {
    const normalizedWeekStart = getWeekStartDate(query.weekStart);

    try {
      const response = await this.api.getWorkforceCapacity(query.workspaceId, normalizedWeekStart);
      const root = toRecord(response) ?? {};
      const weekStart = normalizeDateKey(toStringValue(root.weekStart)) ?? normalizedWeekStart;
      const weekDates = getWeekDates(weekStart);
      const weekEnd = normalizeDateKey(toStringValue(root.weekEnd)) ?? weekDates[6];

      const employeeNameMap = new Map<string, string>();
      const activeEmployeeIds = new Set<string>();
      for (const employee of query.employees ?? []) {
        const employeeId = employee.id?.trim();
        if (!employeeId) continue;
        employeeNameMap.set(employeeId, formatEmployeeName(employee));
        if (employee.active) activeEmployeeIds.add(employeeId);
      }

      const rowsRaw = Array.isArray(root.rows) ? root.rows : [];
      const rows: EmployeeCapacityRow[] = rowsRaw
        .map((value) => {
          const record = toRecord(value);
          if (!record) return null;

          const employeeId =
            toStringValue(record.employeeId) ??
            toStringValue(record.userUid) ??
            toStringValue(record.user_uid) ??
            toStringValue(record.id);
          if (!employeeId) return null;

          const weeklyAvailability = extractMinutesByWeekday(
            record.weeklyAvailabilityMinutesByWeekday ??
            record.minutesByWeekday ??
            record.minutes_by_weekday
          );

          const dailyRaw = Array.isArray(record.daily) ? record.daily : [];
          const dailyMapped = dailyRaw
            .map((day) => mapDailyRow(day))
            .filter((day): day is EmployeeCapacityDay => Boolean(day));
          const dailyByDate = new Map(dailyMapped.map((day) => [day.date, day]));

          const daily: EmployeeCapacityDay[] = weekDates.map((date) => {
            const existing = dailyByDate.get(date);
            if (existing) {
              const weekday = parseDateKey(date).getUTCDay();
              return {
                ...existing,
                date,
                weekday,
              };
            }

            const weekday = parseDateKey(date).getUTCDay();
            const availabilityMinutes = sanitizeMinutes(weeklyAvailability[String(weekday)]);
            return {
              date,
              weekday,
              availabilityMinutes,
              blockedMinutes: 0,
              scheduledMinutes: 0,
              workOrderMinutes: 0,
              productiveMinutes: 0,
              plannedMinutes: 0,
              overloadMinutes: 0,
              isOverallocated: false,
            };
          });

          const totalAvailabilityMinutes = toNumberValue(record.totalAvailabilityMinutes)
            ?? daily.reduce((sum, day) => sum + day.availabilityMinutes, 0);
          const totalBlockedMinutes = toNumberValue(record.totalBlockedMinutes)
            ?? daily.reduce((sum, day) => sum + day.blockedMinutes, 0);
          const totalScheduledMinutes = toNumberValue(record.totalScheduledMinutes)
            ?? daily.reduce((sum, day) => sum + day.scheduledMinutes, 0);
          const totalWorkOrderMinutes = toNumberValue(record.totalWorkOrderMinutes)
            ?? daily.reduce((sum, day) => sum + day.workOrderMinutes, 0);
          const totalPlannedMinutes = toNumberValue(record.totalPlannedMinutes)
            ?? daily.reduce((sum, day) => sum + day.plannedMinutes, 0);
          const totalProductiveMinutes = toNumberValue(record.totalProductiveMinutes)
            ?? daily.reduce((sum, day) => sum + day.productiveMinutes, 0);
          const totalOverloadMinutes = toNumberValue(record.totalOverloadMinutes)
            ?? daily.reduce((sum, day) => sum + day.overloadMinutes, 0);
          const conflictDays = toNumberValue(record.conflictDays)
            ?? daily.filter((day) => day.isOverallocated).length;
          const utilizationPercent = toNumberValue(record.utilizationPercent)
            ?? (totalAvailabilityMinutes > 0 ? toRoundedPercent((totalPlannedMinutes / totalAvailabilityMinutes) * 100) : 0);

          return {
            employeeId,
            employeeName: employeeNameMap.get(employeeId)
              ?? toStringValue(record.employeeName)
              ?? employeeId,
            weeklyAvailabilityMinutesByWeekday: weeklyAvailability,
            daily,
            totalAvailabilityMinutes,
            totalBlockedMinutes,
            totalScheduledMinutes,
            totalWorkOrderMinutes,
            totalPlannedMinutes,
            totalProductiveMinutes,
            totalOverloadMinutes,
            utilizationPercent,
            conflictDays,
          };
        })
        .filter((row): row is EmployeeCapacityRow => Boolean(row))
        .filter((row) => activeEmployeeIds.size === 0 || activeEmployeeIds.has(row.employeeId))
        .sort((left, right) => {
          if (left.totalOverloadMinutes !== right.totalOverloadMinutes) {
            return right.totalOverloadMinutes - left.totalOverloadMinutes;
          }
          return left.employeeName.localeCompare(right.employeeName);
        });

      const blocksRaw = Array.isArray(root.blocks) ? root.blocks : [];
      const blocks = blocksRaw
        .map((row) => mapBlock(row, query.workspaceId))
        .filter((row): row is EmployeeAvailabilityBlock => Boolean(row))
        .filter((row) => activeEmployeeIds.size === 0 || activeEmployeeIds.has(row.employeeId));

      return {
        weekStart,
        weekEnd,
        rows,
        blocks,
        summary: computeSummary(rows),
      };
    } catch (err) {
      throw toAppError(err);
    }
  }
}

export const workforceCapacityService = new WorkforceCapacityService();

export default workforceCapacityService;
