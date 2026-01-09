import { BehaviorSubject } from "rxjs";
import { UsersApi, type UserProfileResponse } from "./users-api";
import { httpClient } from "@core/http/client.instance";
import { localStorageProvider } from "@core/storage/local-storage.provider";

export type UserProfile = UserProfileResponse | null;

const PROFILE_KEY = "user.profile";

export class UsersService {
  private subject = new BehaviorSubject<UserProfile>(this.loadFromStorage());
  private api = new UsersApi(httpClient);

  async uploadProfilePhoto(file: File, onProgress?: (percent: number) => void): Promise<string> {
    // request signature from backend
    const sig = await this.api.requestProfilePhotoSignature({ contentType: file.type, filename: file.name });

    if (!sig || !sig.url || !sig.path) throw new Error("Invalid signature response");
    if (sig.maxSize && file.size > sig.maxSize) throw new Error("File exceeds maximum allowed size");

    // upload using XHR to allow progress reporting
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", sig.url);
      xhr.setRequestHeader("Content-Type", file.type);
      xhr.upload.onprogress = (ev) => {
        if (ev.lengthComputable && typeof onProgress === "function") {
          const percent = Math.round((ev.loaded / ev.total) * 100);
          try {
            onProgress(percent);
          } catch {
            // ignore
          }
        }
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) resolve();
        else reject(new Error(`Upload failed with status ${xhr.status}`));
      };
      xhr.onerror = () => reject(new Error("Network error during upload"));
      xhr.send(file);
    });

    // update local cached profile (photoUrl)
    try {
      const current = this.getProfileValue();
      if (current) {
        const updated = { ...current, photoUrl: sig.path } as UserProfileResponse;
        this.subject.next(updated);
        try {
          localStorageProvider.set(PROFILE_KEY, JSON.stringify(updated));
        } catch {
          // ignore storage errors
        }
      }
    } catch {
      // ignore
    }

    return sig.path;
  }

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

  async setPlan(email: string, planId: number): Promise<void> {
    try {
      await this.api.setPlan(email, planId);

      // update cached profile if present
      const current = this.getProfileValue();
      if (current) {
        const updated = { ...current, planId } as UserProfileResponse;
        this.subject.next(updated);
        try {
          localStorageProvider.set(PROFILE_KEY, JSON.stringify(updated));
        } catch {
          // ignore storage errors
        }
      }
    } catch (err) {
      console.error("usersService.setPlan error", err);
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
