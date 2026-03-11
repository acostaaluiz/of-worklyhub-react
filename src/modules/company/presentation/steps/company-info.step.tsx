import type { ReactNode } from "react";
import { Form, Input, InputNumber, Radio } from "antd";
import { Building2 } from "lucide-react";
import type { WizardStep } from "@shared/ui/components/form-step/form-step.component";
import { FieldIcon } from "@shared/styles/global";

export function companyInfoStep(): WizardStep {
  const content: ReactNode = (
    <>
      <Form.Item
        label="Are you using WorklyHub as an individual or a company?"
        name="accountType"
        rules={[{ required: true, message: "Select one option" }]}
      >
        <Radio.Group data-cy="company-setup-account-type-group">
          <Radio value="individual" data-cy="company-setup-account-type-individual">Individual</Radio>
          <Radio value="company" data-cy="company-setup-account-type-company">Company</Radio>
        </Radio.Group>
      </Form.Item>

      <Form.Item shouldUpdate noStyle>
        {({ getFieldValue }) => {
          const type = getFieldValue("accountType");

          if (type !== "company") return null;

          return (
            <>
              <Form.Item
                label="Company name"
                name="companyName"
                rules={[
                  { required: true, message: "Company name is required" },
                ]}
              >
                <Input
                  size="large"
                  placeholder="Enter your company name"
                  data-cy="company-setup-company-name-input"
                  prefix={
                    <FieldIcon aria-hidden>
                      <Building2 size={18} />
                    </FieldIcon>
                  }
                />
              </Form.Item>

              <Form.Item
                label="Legal name (optional)"
                name="legalName"
              >
                <Input
                  size="large"
                  placeholder="Registered legal entity name"
                  data-cy="company-setup-legal-name-input"
                />
              </Form.Item>

              <Form.Item
                label="Team size (optional)"
                name="employees"
              >
                <InputNumber
                  style={{ width: "100%" }}
                  size="large"
                  min={1}
                  placeholder="e.g. 10"
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
    title: "Company identity",
    subtitle: "Workspace ownership and legal/company naming.",
    icon: <Building2 size={16} />,
    content,
    fields: ["accountType", "companyName"],
  };
}
