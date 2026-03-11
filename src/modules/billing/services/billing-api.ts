import { BaseHttpService } from "@core/http/base-http.service";
import type { HttpClient } from "@core/http/interfaces/http-client.interface";

export type BillingCycle = "monthly" | "yearly";
export type PaymentGateway = "mercadopago" | "paypal";
export type PaymentMethod = "card" | "hosted";

export type BillingPlan = {
  id: string;
  dbId: number;
  name: string;
  description?: string;
  currency: string;
  priceCents: { monthly: number; yearly: number };
  features: string[];
  recommended?: boolean;
};

export type PaymentConfig = {
  gateway: PaymentGateway;
  publicKey?: string;
  configured: boolean;
  supportedMethods?: PaymentMethod[];
};

export type PlansResponse = {
  data: { plans: BillingPlan[]; payment: PaymentConfig };
};

export type CheckoutRequest = {
  planId: string | number;
  billingCycle?: BillingCycle;
  gateway?: PaymentGateway;
  payer: { email: string; fullName?: string; company?: string };
  paymentMethod?: PaymentMethod;
  cardToken?: string;
  installments?: number;
  successUrl?: string;
  failureUrl?: string;
  pendingUrl?: string;
  metadata?: DataMap;
  workspaceId?: string;
  userUid?: string;
};

export type CheckoutResponse = {
  data: {
    id: string;
    status: string;
    type: "card" | "preference";
    provider: PaymentGateway;
    checkoutUrl?: string;
    plan: BillingPlan;
    billingCycle: BillingCycle;
    amount: number;
    amount_cents: number;
    currency: string;
  };
};

export class BillingApi extends BaseHttpService {
  constructor(http: HttpClient) {
    super(http, { correlationNamespace: "billing-api" });
  }

  async getPlans(headers?: Record<string, string>): Promise<PlansResponse> {
    return this.get<PlansResponse>("/billing/plans", undefined, headers);
  }

  async createCheckout(body: CheckoutRequest, headers?: Record<string, string>): Promise<CheckoutResponse> {
    return this.post<CheckoutResponse, CheckoutRequest>("/billing/checkout", body, headers);
  }
}

export default BillingApi;
