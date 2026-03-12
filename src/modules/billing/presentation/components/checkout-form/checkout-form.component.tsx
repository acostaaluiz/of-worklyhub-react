import React from "react";
import { Alert, Divider, Form, Input, Space, Tag, Typography, message } from "antd";
import type { FormInstance } from "antd";
import { Building2, Globe, Lock, Mail, RotateCcw, User, WalletCards } from "lucide-react";

import { FieldIcon, ButtonIcon } from "@shared/styles/global.ts";
import { BaseComponent } from "@shared/base/base.component";
import type { BaseState } from "@shared/base/interfaces/base-state.interface";
import { navigateTo } from "@core/navigation/navigation.service";
import {
  resolveTrustedExternalHosts,
  toSafeExternalUrl,
} from "@core/navigation/safe-navigation";

import {
  FormCard,
  CardBody,
  SectionTitle,
  Row,
  PrimaryButton,
  SecondaryButton,
} from "./checkout-form.component.styles";

import { billingService } from "@modules/billing/services/billing.service";
import type {
  BillingCycle,
  BillingPlan,
  PaymentGateway,
} from "@modules/billing/services/billing-api";

type CheckoutValues = {
  fullName: string;
  email: string;
  company?: string;
};

type CheckoutState = BaseState & {
  submitting: boolean;
  selectedPlanId?: string | null;
  selectedPlan?: BillingPlan | null;
  interval?: BillingCycle;
  gateway: PaymentGateway;
  paymentConfigured: boolean;
  supportedMethods: Array<"card" | "hosted">;
};

function gatewayLabel(gateway: PaymentGateway): string {
  if (gateway === "paypal") return "PayPal";
  return "Mercado Pago";
}

const CHECKOUT_GATEWAY_HOSTS: Record<PaymentGateway, readonly string[]> = {
  mercadopago: [
    "mercadopago.com",
    "mercadopago.com.br",
    "mercadopago.com.ar",
    "mercadopago.com.mx",
    "mercadopago.com.co",
    "mercadopago.com.uy",
  ],
  paypal: ["paypal.com"],
};

export class CheckoutForm extends BaseComponent<{}, CheckoutState> {
  private formRef = React.createRef<FormInstance<CheckoutValues>>();

  public override state: CheckoutState = {
    isLoading: false,
    error: undefined,
    submitting: false,
    selectedPlanId: undefined,
    selectedPlan: undefined,
    interval: "monthly",
    gateway: "mercadopago",
    paymentConfigured: false,
    supportedMethods: ["hosted"],
  };

  override componentDidMount(): void {
    super.componentDidMount();
    this.bootstrap();
  }

  private bootstrap = async () => {
    await this.runAsync(
      async () => {
        const selectedPlanId =
          sessionStorage.getItem("billing.selectedPlanId") ?? undefined;
        const interval =
          (sessionStorage.getItem("billing.selectedPlanInterval") as BillingCycle) ??
          "monthly";

        const plansState = await billingService.fetchPlans();
        const selectedPlan =
          plansState?.plans?.find((p) => String(p.id) === String(selectedPlanId)) ??
          plansState?.plans?.find((p) => p.recommended) ??
          plansState?.plans?.[0] ??
          null;

        this.setSafeState({
          selectedPlanId: selectedPlan ? String(selectedPlan.id) : selectedPlanId ?? null,
          selectedPlan,
          interval,
          gateway: plansState?.payment?.gateway ?? "mercadopago",
          paymentConfigured: plansState?.payment?.configured ?? false,
          supportedMethods: plansState?.payment?.supportedMethods ?? ["hosted"],
        });
      },
      { swallowError: true, setLoading: false }
    );
  };

  private describeError(error: DataValue | Error): string {
    if (error instanceof Error && error.message?.trim()) return error.message;
    if (typeof error === "string" && error.trim()) return error;
    if (error && typeof error === "object") {
      const maybeMessage = (error as { message?: unknown }).message;
      if (typeof maybeMessage === "string" && maybeMessage.trim()) return maybeMessage;
      const maybeCode = (error as { code?: unknown }).code;
      if (typeof maybeCode === "string" && maybeCode.trim()) {
        return `Checkout error (${maybeCode}). Please try again.`;
      }
    }
    return "Unable to contact the payment gateway right now. Please try again.";
  }

