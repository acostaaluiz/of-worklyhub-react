import type { ReactNode } from "react";
import { Form, Input } from "antd";
import { Mail, Phone, User } from "lucide-react";

import { i18n as appI18n } from "@core/i18n";
import { maskPhone } from "@core/utils/mask";
import type { WizardStep } from "@shared/ui/components/form-step/form-step.component";
import { FieldIcon } from "@shared/styles/global";

export function personalInfoStep(): WizardStep {
  const content: ReactNode = (
    <>
      <Form.Item
        label={appI18n.t("company.steps.personal.fields.fullName.label")}
        name="fullName"
        rules={[{ required: true, message: appI18n.t("company.steps.personal.fields.fullName.required") }]}
      >
        <Input
          size="large"
          placeholder={appI18n.t("company.steps.personal.fields.fullName.placeholder")}
          data-cy="company-setup-full-name-input"
          prefix={
            <FieldIcon aria-hidden>
              <User size={18} />
            </FieldIcon>
          }
        />
      </Form.Item>

      <Form.Item
        label={appI18n.t("company.steps.personal.fields.email.label")}
        name="email"
        rules={[
          { required: true, message: appI18n.t("company.steps.personal.fields.email.required") },
          { type: "email", message: appI18n.t("company.steps.personal.fields.email.invalid") },
        ]}
      >
        <Input
          size="large"
          placeholder={appI18n.t("company.steps.personal.fields.email.placeholder")}
          autoComplete="email"
          data-cy="company-setup-email-input"
          prefix={
            <FieldIcon aria-hidden>
              <Mail size={18} />
            </FieldIcon>
          }
        />
      </Form.Item>

      <Form.Item label={appI18n.t("company.steps.personal.fields.phone.label")} name="phone" normalize={(value) => maskPhone(String(value ?? ""))}>
        <Input
          size="large"
          placeholder={appI18n.t("company.steps.personal.fields.phone.placeholder")}
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
    title: appI18n.t("company.steps.personal.title"),
    subtitle: appI18n.t("company.steps.personal.subtitle"),
    icon: <User size={16} />,
    content,
    fields: ["fullName", "email"],
  };
}
