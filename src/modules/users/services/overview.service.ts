import { BehaviorSubject } from "rxjs";

import { localStorageProvider } from "@core/storage/local-storage.provider";
import { httpClient } from "@core/http/client.instance";
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
  value: UserOverviewResponse | { data?: UserOverviewResponse }
): OverviewPayload | null {
  if (value && typeof value === "object" && "data" in value) {
    const data = value.data;
    if (data && typeof data === "object") return data as OverviewPayload;
  }
  return value as OverviewPayload;
}

function normalizeProfile(profile: RawProfile | null): UserOverviewProfile | null {
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
  try {
    const raw = localStorageProvider.get(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { email?: string | null };
    return parsed?.email ?? null;
  } catch {
    return null;
  }
}

export class UsersOverviewService {
  private subject = new BehaviorSubject<UserOverview>(this.loadFromStorage());
  private api = new UsersOverviewApi(httpClient);
  private pending: Promise<UserOverview> | null = null;

  private loadFromStorage(): UserOverview {
    try {
      const raw = localStorageProvider.get(OVERVIEW_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as CachedOverview;
      const sessionEmail = getCurrentSessionEmail();
      if (parsed?.user && sessionEmail && parsed.user !== sessionEmail) return null;
      const cached = parsed?.overview ?? null;
      if (cached?.modules && cached.modules.length === 0) return null;
      return cached;
    } catch {
      return null;
    }
  }

  getOverview$() {
    return this.subject.asObservable();
  }

  getOverviewValue(): UserOverview {
    return this.subject.getValue();
  }

  getModulesValue(): UserOverviewModule[] | null {
    return this.getOverviewValue()?.modules ?? null;
  }

  getProfileValue(): UserOverviewProfile | null {
    return this.getOverviewValue()?.profile ?? null;
  }

  async fetchOverview(force = false): Promise<UserOverview> {
    if (!force) {
      const existing = this.getOverviewValue();
      if (existing != null) return existing;
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

      this.subject.next(overview);
      try {
        const user = getCurrentSessionEmail();
        const cache: CachedOverview = { user, overview };
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
    this.subject.next(null);
  }
}

export const usersOverviewService = new UsersOverviewService();

export default usersOverviewService;
