import type { ReactNode } from "react";
import { Form, Input, Select } from "antd";
import { BriefcaseBusiness, Layers3, Sparkles } from "lucide-react";
import type { WizardStep } from "@shared/ui/components/form-step/form-step.component";
import type { ApplicationCategoryItem, ApplicationIndustryItem } from "@core/application/application-api";
import { i18n as appI18n } from "@core/i18n";
import { FieldIcon } from "@shared/styles/global";

export function servicesInfoStep(categories?: ApplicationCategoryItem[], industries?: ApplicationIndustryItem[]): WizardStep {
  const serviceOptions: { value: string; label: string }[] = (categories && categories.length > 0)
    ? categories.map((c) => ({ value: c.uid, label: c.name }))
    : [
        { value: "beauty", label: appI18n.t("company.steps.servicesInfo.fallbackOptions.categories.beauty") },
        { value: "health", label: appI18n.t("company.steps.servicesInfo.fallbackOptions.categories.health") },
        { value: "maintenance", label: appI18n.t("company.steps.servicesInfo.fallbackOptions.categories.maintenance") },
        { value: "consulting", label: appI18n.t("company.steps.servicesInfo.fallbackOptions.categories.consulting") },
        { value: "education", label: appI18n.t("company.steps.servicesInfo.fallbackOptions.categories.education") },
        { value: "other", label: appI18n.t("company.steps.servicesInfo.fallbackOptions.categories.other") },
      ];
  const industryOptions: { value: string; label: string }[] = (industries && industries.length > 0)
    ? industries.map((i) => ({ value: i.uid, label: i.name }))
    : [
        { value: "health", label: appI18n.t("company.steps.servicesInfo.fallbackOptions.industries.health") },
        { value: "finance", label: appI18n.t("company.steps.servicesInfo.fallbackOptions.industries.finance") },
        { value: "retail", label: appI18n.t("company.steps.servicesInfo.fallbackOptions.industries.retail") },
        { value: "education", label: appI18n.t("company.steps.servicesInfo.fallbackOptions.industries.education") },
        { value: "services", label: appI18n.t("company.steps.servicesInfo.fallbackOptions.industries.services") },
        { value: "other", label: appI18n.t("company.steps.servicesInfo.fallbackOptions.industries.other") },
      ];

  const content: ReactNode = (
    <>
      <Form.Item
        label={appI18n.t("company.steps.servicesInfo.fields.primaryService.label")}
        name="primaryService"
        rules={[{ required: true, message: appI18n.t("company.steps.servicesInfo.fields.primaryService.required") }]}
      >
        <Input
          size="large"
          placeholder={appI18n.t("company.steps.servicesInfo.fields.primaryService.placeholder")}
          data-cy="company-setup-primary-service-input"
          prefix={
            <FieldIcon aria-hidden>
              <BriefcaseBusiness size={18} />
            </FieldIcon>
          }
        />
      </Form.Item>

      <Form.Item
        label={appI18n.t("company.steps.servicesInfo.fields.primaryServiceCategory.label")}
        name="primaryServiceCategory"
        rules={[{ required: true, message: appI18n.t("company.steps.servicesInfo.fields.primaryServiceCategory.required") }]}
      >
        <Select
          size="large"
          placeholder={appI18n.t("company.steps.servicesInfo.fields.primaryServiceCategory.placeholder")}
          options={serviceOptions}
          data-cy="company-setup-primary-service-category-select"
        />
      </Form.Item>

      <Form.Item
        label={appI18n.t("company.steps.servicesInfo.fields.industry.label")}
        name="industry"
        rules={[{ required: true, message: appI18n.t("company.steps.servicesInfo.fields.industry.required") }]}
      >
        <Select
          size="large"
          placeholder={appI18n.t("company.steps.servicesInfo.fields.industry.placeholder")}
          options={industryOptions}
          suffixIcon={<Layers3 size={16} />}
          data-cy="company-setup-industry-select"
        />
      </Form.Item>

      <Form.Item label={appI18n.t("company.steps.servicesInfo.fields.description.label")} name="description">
        <Input.TextArea
          rows={3}
          placeholder={appI18n.t("company.steps.servicesInfo.fields.description.placeholder")}
          data-cy="company-setup-description-input"
        />
      </Form.Item>
    </>
  );

  return {
    id: "market",
    title: appI18n.t("company.steps.servicesInfo.title"),
    subtitle: appI18n.t("company.steps.servicesInfo.subtitle"),
    icon: <Sparkles size={16} />,
    content,
    fields: ["primaryService", "primaryServiceCategory", "industry"],
  };
}
