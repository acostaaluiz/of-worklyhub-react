import { Divider, Form, Input, Space, Typography } from "antd";
import { CreditCard, Lock, User, Mail, Building2 } from "lucide-react";

import { FieldIcon, ButtonIcon, HelperCenter } from "@shared/styles/global.ts";

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

export function CheckoutForm() {
  const [form] = Form.useForm<CheckoutValues>();

  const method = Form.useWatch("method", form) ?? "card";

  const handleSubmit = (_values: CheckoutValues) => {
    return;
  };

  return (
    <FormCard className="surface" styles={{ body: { padding: 0 } }}>
      <CardBody>
        <Space orientation="vertical" size={14} style={{ width: "100%" }}>
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
            form={form}
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
            style={{ width: "100%" }}
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

            <Divider style={{ margin: "var(--space-5) 0" }} />

            <Row style={{ justifyContent: "space-between" }}>
              <SecondaryButton size="large">Back</SecondaryButton>

              <PrimaryButton type="primary" htmlType="submit" size="large">
                <ButtonIcon aria-hidden>
                  <Lock size={18} />
                </ButtonIcon>
                Confirm payment
              </PrimaryButton>
            </Row>
          </Form>
        </Space>
      </CardBody>
    </FormCard>
  );
}
