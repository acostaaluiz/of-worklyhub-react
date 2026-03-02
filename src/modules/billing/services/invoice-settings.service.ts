import { isAppError } from "@core/errors/is-app-error";
import { toAppError } from "@core/errors/to-app-error";
import { httpClient } from "@core/http/client.instance";
import { companyService, type Workspace } from "@modules/company/services/company.service";
import { usersAuthService } from "@modules/users/services/auth.service";
import {
  InvoiceSettingsApi,
  type NfeAuthType,
  type NfeConfigurationWritePayload,
  type WorkspaceInvoiceModuleKey,
  type WorkspaceInvoiceSettings,
} from "./invoice-settings-api";

const DEFAULT_MODULE_FLAGS: Record<WorkspaceInvoiceModuleKey, boolean> = {
  "work-order": false,
  schedule: false,
  finance: false,
  inventory: false,
  people: false,
  clients: false,
};

function defaultWorkspaceInvoiceSettings(): WorkspaceInvoiceSettings {
  return {
    enabled: false,
    modules: { ...DEFAULT_MODULE_FLAGS },
  };
}

function defaultNfeConfiguration(): NfeConfigurationWritePayload {
  return {
    environment: "homologation",
    integration: {
      provider: "govbr",
      baseUrl: "",
      issuePath: "",
      method: "POST",
      timeoutMs: 15000,
      retries: 1,
      auth: {
        type: "none",
      },
    },
    issuer: {
      legalName: "",
      document: "",
    },
  };
}

function normalizeModuleFlags(
  input: Partial<Record<WorkspaceInvoiceModuleKey, boolean>> | undefined
): Record<WorkspaceInvoiceModuleKey, boolean> {
  return {
    ...DEFAULT_MODULE_FLAGS,
    ...(input ?? {}),
  };
}

function normalizeWorkspaceSettings(
  input: WorkspaceInvoiceSettings | undefined
): WorkspaceInvoiceSettings {
  if (!input) return defaultWorkspaceInvoiceSettings();
  return {
    enabled: !!input.enabled,
    modules: normalizeModuleFlags(input.modules),
    metadata: input.metadata,
  };
}

function normalizeAuthType(value: DataValue): NfeAuthType {
  if (value === "bearer" || value === "api-key" || value === "basic") return value;
  return "none";
}

function normalizeNfeConfiguration(
  input: NfeConfigurationWritePayload | undefined
): NfeConfigurationWritePayload {
  if (!input) return defaultNfeConfiguration();
  const fallback = defaultNfeConfiguration();
  return {
    environment: input.environment ?? fallback.environment,
    integration: {
      provider: input.integration?.provider ?? fallback.integration.provider,
      baseUrl: input.integration?.baseUrl ?? fallback.integration.baseUrl,
      issuePath: input.integration?.issuePath ?? fallback.integration.issuePath,
      method: input.integration?.method ?? fallback.integration.method,
      timeoutMs: input.integration?.timeoutMs ?? fallback.integration.timeoutMs,
      retries: input.integration?.retries ?? fallback.integration.retries,
      auth: {
        type: normalizeAuthType(input.integration?.auth?.type),
        token: input.integration?.auth?.token,
        headerName: input.integration?.auth?.headerName,
        apiKey: input.integration?.auth?.apiKey,
        username: input.integration?.auth?.username,
        password: input.integration?.auth?.password,
      },
      headers: input.integration?.headers,
      payloadTemplate: input.integration?.payloadTemplate,
      responseMapping: input.integration?.responseMapping,
    },
    issuer: {
      legalName: input.issuer?.legalName ?? fallback.issuer.legalName,
      document: input.issuer?.document ?? fallback.issuer.document,
      stateRegistration: input.issuer?.stateRegistration,
      municipalRegistration: input.issuer?.municipalRegistration,
      taxRegime: input.issuer?.taxRegime,
      address: input.issuer?.address,
    },
    defaults: input.defaults,
    metadata: input.metadata,
  };
}

function sanitizeNfeConfiguration(
  input: NfeConfigurationWritePayload
): NfeConfigurationWritePayload {
  const normalized = normalizeNfeConfiguration(input);
  const auth = normalized.integration.auth;
  const authType = normalizeAuthType(auth?.type);

  const nextAuth =
    authType === "none"
      ? { type: "none" as const }
      : {
          type: authType,
          token: auth?.token?.trim() || undefined,
          headerName: auth?.headerName?.trim() || undefined,
          apiKey: auth?.apiKey?.trim() || undefined,
          username: auth?.username?.trim() || undefined,
          password: auth?.password?.trim() || undefined,
        };

  return {
    ...normalized,
    integration: {
      ...normalized.integration,
      provider: normalized.integration.provider.trim(),
      baseUrl: normalized.integration.baseUrl.trim(),
      issuePath: normalized.integration.issuePath.trim(),
      auth: nextAuth,
      headers: normalized.integration.headers,
      payloadTemplate: normalized.integration.payloadTemplate,
      responseMapping: normalized.integration.responseMapping,
    },
    issuer: {
      ...normalized.issuer,
      legalName: normalized.issuer.legalName.trim(),
      document: normalized.issuer.document.trim(),
      stateRegistration: normalized.issuer.stateRegistration?.trim() || undefined,
      municipalRegistration:
        normalized.issuer.municipalRegistration?.trim() || undefined,
      taxRegime: normalized.issuer.taxRegime?.trim() || undefined,
    },
  };
}

