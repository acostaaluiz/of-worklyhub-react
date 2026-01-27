import React from "react";
import { Divider, Form, Input, Space, Typography } from "antd";
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

type CheckoutValues = {
  fullName: string;
  email: string;
  company?: string;
  method: "card" | "pix";
  cardNumber?: string;
  cardName?: string;
  cardExpiry?: string;
  cardCvv?: string;
};

type CheckoutState = BaseState & { method: "card" | "pix"; step: 1 | 2 };

export class CheckoutForm extends BaseComponent<{}, CheckoutState> {
  private formRef = React.createRef<any>();

  public override state: CheckoutState = { isLoading: false, error: undefined, method: "card", step: 1 };

  private handleValuesChange = (_: any, values: Partial<CheckoutValues>) => {
    if (values.method && values.method !== this.state.method) {
      this.setState({ method: values.method as "card" | "pix" });
    }
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

  protected override renderView(): React.ReactNode {
    const handleSubmit = (_values: CheckoutValues) => {
      return;
    };

    const { method, step } = this.state;

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
                  <PrimaryButton type="button" size="large" onClick={this.handleNext}>
                    Next
                  </PrimaryButton>
                ) : (
                  <div style={{ display: "flex", gap: 8 }}>
                    <PrimaryButton type="primary" htmlType="submit" size="large">
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
