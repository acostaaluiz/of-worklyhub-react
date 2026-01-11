import { toAppError } from "@core/errors/to-app-error";
import { companyService } from "@modules/company/services/company.service";
import { usersAuthService } from "@modules/users/services/auth.service";
import { PeopleApi, type CreateWorkerPayload } from "@modules/people/services/people-api";
import { httpClient } from "@core/http/client.instance";
import type { EmployeeModel } from "@modules/people/interfaces/employee.model";

function nowIso() {
  return new Date().toISOString();
}

function makeId(prefix = "e") {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;
}

export class PeopleService {
  private api = new PeopleApi(httpClient);
  private _listPromise: Promise<EmployeeModel[]> | null = null;
  private employees: EmployeeModel[] = [
    { id: makeId(), firstName: "Mariana", lastName: "Silva", email: "mariana@demo.com", phone: "(11) 99999-0001", role: "Recepção", department: "Operações", hiredAt: nowIso(), salaryCents: 350000, active: true, createdAt: nowIso() },
    { id: makeId(), firstName: "João", lastName: "Pereira", email: "joao@demo.com", phone: "(11) 99999-0002", role: "Barbeiro", department: "Serviços", hiredAt: nowIso(), salaryCents: 220000, active: true, createdAt: nowIso() },
  ];

  async listEmployees(): Promise<EmployeeModel[]> {
    // Prevent concurrent duplicate fetches: reuse in-flight promise
    if (this._listPromise) return this._listPromise;

    this._listPromise = (async () => {
      try {
        // attempt to fetch from backend when workspace available
        const ws = companyService.getWorkspaceValue() as { workspaceId?: string; id?: string } | null;
        const workspaceId = (ws?.workspaceId ?? ws?.id) as string | undefined;
        if (workspaceId) {
            const res = await this.api.listWorkspaceWorkers(workspaceId);
            // API may return { workers: [...] } or the array directly
            let arr: unknown[] = [];
            if (Array.isArray(res)) {
              arr = res as unknown[];
            } else if (res && typeof res === "object") {
              const obj = res as Record<string, unknown>;
              if (Array.isArray(obj["workers"])) {
                arr = obj["workers"] as unknown[];
              }
            }

          const mapped = arr
            .filter((r): r is Record<string, unknown> => typeof r === "object" && r !== null)
            .map((row) => mapFromApi(row));
          // replace local cache with fresh list
          this.employees = mapped.slice();
          return mapped;
        }

        // fallback: return local mock
        await new Promise((r) => setTimeout(r, 80));
        return this.employees.slice();
      } catch (err) {
        throw toAppError(err);
      } finally {
        this._listPromise = null;
      }
    })();

    return this._listPromise;
  }

  async getEmployee(id: string): Promise<EmployeeModel | null> {
    try {
      await new Promise((r) => setTimeout(r, 40));
      return this.employees.find((e) => e.id === id) ?? null;
    } catch (err) {
      throw toAppError(err);
    }
  }

  async createEmployee(payload: Omit<EmployeeModel, "id" | "createdAt">): Promise<EmployeeModel> {
    try {
      // try to create via backend if workspace and user are available
      const ws = companyService.getWorkspaceValue() as { workspaceId?: string; id?: string } | null;
      const workspaceId = (ws?.workspaceId ?? ws?.id) as string | undefined;

      if (workspaceId) {
        const body: CreateWorkerPayload = {
          workspace_id: workspaceId,
          user_email: payload.email ?? "",
          user_name: `${payload.firstName ?? ""} ${payload.lastName ?? ""}`.trim(),
          job_title: payload.role ?? undefined,
          department: payload.department ?? undefined,
          employee_code: undefined,
          hired_at: payload.hiredAt ?? undefined,
          salary_cents: payload.salaryCents ?? undefined,
        };

        const res = await this.api.createWorker(body);
        const data = (res ?? {}) as Record<string, unknown>;

        // API may return several shapes: { workers: [...] }, { worker: {...} }, array, or a flat object
        let createdRow: Record<string, unknown> | undefined;
        if (data && typeof data === "object") {
          const obj = data as Record<string, unknown>;
          if (Array.isArray(obj["workers"]) && (obj["workers"] as unknown[]).length > 0) {
            const first = (obj["workers"] as unknown[])[0];
            if (typeof first === "object" && first !== null) {
              createdRow = first as Record<string, unknown>;
            }
          } else if (obj["worker"] && typeof obj["worker"] === "object") {
            createdRow = obj["worker"] as Record<string, unknown>;
          } else if (Object.keys(obj).length > 0 && (obj["user_uid"] || obj["user_email"] || obj["job_title"])) {
            // looks like a flat worker object
            createdRow = obj as Record<string, unknown>;
          }
        }

        const created = createdRow ? mapFromApi(createdRow) : ({ ...payload, id: makeId(), createdAt: nowIso() } as EmployeeModel);

        // keep local cache in sync
        this.employees.unshift(created);
        return created;
      }

      // fallback to local mock when no workspace/user available
      await new Promise((r) => setTimeout(r, 80));
      const emp: EmployeeModel = { ...payload, id: makeId(), createdAt: nowIso() } as EmployeeModel;
      this.employees.unshift(emp);
      return emp;
    } catch (err) {
      throw toAppError(err);
    }
  }

