import { BaseHttpService } from "@core/http/base-http.service";
import type { HttpClient } from "@core/http/interfaces/http-client.interface";

export type WorkspaceInvoiceModuleKey =
  | "work-order"
  | "schedule"
  | "finance"
  | "inventory"
  | "people"
  | "clients";

export type WorkspaceInvoiceSettings = {
  enabled: boolean;
  modules: Record<WorkspaceInvoiceModuleKey, boolean>;
  metadata?: DataMap;
};

export type WorkspaceInvoiceSettingsResponse = {
  data: {
    workspaceId: string;
    settings: WorkspaceInvoiceSettings;
    source: "database" | "defaults";
    updatedAt?: string;
  };
};

export type UpsertWorkspaceInvoiceSettingsRequest = {
  workspaceId?: string;
  settings: WorkspaceInvoiceSettings;
  updatedByUid?: string;
};

export type NfeEnvironment = "production" | "homologation";
export type NfeAuthType = "none" | "bearer" | "api-key" | "basic";

export type NfeIntegrationAuth = {
  type: NfeAuthType;
  token?: string;
  headerName?: string;
  apiKey?: string;
  username?: string;
  password?: string;
};

export type NfeIntegrationConfig = {
  provider: string;
  baseUrl: string;
  issuePath: string;
  method?: "POST" | "PUT";
  timeoutMs?: number;
  retries?: number;
  auth?: NfeIntegrationAuth;
  headers?: Record<string, string>;
  payloadTemplate?: DataMap;
  responseMapping?: Record<string, string>;
};

export type NfeIssuerConfig = {
  legalName: string;
  document: string;
  stateRegistration?: string;
  municipalRegistration?: string;
  taxRegime?: string;
  address?: DataMap;
};

export type NfeConfigurationWritePayload = {
  environment?: NfeEnvironment;
  integration: NfeIntegrationConfig;
  issuer: NfeIssuerConfig;
  defaults?: DataMap;
  metadata?: DataMap;
};

export type NfeConfigurationGetResponse = {
  data: {
    id: string;
    contextType: "subscription" | "service_sale";
    issuerScope: "platform" | "workspace";
    workspaceId: string | null;
    configuration: NfeConfigurationWritePayload;
    resolution: "platform" | "workspace" | "workspace-default";
    updatedAt: string;
  };
};

export type NfeConfigurationPutResponse = {
  data: {
    id: string;
    contextType: "subscription" | "service_sale";
    issuerScope: "platform" | "workspace";
    workspaceId: string | null;
    configuration: NfeConfigurationWritePayload;
    updatedAt: string;
  };
};

export type UpsertNfeConfigurationRequest = {
  workspaceId?: string;
  configuration: NfeConfigurationWritePayload;
  updatedByUid?: string;
};

export class InvoiceSettingsApi extends BaseHttpService {
  constructor(http: HttpClient) {
    super(http, { correlationNamespace: "invoice-settings-api" });
  }

  async getWorkspaceInvoiceSettings(
    workspaceId?: string,
    headers?: Record<string, string>
  ): Promise<WorkspaceInvoiceSettingsResponse> {
    return this.get<WorkspaceInvoiceSettingsResponse>(
      "/billing/nfe/workspace-settings",
      workspaceId ? { workspaceId } : undefined,
      headers
    );
  }

  async upsertWorkspaceInvoiceSettings(
    body: UpsertWorkspaceInvoiceSettingsRequest,
    headers?: Record<string, string>
  ): Promise<WorkspaceInvoiceSettingsResponse> {
    return this.put<WorkspaceInvoiceSettingsResponse, UpsertWorkspaceInvoiceSettingsRequest>(
      "/billing/nfe/workspace-settings",
      body,
      headers
    );
  }

  async getServiceSaleNfeConfiguration(
    workspaceId?: string,
    headers?: Record<string, string>
  ): Promise<NfeConfigurationGetResponse> {
    return this.get<NfeConfigurationGetResponse>(
      "/billing/nfe/configurations/service_sale",
      workspaceId ? { workspaceId } : undefined,
      headers
    );
  }

  async upsertServiceSaleNfeConfiguration(
    body: UpsertNfeConfigurationRequest,
    headers?: Record<string, string>
  ): Promise<NfeConfigurationPutResponse> {
    return this.put<NfeConfigurationPutResponse, UpsertNfeConfigurationRequest>(
      "/billing/nfe/configurations/service_sale",
      body,
      headers
    );
  }
}

export default InvoiceSettingsApi;

