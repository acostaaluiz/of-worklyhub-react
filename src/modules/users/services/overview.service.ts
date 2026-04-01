import { BehaviorSubject } from "rxjs";

import { parseSessionIdentity } from "@core/auth/session-security";
import { localStorageProvider } from "@core/storage/local-storage.provider";
import { httpClient } from "@core/http/client.instance";
import { getCurrentAppLanguage } from "@core/i18n";
import {
  UsersOverviewApi,
  type UserOverviewModule,
  type UserOverviewProfile,
  type UserOverviewResponse,
} from "./overview-api";
import { isActivePlan } from "./plan-status";

export type UserOverview = {
  profile: UserOverviewProfile | null;
  modules: UserOverviewModule[];
} | null;

type CachedOverview = {
  user?: string | null;
  language?: string | null;
  overview: UserOverview;
};

const OVERVIEW_KEY = "users.overview";
const SESSION_KEY = "auth.session";

type OverviewPayload = {
  profile?: UserOverviewProfile | null;
  modules?: UserOverviewModule[] | null;
};

type RawProfile = UserOverviewProfile & {
  full_name?: string;
  profile_photo_path?: string;
  plan_status?: "ACTIVE-PLAN" | "INACTIVE-PLAN";
};

const LEGACY_CHECKOUT_FALLBACK_KEYS = new Set(["billing", "company", "dashboard"]);

function toNormalizedModuleKey(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const key = value.trim().toLowerCase();
  if (!key) return null;
  if (key === "workorder") return "work-order";
  if (key === "service") return "services";
  return key;
}

function isLegacyCheckoutFallbackModules(
  modules: UserOverviewModule[] | null | undefined
): boolean {
  const current = Array.isArray(modules) ? modules : [];
  if (current.length !== LEGACY_CHECKOUT_FALLBACK_KEYS.size) return false;

  const found = new Set<string>();
  current.forEach((module) => {
    const uid = toNormalizedModuleKey(module?.uid);
    const name = toNormalizedModuleKey(module?.name);
    const resolved = uid ?? name;
    if (!resolved) return;
    found.add(resolved);
  });

  if (found.size !== LEGACY_CHECKOUT_FALLBACK_KEYS.size) return false;

  return [...LEGACY_CHECKOUT_FALLBACK_KEYS].every((key) => found.has(key));
}

function unwrapOverviewPayload(
  value: UserOverviewResponse | { data?: UserOverviewResponse },
): OverviewPayload | null {
  if (value && typeof value === "object" && "data" in value) {
    const data = value.data;
    if (data && typeof data === "object") return data as OverviewPayload;
  }
  return value as OverviewPayload;
}

function normalizeProfile(
  profile: RawProfile | null,
): UserOverviewProfile | null {
  if (!profile) return null;
  return {
    ...profile,
    name: profile.name ?? profile.fullName ?? profile.full_name ?? undefined,
    planStatus: profile.planStatus ?? profile.plan_status ?? undefined,
    profilePhotoUrl:
      profile.profilePhotoUrl ??
      profile.profilePhotoPath ??
      profile.profile_photo_path ??
      undefined,
  };
}

function sanitizeOverviewModules(
  modules: UserOverviewModule[] | null | undefined
): UserOverviewModule[] {
  if (!Array.isArray(modules)) return [];

  return modules.filter((module) => {
    const uid = toNormalizedModuleKey(module?.uid);
    const name = toNormalizedModuleKey(module?.name);
    const key = uid ?? name ?? "";
    return key !== "clients" && key !== "client";
  });
}

function getCurrentSessionEmail(): string | null {
  const raw = localStorageProvider.get(SESSION_KEY);
  const session = parseSessionIdentity(raw);
  return session?.email ?? null;
}

export class UsersOverviewService {
  private subject: BehaviorSubject<UserOverview>;
  private api = new UsersOverviewApi(httpClient);
  private pending: Promise<UserOverview> | null = null;
  private cachedLanguage: string | null = null;

  constructor() {
    const cached = this.loadFromStorage();
    this.cachedLanguage = cached.language;
    this.subject = new BehaviorSubject<UserOverview>(cached.overview);
  }

