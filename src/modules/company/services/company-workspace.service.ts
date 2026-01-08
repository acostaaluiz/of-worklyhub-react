import { toAppError } from "@core/errors/to-app-error";
import { CompaniesApi } from "./companies-api";
import { httpClient } from "@core/http/client.instance";
import { companyService } from "./company.service";
import type { CompanyServiceModel, CompanyServiceCreatePayload } from "@modules/company/interfaces/service.model";

type ApiRow = { [key: string]: unknown };

function getString(row: ApiRow, key: string): string | undefined {
  const v = row[key];
  return typeof v === "string" ? v : undefined;
}

function getNumber(row: ApiRow, key: string): number | undefined {
  const v = row[key];
  return typeof v === "number" ? v : undefined;
}

function getBoolean(row: ApiRow, key: string): boolean | undefined {
  const v = row[key];
  return typeof v === "boolean" ? v : undefined;
}

function mapFromApi(item: ApiRow): CompanyServiceModel {
  const title = getString(item, "name") ?? getString(item, "title") ?? "";
  const description = getString(item, "description") ?? undefined;
  const durationMinutes = getNumber(item, "duration_minutes") ?? getNumber(item, "durationMinutes");
  const priceCents = getNumber(item, "price_cents") ?? getNumber(item, "priceCents");
  const capacity = getNumber(item, "capacity");
  const staffRequired = getNumber(item, "staff_required") ?? getNumber(item, "staffRequired");
  const tags = Array.isArray(item["tags"]) ? (item["tags"] as unknown[]).map((x) => String(x)) : undefined;
  const category = getString(item, "category");
  const active = getBoolean(item, "is_active") ?? getBoolean(item, "active");
  const createdAt = getString(item, "created_at") ?? getString(item, "createdAt") ?? new Date().toISOString();

  return {
    id: String(item["id"] ?? ""),
    title,
    description,
    durationMinutes,
    priceCents,
    capacity,
    staffRequired,
    tags: tags ?? (category ? [category] : undefined),
    active,
    createdAt,
  } as CompanyServiceModel;
}

function mapToApi(payload: CompanyServiceCreatePayload): { [key: string]: unknown } {
  return {
    name: payload.title ?? payload.title,
    category: Array.isArray(payload.tags) && payload.tags.length ? payload.tags[0] : undefined,
    description: payload.description,
    duration_minutes: payload.durationMinutes,
    price_cents: payload.priceCents,
    capacity: payload.capacity,
    is_active: payload.active,
  };
}

export class CompanyWorkspaceService {
  private api = new CompaniesApi(httpClient);
  private pendingFetchServices: Promise<CompanyServiceModel[]> | null = null;

  async listServices(): Promise<CompanyServiceModel[]> {
    try {
      const ws = companyService.getWorkspaceValue();
      const w = ws as { workspaceId?: string; id?: string } | null;
      const workspaceId = (w?.workspaceId ?? w?.id) as string | undefined;
      if (!workspaceId) return [];
      // dedupe concurrent calls
      if (this.pendingFetchServices) return this.pendingFetchServices;

      this.pendingFetchServices = (async () => {
        const res = await this.api.listWorkspaceServices(workspaceId);
        if (!res) return [] as CompanyServiceModel[];
        let arr: ApiRow[] = [];
        if (Array.isArray(res)) {
          arr = res as unknown[] as ApiRow[];
        } else if (res && typeof res === "object") {
          const obj = res as { [key: string]: unknown };
          const maybe = obj["services"];
          if (Array.isArray(maybe)) arr = maybe as ApiRow[];
        }
        return arr.map((r) => mapFromApi(r ?? {}));
      })();

      try {
        return await this.pendingFetchServices;
      } finally {
        this.pendingFetchServices = null;
      }
    } catch (err) {
      throw toAppError(err);
    }
  }

  async createService(payload: CompanyServiceCreatePayload): Promise<CompanyServiceModel> {
    try {
      const ws = companyService.getWorkspaceValue();
      console.log('workspace: ', ws);
      const w2 = ws as { workspaceId?: string; id?: string } | null;
      const workspaceId = (w2?.workspaceId ?? w2?.id) as string | undefined;
      if (!workspaceId) throw new Error("No workspace available");
      const body = mapToApi(payload);
      const res = await this.api.createWorkspaceService(workspaceId, body);
      // assume API returns created object
      return mapFromApi(res as ApiRow);
    } catch (err) {
      throw toAppError(err);
    }
  }

  async updateService(_id: string, _patch: Partial<CompanyServiceModel>): Promise<CompanyServiceModel> {
    // send allowed patch fields to backend
    try {
      const ws = companyService.getWorkspaceValue();
      const w = ws as { workspaceId?: string; id?: string } | null;
      const workspaceId = (w?.workspaceId ?? w?.id) as string | undefined;
      if (!workspaceId) throw new Error("No workspace available");

      const serviceId = _id;

      const body: { [key: string]: unknown } = {};
      const patch = _patch as Partial<CompanyServiceModel>;
      if (Object.prototype.hasOwnProperty.call(patch, "title")) body.name = patch.title ?? null;
      if (Object.prototype.hasOwnProperty.call(patch, "tags")) body.category = Array.isArray(patch.tags) && patch.tags!.length ? patch.tags![0] : null;
      if (Object.prototype.hasOwnProperty.call(patch, "description")) body.description = patch.description ?? null;
      if (Object.prototype.hasOwnProperty.call(patch, "durationMinutes")) body.duration_minutes = patch.durationMinutes ?? null;
      if (Object.prototype.hasOwnProperty.call(patch, "priceCents")) body.price_cents = patch.priceCents ?? null;
      if (Object.prototype.hasOwnProperty.call(patch, "capacity")) body.capacity = patch.capacity ?? null;
      if (Object.prototype.hasOwnProperty.call(patch, "active")) body.is_active = patch.active ?? null;

      const res = await this.api.updateWorkspaceService(workspaceId, serviceId, body);

      // if API returned an object representing the updated service, map it
      if (res && typeof res === "object") {
        const obj = res as ApiRow;
        if (obj.id) {
          return mapFromApi(obj);
        }
        // if API returned { serviceId } or similar, refresh list and return the updated item
        if (obj.serviceId) {
          const sid = String(obj.serviceId);
          const list = await this.listServices();
          const found = list.find((s) => s.id === sid);
          if (found) return found;
          throw new Error("Updated service not found after update");
        }
      }

      // fallback: refresh list and try to find by id
      const list2 = await this.listServices();
      const f2 = list2.find((s) => s.id === serviceId);
      if (f2) return f2;

      throw new Error("Update failed or unexpected response");
    } catch (err) {
      throw toAppError(err);
    }
  }

  async deactivateService(_id: string): Promise<void> {
    // Not implemented on backend yet — client can call updateService with active=false
    throw new Error("Not implemented");
  }
}

export const companyWorkspaceService = new CompanyWorkspaceService();
export default companyWorkspaceService;
