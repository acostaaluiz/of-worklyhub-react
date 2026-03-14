import { toAppError } from "@core/errors/to-app-error";
import { httpClient } from "@core/http/client.instance";
import type {
  EmployeeAccessProfile,
  PeopleWorkspaceSettings,
  PeopleWorkspaceSettingsBundle,
} from "@modules/people/interfaces/people-settings.model";
import { PeopleApi } from "@modules/people/services/people-api";

const MODULE_KEYS = new Set([
  "billing",
  "clients",
  "company",
  "dashboard",
  "finance",
  "growth",
  "inventory",
  "people",
  "schedule",
  "services",
  "sla",
  "work-order",
]);

const DEFAULT_ACCESS_PROFILES: EmployeeAccessProfile[] = [
  {
    uid: "manager",
    name: "Manager",
    description: "Operational management and analytics visibility",
    isSystem: true,
    allowedModules: [
      "clients",
      "company",
      "dashboard",
      "finance",
      "growth",
      "inventory",
      "people",
      "schedule",
      "services",
      "sla",
      "work-order",
    ],
  },
  {
    uid: "operator",
    name: "Operator",
    description: "Daily operation without strategic analytics",
    isSystem: true,
    allowedModules: ["clients", "inventory", "people", "schedule", "services", "work-order"],
  },
  {
    uid: "it-infra",
    name: "IT / Infra",
    description: "Infrastructure support with restricted business visibility",
    isSystem: true,
    allowedModules: ["clients", "inventory", "schedule", "services", "work-order"],
  },
];

export const DEFAULT_PEOPLE_SETTINGS: PeopleWorkspaceSettings = {
  defaultRole: null,
  defaultDepartment: null,
  defaultSalaryCents: null,
  requireEmail: false,
  requirePhone: false,
  requireDepartment: false,
  requireSalary: false,
  defaultLandingTab: "employees",
  employeeAccess: {
    enabled: true,
    defaultProfileUid: "operator",
    profiles: DEFAULT_ACCESS_PROFILES,
  },
};

function normalizeOptionalText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed.slice(0, 120) : null;
}

function normalizeOptionalSalary(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 0) return null;
  return Math.round(numeric);
}

function normalizeLandingTab(value: unknown): PeopleWorkspaceSettings["defaultLandingTab"] {
  if (value === "employees" || value === "capacity") return value;
  return DEFAULT_PEOPLE_SETTINGS.defaultLandingTab;
}

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function normalizeModuleKey(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const raw = value.trim().toLowerCase();
  if (!raw) return null;

  if (raw.includes("workorder") || raw.includes("work-order")) return "work-order";
  if (raw === "service" || raw === "catalog") return "services";
  if (raw === "client") return "clients";
  if (raw === "person" || raw === "team" || raw === "staff") return "people";
  if (raw.includes("autopilot") || raw.includes("retention")) return "growth";

  return MODULE_KEYS.has(raw) ? raw : null;
}

function normalizeProfiles(value: unknown): EmployeeAccessProfile[] {
  if (!Array.isArray(value)) return DEFAULT_ACCESS_PROFILES.map((profile) => ({ ...profile }));

  const unique = new Map<string, EmployeeAccessProfile>();
  value.forEach((entry, index) => {
    if (!entry || typeof entry !== "object") return;
    const raw = entry as Record<string, unknown>;
    const uid = toSlug(String(raw.uid ?? raw.name ?? "")) || `profile-${index + 1}`;
    if (!uid || unique.has(uid)) return;
    const name = String(raw.name ?? "").trim() || `Profile ${index + 1}`;
    const description =
      typeof raw.description === "string" && raw.description.trim().length > 0
        ? raw.description.trim().slice(0, 240)
        : null;
    const allowed = Array.isArray(raw.allowedModules)
      ? raw.allowedModules
          .map((item) => normalizeModuleKey(item))
          .filter((item): item is string => Boolean(item))
      : [];
    if (allowed.length <= 0) return;
    unique.set(uid, {
      uid,
      name: name.slice(0, 80),
      description,
      allowedModules: [...new Set(allowed)],
      isSystem: typeof raw.isSystem === "boolean" ? raw.isSystem : false,
    });
  });

  if (unique.size <= 0) return DEFAULT_ACCESS_PROFILES.map((profile) => ({ ...profile }));
  return [...unique.values()];
}

