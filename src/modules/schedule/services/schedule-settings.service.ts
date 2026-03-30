import { toAppError } from "@core/errors/to-app-error";
import { localStorageProvider } from "@core/storage/local-storage.provider";
import { httpClient } from "@core/http/client.instance";
import type {
  ScheduleConfirmationPolicy,
  ScheduleNoShowPolicy,
  ScheduleWorkspaceSettings,
  ScheduleWorkspaceSettingsBundle,
} from "@modules/schedule/interfaces/schedule-settings.model";
import { SchedulesApi } from "./schedules-api";

const STORAGE_KEY_PREFIX = "schedule.workspace-settings.";

export const DEFAULT_SCHEDULE_SETTINGS: ScheduleWorkspaceSettings = {
  defaultDurationMinutes: 30,
  defaultDayPart: "morning",
  defaultCategoryId: null,
  statusColorOverrides: {},
  requireDescription: false,
  requireService: false,
  requireEmployee: false,
  autoSelectFirstService: false,
  autoSelectFirstEmployee: false,
  enableInventoryTracking: true,
  confirmationPolicy: "required",
  reminderEnabled: true,
  reminderLeadMinutes: 120,
  noShowPolicy: "none",
  noShowFeePercent: 0,
};

function toStorageKey(workspaceId: string): string {
  return `${STORAGE_KEY_PREFIX}${workspaceId}`;
}

function normalizeCategoryId(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function clampInteger(
  value: unknown,
  min: number,
  max: number,
  fallback: number
): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  const rounded = Math.round(parsed);
  if (rounded < min) return min;
  if (rounded > max) return max;
  return rounded;
}

function normalizeDayPart(value: unknown): ScheduleWorkspaceSettings["defaultDayPart"] {
  if (value === "morning" || value === "afternoon" || value === "evening") {
    return value;
  }
  return DEFAULT_SCHEDULE_SETTINGS.defaultDayPart;
}

function normalizeConfirmationPolicy(value: unknown): ScheduleConfirmationPolicy {
  if (value === "required" || value === "optional") return value;
  return DEFAULT_SCHEDULE_SETTINGS.confirmationPolicy;
}

function normalizeNoShowPolicy(value: unknown): ScheduleNoShowPolicy {
  if (value === "none" || value === "flag" || value === "charge") return value;
  return DEFAULT_SCHEDULE_SETTINGS.noShowPolicy;
}

function normalizeStatusCode(value: string): string {
  return value
    .trim()
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .replace(/[^a-zA-Z0-9_]+/g, "_")
    .toLowerCase();
}

function normalizeHexColor(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  if (!/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(normalized)) {
    return null;
  }
  return normalized.toUpperCase();
}

function normalizeStatusColorOverrides(
  value: unknown
): Record<string, string> {
  if (!value || typeof value !== "object") return {};

  const source = value as Record<string, unknown>;
  const out: Record<string, string> = {};
  for (const [rawKey, rawValue] of Object.entries(source)) {
    const key = normalizeStatusCode(rawKey);
    if (!key) continue;
    const color = normalizeHexColor(rawValue);
    if (!color) continue;
    out[key] = color;
  }
  return out;
}

function normalizeSettings(
  value?: Partial<ScheduleWorkspaceSettings> | null
): ScheduleWorkspaceSettings {
  const noShowPolicy = normalizeNoShowPolicy(value?.noShowPolicy);
  const noShowFeePercent = clampInteger(
    value?.noShowFeePercent,
    0,
    100,
    DEFAULT_SCHEDULE_SETTINGS.noShowFeePercent
  );

  return {
    defaultDurationMinutes: clampInteger(
      value?.defaultDurationMinutes,
      15,
      240,
      DEFAULT_SCHEDULE_SETTINGS.defaultDurationMinutes
    ),
    defaultDayPart: normalizeDayPart(value?.defaultDayPart),
    defaultCategoryId: normalizeCategoryId(value?.defaultCategoryId),
    statusColorOverrides: normalizeStatusColorOverrides(value?.statusColorOverrides),
    requireDescription:
      typeof value?.requireDescription === "boolean"
        ? value.requireDescription
        : DEFAULT_SCHEDULE_SETTINGS.requireDescription,
    requireService:
      typeof value?.requireService === "boolean"
        ? value.requireService
        : DEFAULT_SCHEDULE_SETTINGS.requireService,
    requireEmployee:
      typeof value?.requireEmployee === "boolean"
        ? value.requireEmployee
        : DEFAULT_SCHEDULE_SETTINGS.requireEmployee,
    autoSelectFirstService:
      typeof value?.autoSelectFirstService === "boolean"
        ? value.autoSelectFirstService
        : DEFAULT_SCHEDULE_SETTINGS.autoSelectFirstService,
    autoSelectFirstEmployee:
      typeof value?.autoSelectFirstEmployee === "boolean"
        ? value.autoSelectFirstEmployee
        : DEFAULT_SCHEDULE_SETTINGS.autoSelectFirstEmployee,
    enableInventoryTracking:
      typeof value?.enableInventoryTracking === "boolean"
        ? value.enableInventoryTracking
        : DEFAULT_SCHEDULE_SETTINGS.enableInventoryTracking,
    confirmationPolicy: normalizeConfirmationPolicy(value?.confirmationPolicy),
    reminderEnabled:
      typeof value?.reminderEnabled === "boolean"
        ? value.reminderEnabled
        : DEFAULT_SCHEDULE_SETTINGS.reminderEnabled,
    reminderLeadMinutes: clampInteger(
      value?.reminderLeadMinutes,
      15,
      1440,
      DEFAULT_SCHEDULE_SETTINGS.reminderLeadMinutes
    ),
    noShowPolicy,
    noShowFeePercent: noShowPolicy === "charge" ? noShowFeePercent : 0,
  };
}

