import React from "react";
import { Divider, Form, Input, Space, Typography, message, Alert } from "antd";
import type { FormInstance } from "antd";
import { CreditCard, Lock, User, Mail, Building2 } from "lucide-react";

import { FieldIcon, ButtonIcon, HelperCenter } from "@shared/styles/global.ts";
import { BaseComponent } from "@shared/base/base.component";
import type { BaseState } from "@shared/base/interfaces/base-state.interface";

import {
  FormCard,
  CardBody,
  SectionTitle,
  Row,
  PrimaryButton,
  SecondaryButton,
} from "./checkout-form.component.styles";

import { PaymentMethodsField } from "../payment-methods/payment-methods.component";
import { billingService } from "@modules/billing/services/billing.service";
import type { BillingPlan, BillingCycle } from "@modules/billing/services/billing-api";

type CheckoutValues = {
  fullName: string;
  email: string;
  company?: string;
  method: "card" | "hosted";
  cardNumber?: string;
  cardName?: string;
  cardExpiry?: string;
  cardCvv?: string;
};

type CheckoutState = BaseState & {
  method: "card" | "hosted";
  step: 1 | 2;
  submitting: boolean;
  selectedPlanId?: string | null;
  selectedPlan?: BillingPlan | null;
  interval?: BillingCycle;
  publicKey?: string;
  paymentConfigured?: boolean;
};

type CreateCardTokenPayload = {
  cardNumber?: string;
  cardholderName?: string;
  cardExpirationMonth?: string;
  cardExpirationYear?: string;
  securityCode?: string;
};

type MPInstance = {
  cards: {
    createToken: (payload: CreateCardTokenPayload) => Promise<{ id?: string }>;
  };
};

type MercadoPagoCtor = new (
  publicKey: string,
  options: { locale: string }
) => MPInstance;

let mpScriptPromise: Promise<void> | null = null;
let mpInstance: MPInstance | null = null;
let mpInstanceKey: string | null = null;

export class CheckoutForm extends BaseComponent<{}, CheckoutState> {
  private formRef = React.createRef<FormInstance<CheckoutValues>>();

  public override state: CheckoutState = {
    isLoading: false,
    error: undefined,
    method: "card",
    step: 1,
    submitting: false,
    selectedPlanId: undefined,
    selectedPlan: undefined,
    interval: "monthly",
    publicKey: undefined,
    paymentConfigured: true,
  };

  private handleValuesChange = (
    changedValues: Partial<CheckoutValues>,
    values: CheckoutValues
  ) => {
    const nextMethod = changedValues.method ?? values.method;
    if (nextMethod && nextMethod !== this.state.method) {
      this.setState({ method: nextMethod });
    }
  };

  override componentDidMount(): void {
    super.componentDidMount();
    this.bootstrap();
  }

  override componentDidUpdate(_prevProps: Readonly<{}>, prevState: Readonly<CheckoutState>): void {
    if (prevState.method !== this.state.method) {
      try {
        this.formRef.current?.setFieldsValue({ method: this.state.method });
      } catch {
        // ignore
      }
    }
  };

  private bootstrap = async () => {
    await this.runAsync(async () => {
      const selectedPlanId = sessionStorage.getItem("billing.selectedPlanId") ?? undefined;
      const interval = (sessionStorage.getItem("billing.selectedPlanInterval") as BillingCycle) ?? "monthly";

      const plansState = await billingService.fetchPlans();
      const selectedPlan =
        plansState?.plans?.find((p) => String(p.id) === String(selectedPlanId)) ??
        plansState?.plans?.find((p) => p.recommended) ??
        plansState?.plans?.[0] ??
        null;

      const method = plansState?.payment?.configured ? "card" : "hosted";

      this.setSafeState({
        selectedPlanId: selectedPlan ? String(selectedPlan.id) : selectedPlanId ?? null,
        selectedPlan,
        interval,
        publicKey: plansState?.payment?.publicKey ?? undefined,
        paymentConfigured: plansState?.payment?.configured ?? false,
        method,
      });

      try {
        if (plansState?.payment?.publicKey) {
          await this.ensureMercadoPago(plansState.payment.publicKey);
        }
      } catch {
        // SDK load issues will be surfaced on submit
      }
    }, { swallowError: true, setLoading: false });
  };

