import type { ReactNode } from "react";
import { Form, Input, Select } from "antd";
import { BriefcaseBusiness, Layers3, Sparkles } from "lucide-react";
import type { WizardStep } from "@shared/ui/components/form-step/form-step.component";
import type { ApplicationCategoryItem, ApplicationIndustryItem } from "@core/application/application-api";
import { FieldIcon } from "@shared/styles/global";

export function servicesInfoStep(categories?: ApplicationCategoryItem[], industries?: ApplicationIndustryItem[]): WizardStep {
  const serviceOptions: { value: string; label: string }[] = (categories && categories.length > 0)
    ? categories.map((c) => ({ value: c.uid, label: c.name }))
    : [
        { value: "beauty", label: "Beauty" },
        { value: "health", label: "Health" },
        { value: "maintenance", label: "Maintenance" },
        { value: "consulting", label: "Consulting" },
        { value: "education", label: "Education" },
        { value: "other", label: "Other" },
      ];
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
        label="Primary service"
        name="primaryService"
        rules={[{ required: true, message: "Primary service is required" }]}
      >
        <Input
          size="large"
          placeholder="Example: Preventive maintenance"
          data-cy="company-setup-primary-service-input"
          prefix={
            <FieldIcon aria-hidden>
              <BriefcaseBusiness size={18} />
            </FieldIcon>
          }
        />
      </Form.Item>

      <Form.Item
        label="Primary service category"
        name="primaryServiceCategory"
        rules={[{ required: true, message: "Select a category" }]}
      >
        <Select
          size="large"
          placeholder="Select primary service"
          options={serviceOptions}
          data-cy="company-setup-primary-service-category-select"
        />
      </Form.Item>

      <Form.Item
        label="Industry / area of operation"
        name="industry"
        rules={[{ required: true, message: "Select an industry" }]}
      >
        <Select
          size="large"
          placeholder="Select an industry"
          options={industryOptions}
          suffixIcon={<Layers3 size={16} />}
          data-cy="company-setup-industry-select"
        />
      </Form.Item>

      <Form.Item label="Short description (optional)" name="description">
        <Input.TextArea
          rows={3}
          placeholder="Describe your services in a few words..."
          data-cy="company-setup-description-input"
        />
      </Form.Item>
    </>
  );

  return {
    id: "market",
    title: "Market positioning",
    subtitle: "How your workspace should be represented in WorklyHub.",
    icon: <Sparkles size={16} />,
    content,
    fields: ["primaryService", "primaryServiceCategory", "industry"],
  };
}
