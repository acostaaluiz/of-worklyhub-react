import { BehaviorSubject } from "rxjs";
import { httpClient } from "@core/http/client.instance";
import { companyService, type Workspace } from "@modules/company/services/company.service";
import { usersAuthService } from "@modules/users/services/auth.service";
import { toAppError } from "@core/errors/to-app-error";

import {
  BillingApi,
  type BillingPlan,
  type PaymentConfig,
  type CheckoutRequest,
  type CheckoutResponse,
  type PaymentGateway,
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

  private resolveUserUid(): string | undefined {
    try {
      const session = usersAuthService.getSessionValue();
      return session?.uid ?? undefined;
    } catch {
      return undefined;
    }
  }

  private buildIdentityHeaders(): Record<string, string> {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const workspaceId = this.resolveWorkspaceId();
    const userUid = this.resolveUserUid();

    if (workspaceId) headers["x-workspace-id"] = workspaceId;
    if (userUid) headers["x-user-uid"] = userUid;

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
      const userUid = payload.userUid ?? this.resolveUserUid();

      if (!workspaceId) throw new Error("Workspace is required to create checkout.");
      if (!userUid) throw new Error("User identity is required to create checkout.");

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
        workspaceId,
        userUid,
      };

      return await this.api.createCheckout(body, headers);
    } catch (err) {
      throw toAppError(err);
    }
  }
}

export const billingService = new BillingService();

export default billingService;