type ScheduleSettingsStorageRecord = {
  settings?: Partial<ScheduleWorkspaceSettings>;
  updatedAt?: string;
  updatedBy?: string | null;
};

class ScheduleSettingsService {
  private readonly schedulesApi = new SchedulesApi(httpClient);

  private ensureWorkspaceId(workspaceId: string): string {
    const normalized = workspaceId?.trim();
    if (!normalized) throw new Error("workspaceId is required");
    return normalized;
  }

  private readRecord(workspaceId: string): ScheduleSettingsStorageRecord | null {
    const raw = localStorageProvider.get(toStorageKey(workspaceId));
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw) as ScheduleSettingsStorageRecord;
      return parsed && typeof parsed === "object" ? parsed : null;
    } catch {
      return null;
    }
  }

  private persistRecord(
    workspaceId: string,
    settings: ScheduleWorkspaceSettings,
    updatedAt?: string,
    updatedBy?: string | null
  ): void {
    const payload: ScheduleSettingsStorageRecord = {
      settings,
      updatedAt,
      updatedBy: updatedBy ?? null,
    };
    localStorageProvider.set(toStorageKey(workspaceId), JSON.stringify(payload));
  }

  private getLocalFallback(workspaceId: string): ScheduleWorkspaceSettingsBundle {
    const record = this.readRecord(workspaceId);
    if (!record?.settings) {
      return {
        workspaceId,
        settings: { ...DEFAULT_SCHEDULE_SETTINGS },
        source: "defaults",
      };
    }

    return {
      workspaceId,
      settings: normalizeSettings(record.settings),
      source: "database",
      updatedAt: record.updatedAt,
    };
  }

  async getSettings(workspaceId: string): Promise<ScheduleWorkspaceSettingsBundle> {
    try {
      const safeWorkspaceId = this.ensureWorkspaceId(workspaceId);
      try {
        const remote = await this.schedulesApi.getWorkspaceSettings(safeWorkspaceId);
        const normalized = normalizeSettings(remote.settings);
        this.persistRecord(safeWorkspaceId, normalized, remote.updatedAt);
        return {
          workspaceId: safeWorkspaceId,
          settings: normalized,
          source: remote.source,
          updatedAt: remote.updatedAt,
        };
      } catch {
        return this.getLocalFallback(safeWorkspaceId);
      }
    } catch (err) {
      throw toAppError(err);
    }
  }

  async upsertSettings(
    workspaceId: string,
    settings: Partial<ScheduleWorkspaceSettings>,
    updatedBy?: string | null
  ): Promise<ScheduleWorkspaceSettingsBundle> {
    try {
      const safeWorkspaceId = this.ensureWorkspaceId(workspaceId);
      const current = await this.getSettings(safeWorkspaceId);
      const merged = normalizeSettings({
        ...current.settings,
        ...(settings ?? {}),
      });

      try {
        const remote = await this.schedulesApi.upsertWorkspaceSettings(
          safeWorkspaceId,
          merged,
          updatedBy ?? null
        );
        const normalized = normalizeSettings(remote.settings);
        this.persistRecord(safeWorkspaceId, normalized, remote.updatedAt, updatedBy);
        return {
          workspaceId: safeWorkspaceId,
          settings: normalized,
          source: remote.source,
          updatedAt: remote.updatedAt,
        };
      } catch {
        const updatedAt = new Date().toISOString();
        this.persistRecord(safeWorkspaceId, merged, updatedAt, updatedBy);
        return {
          workspaceId: safeWorkspaceId,
          settings: merged,
          source: "database",
          updatedAt,
        };
      }
    } catch (err) {
      throw toAppError(err);
    }
  }
}

export const scheduleSettingsService = new ScheduleSettingsService();

export async function getScheduleSettings(
  workspaceId: string
): Promise<ScheduleWorkspaceSettingsBundle> {
  return scheduleSettingsService.getSettings(workspaceId);
}

export async function upsertScheduleSettings(
  workspaceId: string,
  settings: Partial<ScheduleWorkspaceSettings>,
  updatedBy?: string | null
): Promise<ScheduleWorkspaceSettingsBundle> {
  return scheduleSettingsService.upsertSettings(workspaceId, settings, updatedBy);
}
