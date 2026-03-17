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
      if (cached?.modules && cached.modules.length === 0) {
        return { overview: null, language: null };
      }

      return {
        overview: cached,
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
      if (existing != null && this.cachedLanguage === currentLanguage) return existing;
    }

    if (this.pending) return this.pending;

    this.pending = (async () => {
      const res = await this.api.getOverview();
      const payload = unwrapOverviewPayload(res);
      const profileRaw = (payload?.profile ?? null) as RawProfile | null;
      const normalizedProfile = normalizeProfile(profileRaw);
      const modules = Array.isArray(payload?.modules) ? payload?.modules : [];
      const overview: UserOverview = {
        profile: normalizedProfile,
        modules,
      };

      this.cachedLanguage = currentLanguage;
      this.subject.next(overview);
      try {
        const user = getCurrentSessionEmail();
        const cache: CachedOverview = { user, language: currentLanguage, overview };
        localStorageProvider.set(OVERVIEW_KEY, JSON.stringify(cache));
      } catch {
        // ignore cache errors
      }

      return overview;
    })();

    try {
      return await this.pending;
    } finally {
      this.pending = null;
    }
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
