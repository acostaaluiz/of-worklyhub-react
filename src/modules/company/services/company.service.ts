import { BehaviorSubject } from "rxjs";
import { CompaniesApi, type WorkspaceCreatePayload, type WorkspaceCreateResponse, type WorkspaceGetResponse } from "./companies-api";
import { httpClient } from "@core/http/client.instance";
import { localStorageProvider } from "@core/storage/local-storage.provider";
import type { CompanyProfileModel } from "@modules/company/interfaces/company.model";
import type { ServiceModel } from "@modules/clients/interfaces/service.model";
import type { WorkspaceModel } from "./companies-api";

export type Workspace = WorkspaceModel | null;

const WORKSPACE_KEY = "company.workspace";

export class CompanyService {
  private subject = new BehaviorSubject<Workspace>(this.loadFromStorage());
  private api = new CompaniesApi(httpClient);

  private static MOCK_SERVICES: ServiceModel[] = [
    {
      id: "s1",
      title: "Corte simples",
      description: "Corte rápido e prático",
      providerId: "prov-02",
      providerName: "Barbearia JJ",
      priceCents: 5000,
      priceFormatted: "R$ 50,00",
    },
    {
      id: "s2",
      title: "Corte degradê",
      description: "Acabamento degradê profissional",
      providerId: "prov-02",
      providerName: "Barbearia JJ",
      priceCents: 6000,
      priceFormatted: "R$ 60,00",
    },
    {
      id: "s3",
      title: "Corte + barba",
      description: "Pacote corte e barba",
      providerId: "prov-02",
      providerName: "Barbearia JJ",
      priceCents: 7500,
      priceFormatted: "R$ 75,00",
    },
  ];

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
  }

  public async fetchWorkspaceByEmail(email: string): Promise<Workspace | null> {
    try {
      const res: WorkspaceGetResponse = await this.api.getWorkspace(email as string);
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
    } catch {
      // on error, treat as no workspace (do not throw to avoid breaking auth flow)
      return null;
    }
  }

  // mock helper kept in service for local development
  public async getCompanyProfile(companyId: string): Promise<CompanyProfileModel> {
    await new Promise((r) => setTimeout(r, 80));

    return {
      id: companyId,
      name: "Barbearia JJ",
      description: "Espaço exclusivo para homens com serviços de corte e barba.",
      address: "Avenida Perimetral Sul, 606, Vila Rica",
      imageUrl: "https://picsum.photos/seed/companyjj/1200/600",
      phone: "(66) 98425-7218",
      rating: 4.94,
      reviewsCount: 197,
      services: CompanyService.MOCK_SERVICES,
    } as CompanyProfileModel;
  }
}

export const companyService = new CompanyService();

export default companyService;
