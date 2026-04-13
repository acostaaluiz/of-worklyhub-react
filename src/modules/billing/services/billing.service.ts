import { BehaviorSubject } from "rxjs";
import { httpClient } from "@core/http/client.instance";
import { companyService, type Workspace } from "@modules/company/services/company.service";
import { toAppError } from "@core/errors/to-app-error";

import {
  BillingApi,
  type BillingPlan,
  type PaymentConfig,
  type CheckoutRequest,
  type CheckoutResponse,
  type EmployeeAddonCheckoutRequest,
  type EmployeeAddonCheckoutResponse,
  type AiTokenTopupCheckoutRequest,
  type AiTokenTopupCheckoutResponse,
  type PaymentGateway,
  type WorkspaceEmployeeCapacity,
  type WorkspaceEmployeeAddonContract,
  type WorkspaceEmployeeAddonContractStatus,
  type CancelWorkspaceEmployeeAddonContractResponse,
} from "./billing-api";

type PlansState = { plans: BillingPlan[]; payment: PaymentConfig } | null;

export class BillingService {
  private api = new BillingApi(httpClient);
  private plans$ = new BehaviorSubject<PlansState>(null);
  private pendingFetchPlans: Promise<PlansState> | null = null;

  getPlans$() {
    return this.plans$.asObservable();
  }

  getPlansValue(): PlansState {
    return this.plans$.getValue();
  }

  private resolveGatewayFlag(): PaymentGateway | undefined {
    const runtimeEnv = (globalThis as { __WORKLYHUB_RUNTIME_ENV__?: Record<string, string | undefined> })
      .__WORKLYHUB_RUNTIME_ENV__;
    const processEnv =
      typeof process !== "undefined"
        ? (process.env as Record<string, string | undefined>)
        : undefined;
    const raw = runtimeEnv?.VITE_BILLING_ACTIVE_GATEWAY ?? processEnv?.VITE_BILLING_ACTIVE_GATEWAY;
    if (!raw) return undefined;
    const normalized = String(raw).trim().toLowerCase();
    if (normalized === "mercadopago" || normalized === "paypal") return normalized;
    return undefined;
  }

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

  private buildIdentityHeaders(): Record<string, string> {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const workspaceId = this.resolveWorkspaceId();

    if (workspaceId) headers["x-workspace-id"] = workspaceId;

    return headers;
  }

  async fetchPlans(force = false): Promise<PlansState> {
    const existing = this.getPlansValue();
    if (existing && !force) return existing;
    if (this.pendingFetchPlans) return this.pendingFetchPlans;

    this.pendingFetchPlans = (async () => {
      const headers = this.buildIdentityHeaders();
      const res = await this.api.getPlans(headers);
      const fallbackGateway = this.resolveGatewayFlag() ?? "mercadopago";
      const fallbackMethods: NonNullable<PaymentConfig["supportedMethods"]> =
        fallbackGateway === "paypal" ? ["hosted"] : ["card", "hosted"];
      const payload: PlansState = res?.data
        ? { plans: res.data.plans ?? [], payment: res.data.payment }
        : {
            plans: [],
            payment: {
              gateway: fallbackGateway,
              configured: false,
              supportedMethods: fallbackMethods,
            },
          };
      this.plans$.next(payload);
      return payload;
    })();

    try {
      return await this.pendingFetchPlans;
    } finally {
      this.pendingFetchPlans = null;
    }
  }

  async createCheckout(payload: CheckoutRequest): Promise<CheckoutResponse> {
    try {
      const workspaceId = payload.workspaceId ?? this.resolveWorkspaceId();

      const headers = this.buildIdentityHeaders();

      const body: CheckoutRequest = {
        billingCycle: "monthly",
        paymentMethod: "hosted",
        ...payload,
        gateway:
          payload.gateway ??
          this.getPlansValue()?.payment?.gateway ??
          this.resolveGatewayFlag() ??
          "mercadopago",
        ...(workspaceId ? { workspaceId } : {}),
      };

      return await this.api.createCheckout(body, headers);
    } catch (err) {
      throw toAppError(err);
    }
  }

  async fetchWorkspaceEmployeeCapacity(
    workspaceId?: string
  ): Promise<WorkspaceEmployeeCapacity> {
    try {
      const resolvedWorkspaceId = workspaceId ?? this.resolveWorkspaceId();
      if (!resolvedWorkspaceId) {
        throw new Error("workspace_id_required");
      }
      const headers = this.buildIdentityHeaders();
      const res = await this.api.getWorkspaceEmployeeCapacity(
        resolvedWorkspaceId,
        headers
      );
      if (!res?.data) {
        throw new Error("workspace_employee_capacity_not_found");
      }
      return res.data;
    } catch (err) {
      throw toAppError(err);
    }
  }

