import { BehaviorSubject } from "rxjs";
import { UsersApi, type UserProfileResponse } from "./users-api";
import { httpClient } from "@core/http/client.instance";
import { localStorageProvider } from "@core/storage/local-storage.provider";

export type UserProfile = UserProfileResponse | null;

const PROFILE_KEY = "user.profile";

export class UsersService {
  private subject = new BehaviorSubject<UserProfile>(this.loadFromStorage());
  private api = new UsersApi(httpClient);

  private loadFromStorage(): UserProfile {
    try {
      const raw = localStorageProvider.get(PROFILE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as UserProfile;
    } catch {
      return null;
    }
  }

  getProfile$() {
    return this.subject.asObservable();
  }

  getProfileValue(): UserProfile {
    return this.subject.getValue();
  }

  async fetchByEmail(email: string): Promise<UserProfile> {
    try {
       
      console.debug("usersService.fetchByEmail", { email });
      const profile = await this.api.getByEmail(email);
      // update subject and persist result so subscribers receive update
      this.subject.next(profile);
      try {
        localStorageProvider.set(PROFILE_KEY, JSON.stringify(profile));
      } catch {
        // ignore
      }
      return profile;
    } catch (err) {
       
      console.error("usersService.fetchByEmail error", err);
      throw err;
    }
  }

  clear(): void {
    localStorageProvider.remove(PROFILE_KEY);
    this.subject.next(null);
  }
}

export const usersService = new UsersService();

export default usersService;
