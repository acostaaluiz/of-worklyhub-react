import type { ReactNode } from "react";
import { Form, Input, Select } from "antd";
import type { WizardStep } from "@shared/ui/components/form-step/form-step.component";
import type { ApplicationCategoryItem, ApplicationIndustryItem } from "@core/application/application-api";

export function servicesInfoStep(categories?: ApplicationCategoryItem[], industries?: ApplicationIndustryItem[]): WizardStep {
  const serviceOptions: { value: string; label: string }[] = (categories ?? []).map((c) => ({ value: c.uid, label: c.name }));
  const industryOptions: { value: string; label: string }[] = (industries && industries.length > 0)
    ? industries.map((i) => ({ value: i.uid, label: i.name }))
    : [
        { value: "health", label: "Health" },
        { value: "finance", label: "Finance" },
        { value: "retail", label: "Retail" },
        { value: "education", label: "Education" },
        { value: "services", label: "Services" },
        { value: "other", label: "Other" },
      ];

  const content: ReactNode = (
    <>
      <Form.Item
        label="What service is your primary focus?"
        name="primaryService"
        rules={[{ required: true, message: "Primary service is required" }]}
      >
        <Select size="large" placeholder="Select primary service" options={serviceOptions} />
      </Form.Item>

      <Form.Item
        label="Industry / area of operation"
        name="industry"
        rules={[{ required: true, message: "Select an industry" }]}
      >
        <Select size="large" placeholder="Select an industry" options={industryOptions} />
      </Form.Item>

      <Form.Item label="Short description (optional)" name="description">
        <Input.TextArea rows={4} placeholder="Describe your services in a few words..." />
      </Form.Item>
    </>
  );

  return {
    id: "services",
    title: "Services",
    subtitle: "Help us understand what you do.",
    content,
    fields: ["primaryService", "industry"],
  };
}