  private handleRetry = async (): Promise<void> => {
    this.clearError();
    await this.bootstrap();
  };

  protected override renderError(error: DataValue | Error): React.ReactNode {
    return (
      <FormCard className="surface" styles={{ body: { padding: 0 } }}>
        <CardBody>
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <Typography.Title level={4} style={{ margin: 0 }}>
              Checkout unavailable
            </Typography.Title>

            <Alert
              type="error"
              showIcon
              message="Payment gateway returned an error"
              description={this.describeError(error)}
            />

            <Row style={{ justifyContent: "space-between" }}>
              <SecondaryButton size="large" onClick={() => navigateTo("/billing/plans")}>
                Back to plans
              </SecondaryButton>

              <PrimaryButton
                type="primary"
                size="large"
                onClick={() => {
                  void this.handleRetry();
                }}
              >
                <ButtonIcon aria-hidden>
                  <RotateCcw size={16} />
                </ButtonIcon>
                Try again
              </PrimaryButton>
            </Row>
          </Space>
        </CardBody>
      </FormCard>
    );
  }

  private buildHostedReturnUrls(): {
    successUrl: string;
    failureUrl: string;
    pendingUrl: string;
  } {
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://app.worklyhub.com";
    return {
      successUrl: `${origin}/billing/checkout?status=success`,
      failureUrl: `${origin}/billing/checkout?status=failure`,
      pendingUrl: `${origin}/billing/checkout?status=pending`,
    };
  }

  private resolveSafeCheckoutUrl(url: string): string | null {
    const trustedHosts = resolveTrustedExternalHosts({
      envKeys: ["VITE_ALLOWED_CHECKOUT_HOSTS", "VITE_ALLOWED_EXTERNAL_HOSTS"],
      extraHosts: CHECKOUT_GATEWAY_HOSTS[this.state.gateway],
      includeApiBaseUrlHost: false,
      includeWindowHost: false,
    });
    return toSafeExternalUrl(url, { allowedHosts: trustedHosts });
  }

