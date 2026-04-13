import { BehaviorSubject } from "rxjs";
import { CompaniesApi, type WorkspaceCreatePayload, type WorkspaceCreateResponse, type WorkspaceGetResponse, type WorkspaceProfileUpdatePayload, type WorkspaceProfileUpdateResponse } from "./companies-api";
import { httpClient } from "@core/http/client.instance";
import { localStorageProvider } from "@core/storage/local-storage.provider";
import type { WorkspaceModel } from "./companies-api";
import { toAppError } from "@core/errors/to-app-error";

export type Workspace = WorkspaceModel | null;

const WORKSPACE_KEY = "company.workspace";

export class CompanyService {
  private subject = new BehaviorSubject<Workspace>(this.loadFromStorage());
  private api = new CompaniesApi(httpClient);
  private pendingWorkspaceByEmail = new Map<string, Promise<Workspace | null>>();

  private loadFromStorage(): Workspace {
    try {
      const raw = localStorageProvider.get(WORKSPACE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as Workspace;
    } catch {
      return null;
    }
  }

  getWorkspace$() {
    return this.subject.asObservable();
  }

  getWorkspaceValue(): Workspace {
    return this.subject.getValue();
  }

  async createWorkspace(payload: WorkspaceCreatePayload): Promise<WorkspaceCreateResponse> {
    const res = await this.api.createWorkspace(payload);
    try {
      localStorageProvider.set(WORKSPACE_KEY, JSON.stringify(res));
    } catch {
      // ignore
    }
    this.subject.next(res as WorkspaceCreateResponse);
    return res as WorkspaceCreateResponse;
  }

  clear(): void {
    localStorageProvider.remove(WORKSPACE_KEY);
    this.subject.next(null);
    this.pendingWorkspaceByEmail.clear();
  }

  public async fetchWorkspaceByEmail(email: string): Promise<Workspace | null> {
    const normalizedEmail = String(email ?? "").trim().toLowerCase();
    if (!normalizedEmail) return null;

    const inFlight = this.pendingWorkspaceByEmail.get(normalizedEmail);
    if (inFlight) return inFlight;

    const request = (async (): Promise<Workspace | null> => {
      try {
        const res: WorkspaceGetResponse = await this.api.getWorkspace(normalizedEmail);
        const workspace = res?.workspace ?? null;
        if (workspace) {
          try {
            localStorageProvider.set(WORKSPACE_KEY, JSON.stringify(workspace));
          } catch {
            // ignore storage errors
          }
          this.subject.next(workspace);
          return workspace;
        }
        // no workspace found
        this.clear();
        return null;
      } catch (error) {
        const appError = toAppError(error);
        const status = appError.statusCode ?? 0;

        if (status === 400 || status === 401 || status === 403 || status === 404) {
          // Expected onboarding/auth states should not break navigation flows.
          this.clear();
          return null;
        }

        throw appError;
      } finally {
        this.pendingWorkspaceByEmail.delete(normalizedEmail);
      }
    })();

    this.pendingWorkspaceByEmail.set(normalizedEmail, request);
    return request;
  }

  async updateWorkspaceProfile(payload: WorkspaceProfileUpdatePayload): Promise<Workspace | null> {
    try {
      const ws = this.getWorkspaceValue();
      const w = ws as { workspaceId?: string; id?: string } | null;
      const workspaceId = (w?.workspaceId ?? w?.id) as string | undefined;
      if (!workspaceId) throw new Error("No workspace available");

      const res: WorkspaceProfileUpdateResponse = await this.api.updateWorkspaceProfile(workspaceId, payload);
      const workspace = res?.workspace ?? null;
      if (workspace) {
        try {
          localStorageProvider.set(WORKSPACE_KEY, JSON.stringify(workspace));
        } catch {
          // ignore storage errors
        }
        this.subject.next(workspace);
      }

      return workspace;
    } catch (err) {
      throw toAppError(err);
    }
  }
  async uploadWorkspaceWallpaper(file: File, onProgress?: (percent: number) => void): Promise<string> {
    // request signature from backend
    // CompaniesApi.requestWallpaperSignature returns { url, path, maxSize }
    const sig = await this.api.requestWallpaperSignature(file.type, file.name);
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

    // update cached workspace: set company_profile.wallpaperUrl
    try {
      const current = this.getWorkspaceValue();
      if (current) {
        type WorkspaceWithCompany = WorkspaceModel & { company_profile?: { wallpaperUrl?: string; [k: string]: DataValue } };
        const updated = { ...(current as WorkspaceModel) } as WorkspaceWithCompany;
        updated.company_profile = updated.company_profile ?? {};
        updated.company_profile.wallpaperUrl = sig.path;
        try {
          localStorageProvider.set(WORKSPACE_KEY, JSON.stringify(updated));
        } catch {
          // ignore
        }
        this.subject.next(updated as Workspace);
      }
    } catch {
      // ignore
    }

    return sig.path;
  }
}

export const companyService = new CompanyService();

export default companyService;

