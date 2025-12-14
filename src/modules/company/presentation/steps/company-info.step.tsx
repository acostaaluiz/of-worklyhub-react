import type { ReactNode } from "react";
import { Form, Input, InputNumber, Radio } from "antd";
import type { WizardStep } from "@shared/ui/components/form-step/form-step.component";

export function companyInfoStep(): WizardStep {
  const content: ReactNode = (
    <>
      <Form.Item
        label="Are you using WorklyHub as an individual or a company?"
        name="accountType"
        rules={[{ required: true, message: "Select one option" }]}
      >
        <Radio.Group>
          <Radio value="individual">Individual</Radio>
          <Radio value="company">Company</Radio>
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
                <Input size="large" placeholder="Enter your company name" />
              </Form.Item>

              <Form.Item
                label="Number of employees (optional)"
                name="employees"
              >
                <InputNumber
                  style={{ width: "100%" }}
                  size="large"
                  min={1}
                  placeholder="e.g. 10"
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
    title: "Company details",
    subtitle: "A few details to configure your workspace.",
    content,
    fields: ["accountType", "companyName"],
  };
}