  private handleNext = async () => {
    try {
      await this.formRef.current?.validateFields(["fullName", "email"]);
      this.setState({ step: 2 });
    } catch {
      // validation errors; stay on step 1
    }
  };

  private handlePrevious = () => {
    this.setState({ step: 1 });
  };

  private parseExpiry(raw?: string): { month?: string; year?: string } {
    if (!raw) return {};
    const cleaned = raw.replace(/\s+/g, "");
    const parts = cleaned.split(/[/]/);
    const month = parts[0]?.padStart(2, "0");
    let year = parts[1];
    if (year && year.length === 2) year = `20${year}`;
    return { month, year };
  }

  private async ensureMercadoPago(publicKey: string): Promise<MPInstance> {
    if (!publicKey) throw new Error("Payment gateway public key is missing.");

    if (!mpScriptPromise) {
      mpScriptPromise = new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://sdk.mercadopago.com/js/v2";
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load Mercado Pago SDK"));
        document.body.appendChild(script);
      });
    }

    await mpScriptPromise;

    if (!mpInstance || mpInstanceKey !== publicKey) {
      const MP = (window as Window & { MercadoPago?: MercadoPagoCtor })
        .MercadoPago;
      if (!MP) throw new Error("Mercado Pago SDK not available.");
      mpInstance = new MP(publicKey, { locale: "en-US" });
      mpInstanceKey = publicKey;
    }

    return mpInstance as MPInstance;
  }

  private buildHostedReturnUrls(): { successUrl: string; failureUrl: string; pendingUrl: string } {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://app.worklyhub.com";
    return {
      successUrl: `${origin}/billing/checkout?status=success`,
      failureUrl: `${origin}/billing/checkout?status=failure`,
      pendingUrl: `${origin}/billing/checkout?status=pending`,
    };
  }

  protected override renderView(): React.ReactNode {
    const handleSubmit = async (values: CheckoutValues) => {
      if (!this.state.selectedPlanId) {
        message.error("Select a plan before finishing payment.");
        return;
      }

      const billingCycle = (this.state.interval ?? "monthly") as BillingCycle;

      if (!this.state.paymentConfigured) {
        message.error("Payment provider is not configured. Please try again later.");
        return;
      }

      this.setSafeState({ submitting: true, error: undefined });

      try {
        let cardToken: string | undefined;

        if (values.method === "card") {
          const { month, year } = this.parseExpiry(values.cardExpiry);
          if (!month || !year) throw new Error("Enter card expiry in MM/YY format.");
          const mp = await this.ensureMercadoPago(this.state.publicKey ?? "");
          const tokenRes = await mp.cards.createToken({
            cardNumber: values.cardNumber?.replace(/\s+/g, ""),
            cardholderName: values.cardName,
            cardExpirationMonth: month,
            cardExpirationYear: year,
            securityCode: values.cardCvv,
          });
          cardToken = tokenRes?.id;
          if (!cardToken) throw new Error("Unable to tokenize the card. Please check the data and try again.");
        }

        const hostedUrls = this.buildHostedReturnUrls();

        const res = await billingService.createCheckout({
          planId: this.state.selectedPlanId,
          billingCycle,
          payer: { email: values.email, fullName: values.fullName, company: values.company },
          paymentMethod: values.method === "hosted" ? "hosted" : "card",
          cardToken,
          installments: 1,
          successUrl: hostedUrls.successUrl,
          failureUrl: hostedUrls.failureUrl,
          pendingUrl: hostedUrls.pendingUrl,
          metadata: { origin: "web" },
        });

        const data = res?.data;
        if (data?.type === "preference" && data.checkoutUrl) {
          message.info("Redirecting to the payment provider...");
          window.location.href = data.checkoutUrl;
          return;
        }

        if (data?.status === "approved") {
          message.success("Payment approved!");
        } else if (data?.status === "pending") {
          message.info("Payment pending confirmation. We will notify you once it is approved.");
        } else {
          message.success("Checkout created.");
        }
      } catch (err) {
        console.error("checkout error", err);
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

    const { method, step, paymentConfigured } = this.state;

    return (
      <FormCard className="surface" styles={{ body: { padding: 0 } }}>
        <CardBody>
          <Space orientation="vertical" size={14} style={{ width: "100%", flex: 1 }}>
            <div>
              <Typography.Title level={4} style={{ margin: 0 }}>
                Payment details
              </Typography.Title>
              <Typography.Text type="secondary">
                Your card information is tokenized by the gateway in the next
                phase.
              </Typography.Text>
            </div>

            {!paymentConfigured ? (
              <Alert
                type="warning"
                showIcon
                message="Payment temporarily unavailable"
                description="Gateway credentials are not configured yet. You can review your plan, but payment will fail until the provider is configured."
              />
            ) : null}

            <Form<CheckoutValues>
              ref={this.formRef}
              layout="vertical"
              requiredMark={false}
              initialValues={{
                fullName: "",
                email: "",
                company: "",
                method: "card",
                cardNumber: "",
                cardName: "",
                cardExpiry: "",
                cardCvv: "",
              }}
              onFinish={handleSubmit}
              onValuesChange={this.handleValuesChange}
              style={{ width: "100%", display: "flex", flexDirection: "column", flex: 1 }}
            >
              {step === 1 && (
                <>
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
                </>
              )}

              {step === 2 && (
                <>
                  <SectionTitle>
                    <Typography.Text strong>Payment method</Typography.Text>
                  </SectionTitle>

                  <PaymentMethodsField />

                  {method === "card" && (
                    <>
                      <Divider style={{ margin: "var(--space-5) 0" }} />

                      <Row>
                        <Form.Item<CheckoutValues>
                          label="Card number"
                          name="cardNumber"
                          rules={[
                            { required: true, message: "Card number is required" },
                          ]}
                          style={{ marginBottom: 0, flex: 1 }}
                        >
                          <Input
                            size="large"
                            placeholder="1234 5678 9012 3456"
                            prefix={
                              <FieldIcon aria-hidden>
                                <CreditCard size={18} />
                              </FieldIcon>
                            }
                            inputMode="numeric"
                          />
                        </Form.Item>
                      </Row>

                      <Row>
                        <Form.Item<CheckoutValues>
                          label="Name on card"
                          name="cardName"
                          rules={[
                            {
                              required: true,
                              message: "Cardholder name is required",
                            },
                          ]}
                          style={{ marginBottom: 0, flex: 1 }}
                        >
                          <Input size="large" placeholder="Full name" />
                        </Form.Item>
                      </Row>

                      <Row>
                        <Form.Item<CheckoutValues>
                          label="Expiry"
                          name="cardExpiry"
                          rules={[{ required: true, message: "Expiry is required" }]}
                          style={{ marginBottom: 0, flex: 1 }}
                        >
                          <Input
                            size="large"
                            placeholder="MM/YY"
                            inputMode="numeric"
                          />
                        </Form.Item>

                        <Form.Item<CheckoutValues>
                          label="CVV"
                          name="cardCvv"
                          rules={[{ required: true, message: "CVV is required" }]}
                          style={{ marginBottom: 0, flex: 1 }}
                        >
                          <Input size="large" placeholder="123" inputMode="numeric" />
                        </Form.Item>
                      </Row>

                      <HelperCenter style={{ marginTop: "var(--space-3)" }}>
                        <Typography.Text type="secondary">
                          <Lock
                            size={14}
                            style={{ verticalAlign: "middle", marginRight: 6 }}
                          />
                          Secure payment. Your card will be tokenized by the gateway.
                        </Typography.Text>
                      </HelperCenter>
                    </>
                  )}
                </>
              )}

              <Divider style={{ margin: "var(--space-5) 0" }} />

              <Row style={{ justifyContent: "space-between", marginTop: "auto" }}>
                {step === 2 ? (
                  <SecondaryButton size="large" onClick={this.handlePrevious}>
                    Previous
                  </SecondaryButton>
                ) : (
                  <div />
                )}

                {step === 1 ? (
                  <PrimaryButton htmlType="button" size="large" onClick={this.handleNext}>
                    Next
                  </PrimaryButton>
                ) : (
                  <div style={{ display: "flex", gap: 8 }}>
                    <PrimaryButton type="primary" htmlType="submit" size="large" loading={this.state.submitting} disabled={!paymentConfigured}>
                      <ButtonIcon aria-hidden>
                        <Lock size={18} />
                      </ButtonIcon>
                      Confirm payment
                    </PrimaryButton>
                  </div>
                )}
              </Row>
            </Form>
          </Space>
        </CardBody>
      </FormCard>
    );
  }
}

export default CheckoutForm;
