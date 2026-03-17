import React from "react";
import { Alert, Divider, Form, Input, Space, Tag, Typography, message } from "antd";
import type { FormInstance } from "antd";
import { Building2, Globe, Lock, Mail, RotateCcw, User, WalletCards } from "lucide-react";
import { i18n as appI18n } from "@core/i18n";

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
  if (gateway === "paypal") return appI18n.t("billing.checkout.gateway.paypal");
  return appI18n.t("billing.checkout.gateway.mercadopago");
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
        return appI18n.t("billing.checkout.descriptions.checkoutErrorWithCode", {
          code: maybeCode,
        });
      }
    }
    return appI18n.t("billing.checkout.descriptions.gatewayUnavailable");
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
              {appI18n.t("billing.checkout.errorView.title")}
            </Typography.Title>

            <Alert
              type="error"
              showIcon
              message={appI18n.t("billing.checkout.errorView.alertTitle")}
              description={this.describeError(error)}
            />

            <Row style={{ justifyContent: "space-between" }}>
              <SecondaryButton size="large" onClick={() => navigateTo("/billing/plans")}>
                {appI18n.t("billing.checkout.errorView.backToPlans")}
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
                {appI18n.t("billing.checkout.errorView.tryAgain")}
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
        message.error(appI18n.t("billing.checkout.messages.selectPlan"));
        return;
      }

      if (!this.state.paymentConfigured) {
        message.error(appI18n.t("billing.checkout.messages.providerNotConfigured"));
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
            message.error(appI18n.t("billing.checkout.messages.invalidRedirectUrl"));
            this.setError(new Error("invalid_checkout_redirect_url"));
            return;
          }
          message.info(appI18n.t("billing.checkout.messages.redirecting"));
          window.location.assign(safeCheckoutUrl);
          return;
        }

        if (data?.status === "approved") {
          message.success(appI18n.t("billing.checkout.messages.paymentApproved"));
        } else if (data?.status === "pending") {
          message.info(appI18n.t("billing.checkout.messages.paymentPending"));
        } else {
          message.success(appI18n.t("billing.checkout.messages.checkoutCreated"));
        }
      } catch (err) {
        const msg =
          err instanceof Error && err.message
            ? err.message
            : appI18n.t("billing.checkout.messages.failedCreateCheckout");
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
                {appI18n.t("billing.checkout.form.title")}
              </Typography.Title>
              <Typography.Text type="secondary">
                {appI18n.t("billing.checkout.form.subtitle")}
              </Typography.Text>
            </div>

            <Alert
              type="info"
              showIcon
              icon={<Globe size={16} />}
              message={appI18n.t("billing.checkout.form.gatewayMessage", {
                gateway: gatewayLabel(gateway),
              })}
              description={appI18n.t("billing.checkout.form.gatewayDescription")}
            />

            {!paymentConfigured ? (
              <Alert
                type="warning"
                showIcon
                message={appI18n.t("billing.checkout.form.temporarilyUnavailable")}
                description={appI18n.t("billing.checkout.form.credentialsMissing")}
              />
            ) : null}

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Tag icon={<WalletCards size={12} />}>{gatewayLabel(gateway)}</Tag>
              <Tag icon={<Lock size={12} />}>{appI18n.t("billing.checkout.form.hostedTag")}</Tag>
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
                <Typography.Text strong>{appI18n.t("billing.checkout.form.contact")}</Typography.Text>
              </SectionTitle>

              <Row>
                <Form.Item<CheckoutValues>
                  label={appI18n.t("billing.checkout.form.fullName")}
                  name="fullName"
                  rules={[{ required: true, message: appI18n.t("billing.checkout.form.fullNameRequired") }]}
                  style={{ marginBottom: 0, flex: 1 }}
                >
                  <Input
                    size="large"
                    placeholder={appI18n.t("billing.checkout.form.fullNamePlaceholder")}
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
                  label={appI18n.t("billing.checkout.form.email")}
                  name="email"
                  rules={[
                    { required: true, message: appI18n.t("billing.checkout.form.emailRequired") },
                    { type: "email", message: appI18n.t("billing.checkout.form.emailInvalid") },
                  ]}
                  style={{ marginBottom: 0, flex: 1 }}
                >
                  <Input
                    size="large"
                    placeholder={appI18n.t("billing.checkout.form.emailPlaceholder")}
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
                  label={appI18n.t("billing.checkout.form.companyOptional")}
                  name="company"
                  style={{ marginBottom: 0, flex: 1 }}
                >
                  <Input
                    size="large"
                    placeholder={appI18n.t("billing.checkout.form.companyPlaceholder")}
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
                  {appI18n.t("billing.checkout.form.changePlan")}
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
                  {appI18n.t("billing.checkout.form.continueGateway")}
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