  protected override renderView(): React.ReactNode {
    const handleSubmit = async (values: CheckoutValues) => {
      if (!this.state.selectedPlanId) {
        message.error("Select a plan before finishing payment.");
        return;
      }

      if (!this.state.paymentConfigured) {
        message.error("Payment provider is not configured. Please try again later.");
        return;
      }

      this.setSafeState({ submitting: true, error: undefined });

      try {
        const hostedUrls = this.buildHostedReturnUrls();

        const res = await billingService.createCheckout({
          planId: this.state.selectedPlanId,
          billingCycle: (this.state.interval ?? "monthly") as BillingCycle,
          gateway: this.state.gateway,
          payer: {
            email: values.email,
            fullName: values.fullName,
            company: values.company,
          },
          paymentMethod: "hosted",
          successUrl: hostedUrls.successUrl,
          failureUrl: hostedUrls.failureUrl,
          pendingUrl: hostedUrls.pendingUrl,
          metadata: {
            origin: "web",
            checkoutMode: "hosted",
            gateway: this.state.gateway,
          },
        });

        const data = res?.data;
        if (data?.type === "preference" && data.checkoutUrl) {
          const safeCheckoutUrl = this.resolveSafeCheckoutUrl(data.checkoutUrl);
          if (!safeCheckoutUrl) {
            message.error("Invalid payment redirect URL. Please contact support.");
            this.setError(new Error("invalid_checkout_redirect_url"));
            return;
          }
          message.info("Redirecting to the payment provider...");
          window.location.assign(safeCheckoutUrl);
          return;
        }

        if (data?.status === "approved") {
          message.success("Payment approved!");
        } else if (data?.status === "pending") {
          message.info(
            "Payment pending confirmation. We will notify you once it is approved."
          );
        } else {
          message.success("Checkout created.");
        }
      } catch (err) {
        const msg =
          err instanceof Error && err.message
            ? err.message
            : "Failed to create checkout.";
        message.error(msg);
        this.setError(err);
      } finally {
        this.setSafeState({ submitting: false });
      }
    };

    const { gateway, paymentConfigured } = this.state;

    return (
      <FormCard className="surface" styles={{ body: { padding: 0 } }}>
        <CardBody>
          <Space direction="vertical" size={14} style={{ width: "100%", flex: 1 }}>
            <div>
              <Typography.Title level={4} style={{ margin: 0 }}>
                Checkout details
              </Typography.Title>
              <Typography.Text type="secondary">
                Payment is completed on the selected gateway page. No card fields are
                handled here.
              </Typography.Text>
            </div>

            <Alert
              type="info"
              showIcon
              icon={<Globe size={16} />}
              message={`Gateway: ${gatewayLabel(gateway)}`}
              description="You will be redirected to a secure hosted checkout to finish payment."
            />

            {!paymentConfigured ? (
              <Alert
                type="warning"
                showIcon
                message="Payment temporarily unavailable"
                description="Gateway credentials are not configured yet."
              />
            ) : null}

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Tag icon={<WalletCards size={12} />}>{gatewayLabel(gateway)}</Tag>
              <Tag icon={<Lock size={12} />}>Hosted checkout</Tag>
            </div>

            <Form<CheckoutValues>
              ref={this.formRef}
              layout="vertical"
              requiredMark={false}
              initialValues={{
                fullName: "",
                email: "",
                company: "",
              }}
              onFinish={handleSubmit}
              style={{ width: "100%", display: "flex", flexDirection: "column", flex: 1 }}
            >
              <SectionTitle>
                <Typography.Text strong>Contact</Typography.Text>
              </SectionTitle>

              <Row>
                <Form.Item<CheckoutValues>
                  label="Full name"
                  name="fullName"
                  rules={[{ required: true, message: "Full name is required" }]}
                  style={{ marginBottom: 0, flex: 1 }}
                >
                  <Input
                    size="large"
                    placeholder="Enter your full name"
                    prefix={
                      <FieldIcon aria-hidden>
                        <User size={18} />
                      </FieldIcon>
                    }
                  />
                </Form.Item>
              </Row>

              <Row>
                <Form.Item<CheckoutValues>
                  label="Email"
                  name="email"
                  rules={[
                    { required: true, message: "Email is required" },
                    { type: "email", message: "Enter a valid email" },
                  ]}
                  style={{ marginBottom: 0, flex: 1 }}
                >
                  <Input
                    size="large"
                    placeholder="Enter your email"
                    autoComplete="email"
                    prefix={
                      <FieldIcon aria-hidden>
                        <Mail size={18} />
                      </FieldIcon>
                    }
                  />
                </Form.Item>
              </Row>

              <Row>
                <Form.Item<CheckoutValues>
                  label="Company (optional)"
                  name="company"
                  style={{ marginBottom: 0, flex: 1 }}
                >
                  <Input
                    size="large"
                    placeholder="Company name"
                    prefix={
                      <FieldIcon aria-hidden>
                        <Building2 size={18} />
                      </FieldIcon>
                    }
                  />
                </Form.Item>
              </Row>

              <Divider style={{ margin: "var(--space-5) 0" }} />

              <Row style={{ justifyContent: "space-between", marginTop: "auto" }}>
                <SecondaryButton
                  size="large"
                  htmlType="button"
                  onClick={() => navigateTo("/billing/plans")}
                >
                  Change plan
                </SecondaryButton>

                <PrimaryButton
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={this.state.submitting}
                  disabled={!paymentConfigured}
                >
                  <ButtonIcon aria-hidden>
                    <Lock size={18} />
                  </ButtonIcon>
                  Continue to gateway
                </PrimaryButton>
              </Row>
            </Form>
          </Space>
        </CardBody>
      </FormCard>
    );
  }
}

export default CheckoutForm;
