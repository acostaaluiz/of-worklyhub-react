import { BehaviorSubject } from "rxjs";
import { httpClient } from "@core/http/client.instance";
import { companyService, type Workspace } from "@modules/company/services/company.service";
import { usersAuthService } from "@modules/users/services/auth.service";
import { toAppError } from "@core/errors/to-app-error";

import { BillingApi, type BillingPlan, type PaymentConfig, type CheckoutRequest, type CheckoutResponse } from "./billing-api";

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
      const payload: PlansState = res?.data ? { plans: res.data.plans ?? [], payment: res.data.payment } : { plans: [], payment: { gateway: "mercadopago", configured: false } };
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
        paymentMethod: "card",
        ...payload,
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