  private loadFromStorage(): { overview: UserOverview; language: string | null } {
    try {
      const raw = localStorageProvider.get(OVERVIEW_KEY);
      if (!raw) return { overview: null, language: null };
      const parsed = JSON.parse(raw) as CachedOverview;
      const sessionEmail = getCurrentSessionEmail();
      const currentLanguage = getCurrentAppLanguage();
      if (parsed?.user && sessionEmail && parsed.user !== sessionEmail)
        return { overview: null, language: null };

      if (!parsed?.language) {
        return { overview: null, language: null };
      }

      if (parsed?.language && parsed.language !== currentLanguage) {
        return { overview: null, language: null };
      }

      const cached = parsed?.overview ?? null;
      const sanitized = cached
        ? {
            ...cached,
            modules: sanitizeOverviewModules(cached.modules),
          }
        : null;
      if (
        (sanitized?.modules && sanitized.modules.length === 0) ||
        isLegacyCheckoutFallbackModules(sanitized?.modules)
      ) {
        return { overview: null, language: null };
      }

      return {
        overview: sanitized,
        language: parsed.language,
      };
    } catch {
      return { overview: null, language: null };
    }
  }

  private ensureLanguageConsistency() {
    const currentLanguage = getCurrentAppLanguage();
    if (this.cachedLanguage && this.cachedLanguage !== currentLanguage) {
      this.clear();
    }
  }

  private persistOverview(
    overview: UserOverview,
    language = getCurrentAppLanguage()
  ): void {
    this.cachedLanguage = language;
    this.subject.next(overview);
    try {
      const user = getCurrentSessionEmail();
      const cache: CachedOverview = { user, language, overview };
      localStorageProvider.set(OVERVIEW_KEY, JSON.stringify(cache));
    } catch {
      // ignore cache errors
    }
  }

  getOverview$() {
    return this.subject.asObservable();
  }

  getOverviewValue(): UserOverview {
    this.ensureLanguageConsistency();
    return this.subject.getValue();
  }

  getModulesValue(): UserOverviewModule[] | null {
    return this.getOverviewValue()?.modules ?? null;
  }

  getProfileValue(): UserOverviewProfile | null {
    return this.getOverviewValue()?.profile ?? null;
  }

  async fetchOverview(force = false): Promise<UserOverview> {
    this.ensureLanguageConsistency();
    const currentLanguage = getCurrentAppLanguage();

    if (!force) {
      const existing = this.getOverviewValue();
      const modules = Array.isArray(existing?.modules) ? existing.modules : [];
      const shouldReuseCache =
        existing != null &&
        this.cachedLanguage === currentLanguage &&
        !isLegacyCheckoutFallbackModules(modules) &&
        (modules.length > 0 || !isActivePlan(existing?.profile));

      if (shouldReuseCache) return existing;
    }

    if (this.pending) return this.pending;

    this.pending = (async () => {
      const res = await this.api.getOverview();
      const payload = unwrapOverviewPayload(res);
      const profileRaw = (payload?.profile ?? null) as RawProfile | null;
      const normalizedProfile = normalizeProfile(profileRaw);
      const modules = sanitizeOverviewModules(payload?.modules);
      const overview: UserOverview = {
        profile: normalizedProfile,
        modules,
      };

      this.persistOverview(overview, currentLanguage);

      return overview;
    })();

    try {
      return await this.pending;
    } finally {
      this.pending = null;
    }
  }

  setActivePlanFromCheckout(args: {
    email?: string | null;
    name?: string | null;
    planId?: number | string | null;
    planTitle?: string | null;
  }): void {
    this.ensureLanguageConsistency();
    const existing = this.getOverviewValue();
    const planNumber = Number(args.planId);
    const normalizedPlanId =
      Number.isFinite(planNumber) && planNumber > 0 ? planNumber : undefined;

    const emailCandidate =
      (typeof args.email === "string" ? args.email.trim() : "") ||
      String(existing?.profile?.email ?? "").trim() ||
      String(getCurrentSessionEmail() ?? "").trim();
    if (!emailCandidate) return;

    const currentProfile = existing?.profile ?? null;
    const nextProfile: UserOverviewProfile = {
      ...(currentProfile ?? {}),
      email: emailCandidate,
      planStatus: "ACTIVE-PLAN",
      ...(normalizedPlanId ? { planId: normalizedPlanId } : {}),
      ...(typeof args.planTitle === "string" && args.planTitle.trim().length > 0
        ? { planTitle: args.planTitle.trim() }
        : {}),
      ...(typeof args.name === "string" && args.name.trim().length > 0
        ? { name: args.name.trim() }
        : {}),
    };

    const currentModules = sanitizeOverviewModules(existing?.modules);
    const modules = currentModules;

    this.persistOverview({ profile: nextProfile, modules });
  }

  clear(): void {
    try {
      localStorageProvider.remove(OVERVIEW_KEY);
    } catch {
      // ignore
    }
    this.cachedLanguage = null;
    this.subject.next(null);
  }
}

export const usersOverviewService = new UsersOverviewService();

export default usersOverviewService;