  async createEmployeeAddonCheckout(
    payload: EmployeeAddonCheckoutRequest & { workspaceId?: string }
  ): Promise<EmployeeAddonCheckoutResponse> {
    try {
      const resolvedWorkspaceId = payload.workspaceId ?? this.resolveWorkspaceId();
      if (!resolvedWorkspaceId) {
        throw new Error("workspace_id_required");
      }

      const headers = this.buildIdentityHeaders();
      const body: EmployeeAddonCheckoutRequest = {
        additionalEmployees: payload.additionalEmployees,
        billingCycle: payload.billingCycle ?? "monthly",
        gateway:
          payload.gateway ??
          this.getPlansValue()?.payment?.gateway ??
          this.resolveGatewayFlag() ??
          "mercadopago",
        payer: payload.payer,
        paymentMethod: payload.paymentMethod ?? "hosted",
        cardToken: payload.cardToken,
        installments: payload.installments,
        successUrl: payload.successUrl,
        failureUrl: payload.failureUrl,
        pendingUrl: payload.pendingUrl,
        metadata: payload.metadata,
      };

      return await this.api.createEmployeeAddonCheckout(
        resolvedWorkspaceId,
        body,
        headers
      );
    } catch (err) {
      throw toAppError(err);
    }
  }

  async fetchWorkspaceEmployeeAddonContracts(input?: {
    workspaceId?: string;
    status?: WorkspaceEmployeeAddonContractStatus | "all";
  }): Promise<WorkspaceEmployeeAddonContract[]> {
    try {
      const resolvedWorkspaceId = input?.workspaceId ?? this.resolveWorkspaceId();
      if (!resolvedWorkspaceId) {
        throw new Error("workspace_id_required");
      }

      const headers = this.buildIdentityHeaders();
      const res = await this.api.getWorkspaceEmployeeAddonContracts(
        resolvedWorkspaceId,
        input?.status ? { status: input.status } : undefined,
        headers
      );
      return res?.data?.contracts ?? [];
    } catch (err) {
      throw toAppError(err);
    }
  }

  async cancelWorkspaceEmployeeAddonContract(input: {
    contractId: string;
    workspaceId?: string;
    reason?: string;
  }): Promise<CancelWorkspaceEmployeeAddonContractResponse["data"]> {
    try {
      const resolvedWorkspaceId = input.workspaceId ?? this.resolveWorkspaceId();
      if (!resolvedWorkspaceId) {
        throw new Error("workspace_id_required");
      }
      const contractId = String(input.contractId ?? "").trim();
      if (!contractId) {
        throw new Error("workspace_addon_contract_id_required");
      }

      const headers = this.buildIdentityHeaders();
      const res = await this.api.cancelWorkspaceEmployeeAddonContract(
        resolvedWorkspaceId,
        contractId,
        input.reason ? { reason: input.reason } : undefined,
        headers
      );
      if (!res?.data) {
        throw new Error("workspace_addon_contract_cancel_failed");
      }
      return res.data;
    } catch (err) {
      throw toAppError(err);
    }
  }

  async createAiTokenTopupCheckout(
    payload: AiTokenTopupCheckoutRequest & { workspaceId?: string }
  ): Promise<AiTokenTopupCheckoutResponse> {
    try {
      const resolvedWorkspaceId = payload.workspaceId ?? this.resolveWorkspaceId();
      if (!resolvedWorkspaceId) {
        throw new Error("workspace_id_required");
      }

      const headers = this.buildIdentityHeaders();
      const body: AiTokenTopupCheckoutRequest = {
        packageId: String(payload.packageId),
        gateway:
          payload.gateway ??
          this.getPlansValue()?.payment?.gateway ??
          this.resolveGatewayFlag() ??
          "mercadopago",
        payer: payload.payer,
        paymentMethod: payload.paymentMethod ?? "hosted",
        cardToken: payload.cardToken,
        installments: payload.installments,
        successUrl: payload.successUrl,
        failureUrl: payload.failureUrl,
        pendingUrl: payload.pendingUrl,
        metadata: payload.metadata,
      };

      return await this.api.createAiTokenTopupCheckout(
        resolvedWorkspaceId,
        body,
        headers
      );
    } catch (err) {
      throw toAppError(err);
    }
  }
}

export const billingService = new BillingService();

export default billingService;