function isNotFoundError(err: DataValue): boolean {
  if (!isAppError(err)) return false;
  if (err.statusCode === 404) return true;

  const details = err.details as
    | { error?: { code?: string } }
    | undefined;
  return details?.error?.code === "CONFIG_NOT_FOUND";
}

export type WorkspaceInvoiceConfigurationBundle = {
  workspaceId: string;
  workspaceSettings: WorkspaceInvoiceSettings;
  settingsSource: "database" | "defaults";
  settingsUpdatedAt?: string;
  nfeConfiguration: NfeConfigurationWritePayload;
  nfeResolution: "workspace" | "workspace-default" | "platform" | "none";
  nfeUpdatedAt?: string;
};

export class InvoiceSettingsService {
  private api = new InvoiceSettingsApi(httpClient);

  private resolveWorkspaceId(): string | undefined {
    try {
      const ws: Workspace = companyService.getWorkspaceValue();
      const workspaceId =
        typeof ws?.workspaceId === "string"
          ? ws.workspaceId
          : typeof ws?.id === "string"
            ? ws.id
            : undefined;
      return workspaceId ? String(workspaceId) : undefined;
    } catch {
      return undefined;
    }
  }

  private resolveUserUid(): string | undefined {
    try {
      const session = usersAuthService.getSessionValue();
      return session?.uid ?? undefined;
    } catch {
      return undefined;
    }
  }

  private buildIdentityHeaders(workspaceId?: string): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    const resolvedWorkspaceId = workspaceId ?? this.resolveWorkspaceId();
    const userUid = this.resolveUserUid();

    if (resolvedWorkspaceId) headers["x-workspace-id"] = resolvedWorkspaceId;
    if (userUid) headers["x-user-uid"] = userUid;
    return headers;
  }

  async fetchWorkspaceBundle(): Promise<WorkspaceInvoiceConfigurationBundle> {
    try {
      const workspaceId = this.resolveWorkspaceId();
      if (!workspaceId) {
        throw new Error("Workspace is required to load invoice settings.");
      }

      const headers = this.buildIdentityHeaders(workspaceId);
      const settingsPromise = this.api.getWorkspaceInvoiceSettings(
        workspaceId,
        headers
      );
      const nfePromise = this.api
        .getServiceSaleNfeConfiguration(workspaceId, headers)
        .catch((err) => {
          if (isNotFoundError(err)) return null;
          throw err;
        });

      const [settingsResponse, nfeResponse] = await Promise.all([
        settingsPromise,
        nfePromise,
      ]);

      return {
        workspaceId,
        workspaceSettings: normalizeWorkspaceSettings(
          settingsResponse?.data?.settings
        ),
        settingsSource: settingsResponse?.data?.source ?? "defaults",
        settingsUpdatedAt: settingsResponse?.data?.updatedAt,
        nfeConfiguration: normalizeNfeConfiguration(
          nfeResponse?.data?.configuration
        ),
        nfeResolution: nfeResponse?.data?.resolution ?? "none",
        nfeUpdatedAt: nfeResponse?.data?.updatedAt,
      };
    } catch (err) {
      throw toAppError(err);
    }
  }

  async saveWorkspaceSettings(
    settings: WorkspaceInvoiceSettings
  ): Promise<{
    workspaceId: string;
    settings: WorkspaceInvoiceSettings;
    updatedAt?: string;
  }> {
    try {
      const workspaceId = this.resolveWorkspaceId();
      if (!workspaceId) {
        throw new Error("Workspace is required to save invoice settings.");
      }

      const headers = this.buildIdentityHeaders(workspaceId);
      const response = await this.api.upsertWorkspaceInvoiceSettings(
        {
          workspaceId,
          settings: normalizeWorkspaceSettings(settings),
          updatedByUid: this.resolveUserUid(),
        },
        headers
      );

      return {
        workspaceId: response.data.workspaceId,
        settings: normalizeWorkspaceSettings(response.data.settings),
        updatedAt: response.data.updatedAt,
      };
    } catch (err) {
      throw toAppError(err);
    }
  }

  async saveWorkspaceNfeConfiguration(
    configuration: NfeConfigurationWritePayload
  ): Promise<{
    workspaceId: string;
    configuration: NfeConfigurationWritePayload;
    updatedAt?: string;
  }> {
    try {
      const workspaceId = this.resolveWorkspaceId();
      if (!workspaceId) {
        throw new Error("Workspace is required to save NFe configuration.");
      }

      const headers = this.buildIdentityHeaders(workspaceId);
      const response = await this.api.upsertServiceSaleNfeConfiguration(
        {
          workspaceId,
          configuration: sanitizeNfeConfiguration(configuration),
          updatedByUid: this.resolveUserUid(),
        },
        headers
      );

      return {
        workspaceId: workspaceId,
        configuration: normalizeNfeConfiguration(response.data.configuration),
        updatedAt: response.data.updatedAt,
      };
    } catch (err) {
      throw toAppError(err);
    }
  }
}

export const invoiceSettingsService = new InvoiceSettingsService();

export default invoiceSettingsService;

