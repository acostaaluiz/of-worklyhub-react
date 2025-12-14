import type { ReactNode } from "react";
import { Form, Input } from "antd";
import { Mail, User } from "lucide-react";

import type { WizardStep } from "@shared/ui/components/form-step/form-step.component";
import { FieldIcon } from "@shared/styles/global";

export type CompanyIntroductionValues = {
  fullName: string;
  email: string;
  phone?: string;

  accountType: "individual" | "company";
  companyName?: string;
  employees?: number;

  primaryService?: string;
  industry?: string;
  description?: string;
};

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
          prefix={
            <FieldIcon aria-hidden>
              <Mail size={18} />
            </FieldIcon>
          }
        />
      </Form.Item>

      <Form.Item label="Phone (optional)" name="phone">
        <Input size="large" placeholder="Enter your phone number" />
      </Form.Item>
    </>
  );

  return {
    id: "personal",
    title: "Personal info",
    subtitle: "Tell us who you are so we can personalize your setup.",
    content,
    fields: ["fullName", "email"],
  };
}
