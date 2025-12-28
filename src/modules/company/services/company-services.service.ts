import { toAppError } from "@core/errors/to-app-error";
import type { CompanyServiceModel, CompanyServiceCreatePayload } from "@modules/company/interfaces/service.model";

function nowIso() {
  return new Date().toISOString();
}

function makeId(prefix = "svc") {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;
}

export class CompanyServicesService {
  private services: CompanyServiceModel[] = [
    { id: makeId("svc"), title: "Corte de cabelo", description: "Corte tradicional", durationMinutes: 45, priceCents: 3500, capacity: 1, staffRequired: 1, tags: ["cabelo"], active: true, createdAt: nowIso() },
    { id: makeId("svc"), title: "Barba", description: "Ajuste de barba", durationMinutes: 25, priceCents: 2000, capacity: 1, staffRequired: 1, tags: ["barba"], active: true, createdAt: nowIso() },
  ];

  async list(_companyId?: string): Promise<CompanyServiceModel[]> {
    try {
      await new Promise((r) => setTimeout(r, 60));
      return this.services.slice();
    } catch (err) {
      throw toAppError(err);
    }
  }

  async get(id: string): Promise<CompanyServiceModel | null> {
    try {
      await new Promise((r) => setTimeout(r, 40));
      return this.services.find((s) => s.id === id) ?? null;
    } catch (err) {
      throw toAppError(err);
    }
  }

  async create(payload: CompanyServiceCreatePayload): Promise<CompanyServiceModel> {
    try {
      await new Promise((r) => setTimeout(r, 60));
      const s: CompanyServiceModel = { ...payload, id: makeId("svc"), createdAt: nowIso() } as CompanyServiceModel;
      this.services.unshift(s);
      return s;
    } catch (err) {
      throw toAppError(err);
    }
  }

  async update(id: string, patch: Partial<CompanyServiceModel>): Promise<CompanyServiceModel> {
    try {
      await new Promise((r) => setTimeout(r, 60));
      const idx = this.services.findIndex((x) => x.id === id);
      if (idx === -1) throw new Error("Service not found");
      this.services[idx] = { ...this.services[idx], ...patch };
      return this.services[idx];
    } catch (err) {
      throw toAppError(err);
    }
  }

  async deactivate(id: string): Promise<void> {
    try {
      await new Promise((r) => setTimeout(r, 40));
      const s = this.services.find((x) => x.id === id);
      if (!s) throw new Error("Service not found");
      s.active = false;
    } catch (err) {
      throw toAppError(err);
    }
  }
}

export default CompanyServicesService;
