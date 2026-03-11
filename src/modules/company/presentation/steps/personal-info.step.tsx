import type { ReactNode } from "react";
import { Form, Input } from "antd";
import { Mail, Phone, User } from "lucide-react";

import { maskPhone } from "@core/utils/mask";
import type { WizardStep } from "@shared/ui/components/form-step/form-step.component";
import { FieldIcon } from "@shared/styles/global";

export function personalInfoStep(): WizardStep {
  const content: ReactNode = (
    <>
      <Form.Item
        label="Full name"
        name="fullName"
        rules={[{ required: true, message: "Full name is required" }]}
      >
        <Input
          size="large"
          placeholder="Enter your full name"
          data-cy="company-setup-full-name-input"
          prefix={
            <FieldIcon aria-hidden>
              <User size={18} />
            </FieldIcon>
          }
        />
      </Form.Item>

      <Form.Item
        label="Email"
        name="email"
        rules={[
          { required: true, message: "Email is required" },
          { type: "email", message: "Enter a valid email" },
        ]}
      >
        <Input
          size="large"
          placeholder="Enter your email"
          autoComplete="email"
          data-cy="company-setup-email-input"
          prefix={
            <FieldIcon aria-hidden>
              <Mail size={18} />
            </FieldIcon>
          }
        />
      </Form.Item>

      <Form.Item label="Phone (optional)" name="phone" normalize={(value) => maskPhone(String(value ?? ""))}>
        <Input
          size="large"
          placeholder="Enter your phone number"
          data-cy="company-setup-phone-input"
          prefix={
            <FieldIcon aria-hidden>
              <Phone size={18} />
            </FieldIcon>
          }
        />
      </Form.Item>
    </>
  );

  return {
    id: "owner",
    title: "Owner profile",
    subtitle: "Basic account data used for authentication and communication.",
    icon: <User size={16} />,
    content,
    fields: ["fullName", "email"],
  };
}