function normalizeSettings(
  value?: Partial<PeopleWorkspaceSettings> | null
): PeopleWorkspaceSettings {
  const profiles = normalizeProfiles(value?.employeeAccess?.profiles);
  const requestedDefault = toSlug(String(value?.employeeAccess?.defaultProfileUid ?? ""));
  const fallbackDefault = profiles[0]?.uid ?? DEFAULT_PEOPLE_SETTINGS.employeeAccess.defaultProfileUid;
  const defaultProfileUid = profiles.some((profile) => profile.uid === requestedDefault)
    ? requestedDefault
    : fallbackDefault;

  return {
    defaultRole: normalizeOptionalText(value?.defaultRole),
    defaultDepartment: normalizeOptionalText(value?.defaultDepartment),
    defaultSalaryCents: normalizeOptionalSalary(value?.defaultSalaryCents),
    requireEmail:
      typeof value?.requireEmail === "boolean"
        ? value.requireEmail
        : DEFAULT_PEOPLE_SETTINGS.requireEmail,
    requirePhone:
      typeof value?.requirePhone === "boolean"
        ? value.requirePhone
        : DEFAULT_PEOPLE_SETTINGS.requirePhone,
    requireDepartment:
      typeof value?.requireDepartment === "boolean"
        ? value.requireDepartment
        : DEFAULT_PEOPLE_SETTINGS.requireDepartment,
    requireSalary:
      typeof value?.requireSalary === "boolean"
        ? value.requireSalary
        : DEFAULT_PEOPLE_SETTINGS.requireSalary,
    defaultLandingTab: normalizeLandingTab(value?.defaultLandingTab),
    employeeAccess: {
      enabled:
        typeof value?.employeeAccess?.enabled === "boolean"
          ? value.employeeAccess.enabled
          : DEFAULT_PEOPLE_SETTINGS.employeeAccess.enabled,
      defaultProfileUid,
      profiles,
    },
  };
}

class PeopleSettingsService {
  private readonly api = new PeopleApi(httpClient);

  private ensureWorkspaceId(workspaceId: string): string {
    const normalized = workspaceId?.trim();
    if (!normalized) throw new Error("workspaceId is required");
    return normalized;
  }

  async getSettings(workspaceId: string): Promise<PeopleWorkspaceSettingsBundle> {
    try {
      const safeWorkspaceId = this.ensureWorkspaceId(workspaceId);
      const bundle = await this.api.getSettings(safeWorkspaceId);
      return {
        workspaceId: safeWorkspaceId,
        settings: normalizeSettings(bundle?.settings),
        source: bundle?.source === "database" ? "database" : "defaults",
        updatedAt: bundle?.updatedAt,
      };
    } catch (err) {
      throw toAppError(err);
    }
  }

  async upsertSettings(
    workspaceId: string,
    settings: Partial<PeopleWorkspaceSettings>,
    updatedBy?: string | null
  ): Promise<PeopleWorkspaceSettingsBundle> {
    try {
      const safeWorkspaceId = this.ensureWorkspaceId(workspaceId);
      const bundle = await this.api.upsertSettings({
        workspaceId: safeWorkspaceId,
        settings,
        updatedBy: updatedBy ?? null,
      });

      return {
        workspaceId: safeWorkspaceId,
        settings: normalizeSettings(bundle?.settings),
        source: "database",
        updatedAt: bundle?.updatedAt,
      };
    } catch (err) {
      throw toAppError(err);
    }
  }
}

export const peopleSettingsService = new PeopleSettingsService();

export async function getPeopleSettings(
  workspaceId: string
): Promise<PeopleWorkspaceSettingsBundle> {
  return peopleSettingsService.getSettings(workspaceId);
}

export async function upsertPeopleSettings(
  workspaceId: string,
  settings: Partial<PeopleWorkspaceSettings>,
  updatedBy?: string | null
): Promise<PeopleWorkspaceSettingsBundle> {
  return peopleSettingsService.upsertSettings(workspaceId, settings, updatedBy);
}
