import React from "react";
import {
  Alert,
  Divider,
  Form,
  Input,
  InputNumber,
  Space,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";
import type { FormInstance } from "antd";
import { Building2, CircleHelp, Lock, Mail, RotateCcw, User, WalletCards } from "lucide-react";
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
import { companyService } from "@modules/company/services/company.service";
import { usersAuthService } from "@modules/users/services/auth.service";
import { usersOverviewService } from "@modules/users/services/overview.service";
import { isActivePlan } from "@modules/users/services/plan-status";
import type {
  BillingCycle,
  BillingPlan,
  AiTokenTopupCheckoutResponse,
  EmployeeAddonCheckoutResponse,
  PaymentGateway,
  WorkspaceEmployeeCapacity,
} from "@modules/billing/services/billing-api";
import {
  getAiTokenTopupSelection,
  getBillingCheckoutKind,
  getEmployeeAddonSelection,
  onBillingCheckoutSessionChange,
  setEmployeeAddonSelection,
  type AiTokenTopupSelection,
  type BillingCheckoutKind,
  type EmployeeAddonSelection,
} from "@modules/billing/services/billing-checkout-session";
import { formatMoney } from "@core/utils/currency";

type CheckoutValues = {
  fullName: string;
  email: string;
  company?: string;
};

type CheckoutState = BaseState & {
  submitting: boolean;
  checkoutKind: BillingCheckoutKind;
  employeeAddonSelection: EmployeeAddonSelection | null;
  employeeCapacity: WorkspaceEmployeeCapacity | null;
  aiTokenTopupSelection: AiTokenTopupSelection | null;
  selectedPlanId?: string | null;
  selectedPlan?: BillingPlan | null;
  interval?: BillingCycle;
  gateway: PaymentGateway;
  paymentConfigured: boolean;
  allowGatewayBypassInDev: boolean;
  supportedMethods: Array<"card" | "hosted">;
};

const YEARLY_MULTIPLIER = 12;

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

type SessionLike = {
  email?: string;
  claims?: {
    email?: string;
  } | null;
} | null;

export class CheckoutForm extends BaseComponent<{}, CheckoutState> {
  private formRef = React.createRef<FormInstance<CheckoutValues>>();
  private unsubscribeCheckoutSessionChange?: () => void;

  public override state: CheckoutState = {
    isLoading: false,
    error: undefined,
    submitting: false,
    checkoutKind: "plan_subscription",
    employeeAddonSelection: null,
    employeeCapacity: null,
    aiTokenTopupSelection: null,
    selectedPlanId: undefined,
    selectedPlan: undefined,
    interval: "monthly",
    gateway: "mercadopago",
    paymentConfigured: false,
    allowGatewayBypassInDev: false,
    supportedMethods: ["hosted"],
  };

  override componentDidMount(): void {
    super.componentDidMount();
    this.unsubscribeCheckoutSessionChange = onBillingCheckoutSessionChange(() => {
      const checkoutKind = getBillingCheckoutKind();
      const employeeAddonSelection = getEmployeeAddonSelection();
      const aiTokenTopupSelection = getAiTokenTopupSelection();
      const interval =
        (sessionStorage.getItem("billing.selectedPlanInterval") as BillingCycle) ??
        "monthly";

      this.setSafeState({
        checkoutKind,
        employeeAddonSelection,
        aiTokenTopupSelection,
        interval:
          checkoutKind === "employee_addon"
            ? employeeAddonSelection?.interval ?? "monthly"
            : checkoutKind === "ai_token_topup"
              ? "monthly"
              : interval,
      });
    });
    this.bootstrap();
  }

  override componentWillUnmount(): void {
    this.unsubscribeCheckoutSessionChange?.();
    this.unsubscribeCheckoutSessionChange = undefined;
    super.componentWillUnmount();
  }

  private getEmployeeAddonUnitPriceCents(
    capacity: WorkspaceEmployeeCapacity,
    interval: BillingCycle
  ): number {
    return interval === "yearly"
      ? capacity.pricing.addonUnitPriceCents.yearly
      : capacity.pricing.addonUnitPriceCents.monthly;
  }

  private buildEmployeeAddonSelection(
    capacity: WorkspaceEmployeeCapacity,
    quantity: number,
    interval: BillingCycle
  ): EmployeeAddonSelection {
    const normalizedQuantity = Math.max(1, Math.trunc(quantity));

    return {
      quantity: normalizedQuantity,
      interval,
      planName: capacity.plan.name,
      currency: capacity.plan.currency,
      unitPriceCents: this.getEmployeeAddonUnitPriceCents(capacity, interval),
      unitPriceCentsMonthly: capacity.pricing.addonUnitPriceCents.monthly,
      unitPriceCentsYearly: capacity.pricing.addonUnitPriceCents.yearly,
      baseEmployees: capacity.limits.baseEmployees,
      addonEmployees: capacity.limits.addonEmployees,
      activeEmployees: capacity.limits.activeEmployees,
      totalEmployees: capacity.limits.totalEmployees,
    };
  }

  private syncEmployeeAddonSelection(
    partial: Partial<Pick<EmployeeAddonSelection, "quantity" | "interval">>
  ): void {
    const capacity = this.state.employeeCapacity;
    if (!capacity) return;

    const current = this.state.employeeAddonSelection;
    const nextQuantity = Math.max(
      1,
      Math.trunc(partial.quantity ?? current?.quantity ?? 1)
    );
    const nextInterval: BillingCycle =
      partial.interval ?? current?.interval ?? "monthly";
    const nextSelection = this.buildEmployeeAddonSelection(
      capacity,
      nextQuantity,
      nextInterval
    );

    setEmployeeAddonSelection(nextSelection);
    this.setSafeState({
      employeeAddonSelection: nextSelection,
      interval: nextSelection.interval,
    });
  }

  private bootstrap = async () => {
    await this.runAsync(
      async () => {
        const checkoutKind = getBillingCheckoutKind();
        const employeeAddonSelectionFromSession = getEmployeeAddonSelection();
        const aiTokenTopupSelection = getAiTokenTopupSelection();
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

        let employeeCapacity: WorkspaceEmployeeCapacity | null = null;
        let employeeAddonSelection = employeeAddonSelectionFromSession;

        if (checkoutKind === "employee_addon") {
          try {
            employeeCapacity = await billingService.fetchWorkspaceEmployeeCapacity();
            employeeAddonSelection = this.buildEmployeeAddonSelection(
              employeeCapacity,
              employeeAddonSelectionFromSession?.quantity ?? 1,
              employeeAddonSelectionFromSession?.interval ?? "monthly"
            );
            setEmployeeAddonSelection(employeeAddonSelection);
          } catch {
            employeeCapacity = null;
          }
        }

        this.setSafeState({
          checkoutKind,
          employeeAddonSelection,
          employeeCapacity,
          aiTokenTopupSelection,
          selectedPlanId: selectedPlan ? String(selectedPlan.id) : selectedPlanId ?? null,
          selectedPlan,
          interval:
            checkoutKind === "employee_addon"
              ? employeeAddonSelection?.interval ?? "monthly"
              : checkoutKind === "ai_token_topup"
                ? "monthly"
                : interval,
          gateway: plansState?.payment?.gateway ?? "mercadopago",
          paymentConfigured: plansState?.payment?.configured ?? false,
          allowGatewayBypassInDev: this.resolveDevGatewayBypass(),
          supportedMethods: plansState?.payment?.supportedMethods ?? ["hosted"],
        });
      },
      { swallowError: true, setLoading: false }
    );
  };

  private resolveDevGatewayBypass(): boolean {
    const runtimeEnv = (globalThis as { __WORKLYHUB_RUNTIME_ENV__?: Record<string, string | undefined> })
      .__WORKLYHUB_RUNTIME_ENV__;
    const processEnv =
      typeof process !== "undefined"
        ? (process.env as Record<string, string | undefined>)
        : undefined;

    const raw =
      runtimeEnv?.VITE_BILLING_DEV_BYPASS_GATEWAY ??
      processEnv?.VITE_BILLING_DEV_BYPASS_GATEWAY;

    if (!raw) return false;

    const normalized = String(raw).trim().toLowerCase();
    return (
      normalized === "1" ||
      normalized === "true" ||
      normalized === "yes" ||
      normalized === "on"
    );
  }

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

  private resolveSelectionRoute(): string {
    if (this.state.checkoutKind === "employee_addon") return "/billing/employees";
    if (this.state.checkoutKind === "ai_token_topup") return "/billing/ai-tokens";
    return "/billing/plans";
  }

  protected override renderError(error: DataValue | Error): React.ReactNode {
    return (
      <FormCard className="surface" styles={{ body: { padding: 0 } }} data-cy="billing-checkout-error-card">
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
              <SecondaryButton size="large" onClick={() => navigateTo(this.resolveSelectionRoute())} data-cy="billing-checkout-error-back-button">
                {appI18n.t("billing.checkout.errorView.backToPlans")}
              </SecondaryButton>

                <PrimaryButton
                  type="primary"
                  size="large"
                  onClick={() => {
                    void this.handleRetry();
                  }}
                  data-cy="billing-checkout-error-retry-button"
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

  private resolveSessionEmail(session: SessionLike): string | undefined {
    const fromSession = session?.email;
    if (typeof fromSession === "string" && fromSession.trim().length > 0) {
      return fromSession.trim();
    }

    const fromClaims = session?.claims?.email;
    if (typeof fromClaims === "string" && fromClaims.trim().length > 0) {
      return fromClaims.trim();
    }

    return undefined;
  }

  private async resolvePostCheckoutRoute(): Promise<string> {
    let profile = usersOverviewService.getOverviewValue()?.profile ?? null;
    let resolvedEmail =
      profile?.email ?? this.resolveSessionEmail(usersAuthService.getSessionValue() as SessionLike);

    try {
      const overview = await usersOverviewService.fetchOverview();
      if (overview?.profile) {
        profile = overview.profile;
        resolvedEmail = overview.profile.email ?? resolvedEmail;
      }
    } catch {
      // keep cached profile/email when overview request fails
    }

    let workspaceExists = companyService.getWorkspaceValue() ? true : false;
    if (resolvedEmail) {
      try {
        const workspace = await companyService.fetchWorkspaceByEmail(resolvedEmail);
        workspaceExists = workspace ? true : false;
      } catch {
        workspaceExists = companyService.getWorkspaceValue() ? true : false;
      }
    }

    if (!workspaceExists) return "/company/introduction";
    if (isActivePlan(profile)) return "/home";
    return "/billing/plans";
  }

  protected override renderView(): React.ReactNode {
    const handleSubmit = async (values: CheckoutValues) => {
      const isEmployeeAddonCheckout = this.state.checkoutKind === "employee_addon";
      const isAiTokenTopupCheckout = this.state.checkoutKind === "ai_token_topup";
      const isPlanCheckout =
        !isEmployeeAddonCheckout && !isAiTokenTopupCheckout;

      if (isPlanCheckout && !this.state.selectedPlanId) {
        message.error(appI18n.t("billing.checkout.messages.selectPlan"));
        return;
      }
      if (isEmployeeAddonCheckout && !this.state.employeeAddonSelection) {
        message.error(appI18n.t("billing.checkout.messages.selectEmployeeAddon"));
        return;
      }
      if (isAiTokenTopupCheckout && !this.state.aiTokenTopupSelection) {
        message.error(appI18n.t("billing.checkout.messages.selectAiTokenTopup"));
        return;
      }

      const bypassGatewayInDev = this.state.allowGatewayBypassInDev;
      const paymentReady = this.state.paymentConfigured || bypassGatewayInDev;

      if (!paymentReady) {
        message.error(appI18n.t("billing.checkout.messages.providerNotConfigured"));
        return;
      }

      this.setSafeState({ submitting: true, error: undefined });

      try {
        const hostedUrls = this.buildHostedReturnUrls();

        const response: { data?: DataMap } =
          isEmployeeAddonCheckout
            ? ((await billingService.createEmployeeAddonCheckout({
                additionalEmployees:
                  this.state.employeeAddonSelection?.quantity ?? 1,
                billingCycle:
                  (this.state.employeeAddonSelection?.interval ??
                    this.state.interval ??
                    "monthly") as BillingCycle,
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
                  checkoutKind: "employee_addon",
                  devBypassGateway: bypassGatewayInDev,
                },
              })) as EmployeeAddonCheckoutResponse)
            : isAiTokenTopupCheckout
              ? ((await billingService.createAiTokenTopupCheckout({
                  packageId: this.state.aiTokenTopupSelection?.packageId ?? "",
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
                  checkoutKind: "ai_token_topup",
                  tokens: this.state.aiTokenTopupSelection?.tokens ?? 0,
                  packageId: this.state.aiTokenTopupSelection?.packageId ?? null,
                  devBypassGateway: bypassGatewayInDev,
                },
              })) as AiTokenTopupCheckoutResponse)
              : ((await billingService.createCheckout({
                  planId: String(this.state.selectedPlanId),
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
                  devBypassGateway: bypassGatewayInDev,
                },
              })) as { data?: DataMap });

        const data = (response?.data ?? null) as DataMap | null;
        const checkoutUrl =
          typeof data?.checkoutUrl === "string" ? data.checkoutUrl : undefined;
        if (data?.type === "preference" && checkoutUrl) {
          const safeCheckoutUrl = this.resolveSafeCheckoutUrl(checkoutUrl);
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
          if (isPlanCheckout) {
            const planData =
              data?.plan && typeof data.plan === "object"
                ? (data.plan as DataMap)
                : null;
            const planNumber = Number(planData?.dbId ?? planData?.id);
            const planTitle =
              typeof planData?.name === "string" ? planData.name : undefined;
            usersOverviewService.setActivePlanFromCheckout({
              email:
                values.email ??
                this.resolveSessionEmail(usersAuthService.getSessionValue() as SessionLike),
              name: values.fullName,
              planId: Number.isFinite(planNumber) ? planNumber : undefined,
              planTitle,
            });
            try {
              // Always sync with backend entitlement after approved checkout
              // to avoid keeping stale modules from a previous plan.
              await usersOverviewService.fetchOverview(true);
            } catch {
              // keep optimistic overview as fallback
            }
          }

          message.success(
            isEmployeeAddonCheckout
              ? appI18n.t("billing.checkout.messages.employeeAddonApproved")
              : isAiTokenTopupCheckout
                ? appI18n.t("billing.checkout.messages.aiTokenTopupApproved")
                : appI18n.t("billing.checkout.messages.paymentApproved")
          );
          const nextRoute = isEmployeeAddonCheckout
            ? "/people/home"
            : isAiTokenTopupCheckout
              ? "/users?tab=ai-tokens"
              : await this.resolvePostCheckoutRoute();
          navigateTo(nextRoute, { replace: true });
          return;
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

    const { gateway, paymentConfigured, allowGatewayBypassInDev } = this.state;
    const isEmployeeAddonCheckout = this.state.checkoutKind === "employee_addon";
    const isAiTokenTopupCheckout = this.state.checkoutKind === "ai_token_topup";
    const paymentReady = paymentConfigured || allowGatewayBypassInDev;
    const employeeAddonSelection = this.state.employeeAddonSelection;
    const employeeCapacity = this.state.employeeCapacity;
    const employeeAddonTotalPriceCents = employeeAddonSelection
      ? employeeAddonSelection.quantity * employeeAddonSelection.unitPriceCents
      : 0;

    return (
      <FormCard className="surface" styles={{ body: { padding: 0 } }} data-cy="billing-checkout-form-card">
        <CardBody>
          <Space direction="vertical" size={14} style={{ width: "100%", flex: 1 }}>
            <div>
              <Typography.Title level={4} style={{ margin: 0 }}>
                {isEmployeeAddonCheckout
                  ? appI18n.t("billing.checkout.form.employeeAddonTitle")
                  : isAiTokenTopupCheckout
                    ? appI18n.t("billing.checkout.form.aiTokenTopupTitle")
                    : appI18n.t("billing.checkout.form.title")}
              </Typography.Title>
              <Typography.Text type="secondary">
                {isEmployeeAddonCheckout
                  ? appI18n.t("billing.checkout.form.employeeAddonSubtitle")
                  : isAiTokenTopupCheckout
                    ? appI18n.t("billing.checkout.form.aiTokenTopupSubtitle")
                    : appI18n.t("billing.checkout.form.subtitle")}
              </Typography.Text>
            </div>

            <Tooltip
              title={
                <Space direction="vertical" size={4}>
                  <Typography.Text style={{ color: "inherit" }} strong>
                    {appI18n.t("billing.checkout.form.gatewayMessage", {
                      gateway: gatewayLabel(gateway),
                    })}
                  </Typography.Text>
                  <Typography.Text style={{ color: "inherit" }}>
                    {appI18n.t("billing.checkout.form.gatewayDescription")}
                  </Typography.Text>
                </Space>
              }
            >
              <Typography.Text
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: "help",
                }}
              >
                <CircleHelp size={15} />
                {appI18n.t("billing.checkout.form.gatewayInfoLabel")}
              </Typography.Text>
            </Tooltip>

            {!paymentConfigured ? (
              <Alert
                type={allowGatewayBypassInDev ? "info" : "warning"}
                showIcon
                message={
                  allowGatewayBypassInDev
                    ? appI18n.t("billing.checkout.form.devBypassEnabledTitle")
                    : appI18n.t("billing.checkout.form.temporarilyUnavailable")
                }
                description={
                  allowGatewayBypassInDev
                    ? appI18n.t("billing.checkout.form.devBypassEnabledDescription")
                    : appI18n.t("billing.checkout.form.credentialsMissing")
                }
              />
            ) : null}

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Tag>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <WalletCards size={12} />
                  <span>{gatewayLabel(gateway)}</span>
                </span>
              </Tag>
              <Tag>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <Lock size={12} />
                  <span>{appI18n.t("billing.checkout.form.hostedTag")}</span>
                </span>
              </Tag>
            </div>

            {isEmployeeAddonCheckout && employeeAddonSelection && employeeCapacity ? (
              <Space direction="vertical" size={12} style={{ width: "100%" }}>
                <SectionTitle>
                  <Typography.Text strong>
                    {appI18n.t("billing.employeeCapacity.selector.title")}
                  </Typography.Text>
                </SectionTitle>

                <Row style={{ alignItems: "center", gap: 12 }}>
                  <Typography.Text>
                    {appI18n.t("billing.employeeCapacity.selector.quantity")}
                  </Typography.Text>
                  <InputNumber
                    min={1}
                    max={200}
                    value={employeeAddonSelection.quantity}
                    onChange={(value) =>
                      this.syncEmployeeAddonSelection({
                        quantity:
                          typeof value === "number" && Number.isFinite(value)
                            ? value
                            : 1,
                      })
                    }
                    data-cy="billing-checkout-employee-addon-quantity-input"
                  />
                </Row>

                <Tooltip
                  title={appI18n.t(
                    "billing.employeeCapacity.selector.pricingDescription",
                    {
                      quantity: employeeAddonSelection.quantity,
                      totalPrice: formatMoney(employeeAddonTotalPriceCents, {
                        currency: employeeAddonSelection.currency,
                      }),
                      totalEmployees:
                        employeeCapacity.limits.totalEmployees +
                        employeeAddonSelection.quantity,
                      interval:
                        employeeAddonSelection.interval === "yearly"
                          ? appI18n.t(
                              "billing.employeeCapacity.selector.interval.yearly"
                            )
                          : appI18n.t(
                              "billing.employeeCapacity.selector.interval.monthly"
                            ),
                      yearlyMultiplier: YEARLY_MULTIPLIER,
                    }
                  )}
                >
                  <Typography.Text
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      cursor: "help",
                    }}
                  >
                    <CircleHelp size={15} />
                    {appI18n.t(
                      "billing.employeeCapacity.selector.pricingTitle",
                      {
                        unitPrice: formatMoney(
                          employeeAddonSelection.unitPriceCents,
                          {
                            currency: employeeAddonSelection.currency,
                          }
                        ),
                      }
                    )}
                  </Typography.Text>
                </Tooltip>
              </Space>
            ) : null}

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
              data-cy="billing-checkout-form"
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
                    data-cy="billing-checkout-full-name-input"
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
                    data-cy="billing-checkout-email-input"
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
                    data-cy="billing-checkout-company-input"
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
                  onClick={() => navigateTo(this.resolveSelectionRoute())}
                  data-cy="billing-checkout-change-plan-button"
                >
                  {isEmployeeAddonCheckout
                    ? appI18n.t("billing.checkout.form.changeEmployeeAddon")
                    : isAiTokenTopupCheckout
                      ? appI18n.t("billing.checkout.form.changeAiTokenTopup")
                      : appI18n.t("billing.checkout.form.changePlan")}
                </SecondaryButton>

                <PrimaryButton
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={this.state.submitting}
                  disabled={!paymentReady}
                  data-cy="billing-checkout-submit-button"
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
