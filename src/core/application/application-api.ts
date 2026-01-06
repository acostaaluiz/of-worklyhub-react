import { BaseHttpService } from "@core/http/base-http.service";
import type { HttpClient } from "@core/http/interfaces/http-client.interface";

export type ApplicationServiceItem = { uid: string; name: string; description?: string; icon?: string };
export type ApplicationServicesResponse = { services: ApplicationServiceItem[] };

export type ApplicationCategoryItem = { uid: string; name: string; description?: string };
export type ApplicationCategoriesResponse = { categories: ApplicationCategoryItem[] };

export type ApplicationIndustryItem = { uid: string; name: string; description?: string };
export type ApplicationIndustriesResponse = { industries: ApplicationIndustryItem[] };

export type ApplicationPlanItem = { id: number; title: string; subtitle?: string; monthly_amount: number; yearly_amount: number; supports: string[]; highlight?: boolean; is_active: boolean };
export type ApplicationPlansResponse = { plans: ApplicationPlanItem[] };

export class ApplicationApi extends BaseHttpService {
  constructor(http: HttpClient) {
    super(http, { correlationNamespace: "application-api" });
  }

  async getServices(): Promise<ApplicationServicesResponse> {
    return this.get<ApplicationServicesResponse>("/internal/application/services");
  }

  async getCategories(): Promise<ApplicationCategoriesResponse> {
    return this.get<ApplicationCategoriesResponse>("/internal/application/categories");
  }

  async getIndustries(): Promise<ApplicationIndustriesResponse> {
    return this.get<ApplicationIndustriesResponse>("/internal/application/industries");
  }

  async getPlans(): Promise<ApplicationPlansResponse> {
    return this.get<ApplicationPlansResponse>("/internal/application/plans");
  }
}

export default ApplicationApi;
