import type { ReactNode } from "react";
import { Descriptions, Form, Typography } from "antd";
import type { WizardStep } from "@shared/ui/components/form-step/form-step.component";

export function summaryStep(): WizardStep {
  const content: ReactNode = (
    <Form.Item shouldUpdate noStyle>
      {({ getFieldsValue }) => {
        const v = getFieldsValue(true);

        return (
          <>
            <Typography.Text type="secondary">
              Review your information before finishing. You can go back and
              adjust anything.
            </Typography.Text>

            <div style={{ marginTop: "var(--space-5)" }}>
              <Descriptions
                bordered
                column={1}
                size="middle"
                style={{ width: "100%" }}
              >
                <Descriptions.Item label="Full name">
                  {v.fullName || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                  {v.email || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Phone">
                  {v.phone || "-"}
                </Descriptions.Item>

                <Descriptions.Item label="Account type">
                  {v.accountType || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Company name">
                  {v.companyName || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Employees">
                  {v.employees || "-"}
                </Descriptions.Item>

                <Descriptions.Item label="Primary service">
                  {v.primaryService || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Industry">
                  {v.industry || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Description">
                  {v.description || "-"}
                </Descriptions.Item>
              </Descriptions>
            </div>
          </>
        );
      }}
    </Form.Item>
  );

  return {
    id: "summary",
    title: "Summary",
    subtitle: "Confirm your details to complete setup.",
    content,
    fields: [],
  };
}
