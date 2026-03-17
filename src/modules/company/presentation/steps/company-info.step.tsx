import type { ReactNode } from "react";
import { Form, Input, InputNumber, Radio } from "antd";
import { Building2 } from "lucide-react";
import { i18n as appI18n } from "@core/i18n";
import type { WizardStep } from "@shared/ui/components/form-step/form-step.component";
import { FieldIcon } from "@shared/styles/global";

export function companyInfoStep(): WizardStep {
  const content: ReactNode = (
    <>
      <Form.Item
        label={appI18n.t("company.steps.company.fields.accountType.label")}
        name="accountType"
        rules={[{ required: true, message: appI18n.t("company.steps.company.fields.accountType.required") }]}
      >
        <Radio.Group data-cy="company-setup-account-type-group">
          <Radio value="individual" data-cy="company-setup-account-type-individual">{appI18n.t("company.steps.company.fields.accountType.individual")}</Radio>
          <Radio value="company" data-cy="company-setup-account-type-company">{appI18n.t("company.steps.company.fields.accountType.company")}</Radio>
        </Radio.Group>
      </Form.Item>

      <Form.Item shouldUpdate noStyle>
        {({ getFieldValue }) => {
          const type = getFieldValue("accountType");

          if (type !== "company") return null;

          return (
            <>
              <Form.Item
                label={appI18n.t("company.steps.company.fields.companyName.label")}
                name="companyName"
                rules={[
                  { required: true, message: appI18n.t("company.steps.company.fields.companyName.required") },
                ]}
              >
                <Input
                  size="large"
                  placeholder={appI18n.t("company.steps.company.fields.companyName.placeholder")}
                  data-cy="company-setup-company-name-input"
                  prefix={
                    <FieldIcon aria-hidden>
                      <Building2 size={18} />
                    </FieldIcon>
                  }
                />
              </Form.Item>

              <Form.Item
                label={appI18n.t("company.steps.company.fields.legalName.label")}
                name="legalName"
              >
                <Input
                  size="large"
                  placeholder={appI18n.t("company.steps.company.fields.legalName.placeholder")}
                  data-cy="company-setup-legal-name-input"
                />
              </Form.Item>

              <Form.Item
                label={appI18n.t("company.steps.company.fields.employees.label")}
                name="employees"
              >
                <InputNumber
                  style={{ width: "100%" }}
                  size="large"
                  min={1}
                  placeholder={appI18n.t("company.steps.company.fields.employees.placeholder")}
                  data-cy="company-setup-employees-input"
                />
              </Form.Item>
            </>
          );
        }}
      </Form.Item>
    </>
  );

  return {
    id: "company",
    title: appI18n.t("company.steps.company.title"),
    subtitle: appI18n.t("company.steps.company.subtitle"),
    icon: <Building2 size={16} />,
    content,
    fields: ["accountType", "companyName"],
  };
}