  async updateEmployee(id: string, patch: Partial<EmployeeModel>): Promise<EmployeeModel> {
    try {
      // try to update via backend if workspace and user available
      const ws = companyService.getWorkspaceValue() as { workspaceId?: string; id?: string } | null;
      const workspaceId = (ws?.workspaceId ?? ws?.id) as string | undefined;
      const session = usersAuthService.getSessionValue();
      const userUid = session?.uid ?? undefined;

      if (workspaceId && userUid) {
        const body: { [key: string]: unknown } = {};
        if (Object.prototype.hasOwnProperty.call(patch, "role")) body.job_title = patch.role ?? null;
        if (Object.prototype.hasOwnProperty.call(patch, "department")) body.department = patch.department ?? null;
        if (Object.prototype.hasOwnProperty.call(patch, "hiredAt")) body.hired_at = patch.hiredAt ?? null;
        if (Object.prototype.hasOwnProperty.call(patch, "salaryCents")) body.salary_cents = patch.salaryCents ?? null;

        const res = await this.api.updateWorker(workspaceId, userUid, body);
        const data = (res ?? {}) as Record<string, unknown>;

        // update local cache if present
        const idx = this.employees.findIndex((e) => e.id === id);
        if (idx !== -1) {
          const updated: EmployeeModel = { ...this.employees[idx], role: (data["job_title"] as string) ?? patch.role ?? this.employees[idx].role, department: (data["department"] as string) ?? patch.department ?? this.employees[idx].department, hiredAt: (data["hired_at"] as string) ?? patch.hiredAt ?? this.employees[idx].hiredAt, salaryCents: (typeof data["salary_cents"] === "number" ? (data["salary_cents"] as number) : patch.salaryCents ?? this.employees[idx].salaryCents) } as EmployeeModel;
          this.employees[idx] = updated;
          return updated;
        }

        // if not in cache, map API response to EmployeeModel
        const mapped: EmployeeModel = {
          id: String(data["id"] ?? id),
          firstName: String(data["first_name"] ?? data["firstName"] ?? patch.firstName ?? ""),
          lastName: String(data["last_name"] ?? data["lastName"] ?? patch.lastName ?? ""),
          email: (data["email"] as string) ?? patch.email,
          phone: (data["phone"] as string) ?? patch.phone,
          role: (data["job_title"] as string) ?? patch.role,
          department: (data["department"] as string) ?? patch.department,
          hiredAt: (data["hired_at"] as string) ?? patch.hiredAt,
          salaryCents: (typeof data["salary_cents"] === "number" ? (data["salary_cents"] as number) : patch.salaryCents),
          active: (typeof data["active"] === "boolean" ? (data["active"] as boolean) : true),
          createdAt: (data["created_at"] as string) ?? nowIso(),
        } as EmployeeModel;

        this.employees.unshift(mapped);
        return mapped;
      }

      // fallback to local mock update
      await new Promise((r) => setTimeout(r, 80));
      const idx = this.employees.findIndex((e) => e.id === id);
      if (idx === -1) throw new Error("Employee not found");
      this.employees[idx] = { ...this.employees[idx], ...patch };
      return this.employees[idx];
    } catch (err) {
      throw toAppError(err);
    }
  }

  async deactivateEmployee(id: string): Promise<void> {
    try {
      await new Promise((r) => setTimeout(r, 60));
      const emp = this.employees.find((e) => e.id === id);
      if (!emp) throw new Error("Employee not found");
      emp.active = false;
    } catch (err) {
      throw toAppError(err);
    }
  }
}

function mapFromApi(item: Record<string, unknown>): EmployeeModel {
  const id = String(item["id"] ?? item["worker_id"] ?? item["user_uid"] ?? item["userUid"] ?? item["user_uid"] ?? makeId());
  const rawName = (item["first_name"] ?? item["firstName"] ?? item["name"] ?? item["user_name"]) as string | undefined;
  const nameParts = rawName ? String(rawName).trim().split(/\s+/) : [];
  const firstName = String(item["first_name"] ?? item["firstName"] ?? (nameParts.length > 0 ? nameParts[0] : ""));
  const lastName = String(item["last_name"] ?? item["lastName"] ?? (nameParts.length > 1 ? nameParts.slice(1).join(" ") : ""));
  const email = (typeof item["email"] === "string" ? (item["email"] as string) : undefined) ?? (typeof item["user_email"] === "string" ? (item["user_email"] as string) : undefined);
  const phone = typeof item["phone"] === "string" ? (item["phone"] as string) : undefined;
  const role = typeof item["job_title"] === "string" ? (item["job_title"] as string) : (typeof item["role"] === "string" ? (item["role"] as string) : undefined);
  const department = typeof item["department"] === "string" ? (item["department"] as string) : undefined;
  const hiredAt = typeof item["hired_at"] === "string" ? (item["hired_at"] as string) : (typeof item["hiredAt"] === "string" ? (item["hiredAt"] as string) : undefined);
  const salaryCents = typeof item["salary_cents"] === "number" ? (item["salary_cents"] as number) : (typeof item["salaryCents"] === "number" ? (item["salaryCents"] as number) : undefined);
  const active = typeof item["active"] === "boolean" ? (item["active"] as boolean) : true;
  const createdAt = typeof item["created_at"] === "string" ? (item["created_at"] as string) : nowIso();

  return {
    id,
    firstName,
    lastName,
    email,
    phone,
    role,
    department,
    hiredAt,
    salaryCents,
    active,
    createdAt,
  } as EmployeeModel;
}

export default PeopleService;
