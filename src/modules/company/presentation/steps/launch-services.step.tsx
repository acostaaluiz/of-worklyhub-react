import type { ReactNode } from "react";
import { Form, Input, InputNumber, Select, Tabs, Typography } from "antd";
import { ListChecks, Tag } from "lucide-react";
import type { ApplicationCategoryItem } from "@core/application/application-api";
import { i18n as appI18n } from "@core/i18n";
import { getMoneyMaskAdapter } from "@core/utils/mask";
import type { WizardStep } from "@shared/ui/components/form-step/form-step.component";
import { FieldIcon } from "@shared/styles/global";
import { LaunchServicesGrid } from "./launch-services.step.styles";

const TAB_INDICES = [0, 1, 2] as const;
const moneyMask = getMoneyMaskAdapter();

function hasServiceDetails(service: Record<string, DataValue> | undefined): boolean {
  if (!service) return false;
  return Boolean(
    service.category ||
      service.description ||
      service.durationMinutes ||
      service.price ||
      service.capacity
  );
}

function renderServiceFields(index: number, categoryOptions: Array<{ value: string; label: string }>): ReactNode {
  return (
    <LaunchServicesGrid>
      <Form.Item
        label={appI18n.t("company.steps.launchServices.fields.serviceName.label")}
        name={["services", index, "name"]}
        rules={[
          ({ getFieldValue }) => ({
            validator(_, value) {
              const current = getFieldValue(["services", index]) as Record<string, DataValue> | undefined;
              const requiresName = index === 0 || hasServiceDetails(current);
              if (requiresName && !String(value ?? "").trim()) {
                return Promise.reject(new Error(appI18n.t("company.steps.launchServices.fields.serviceName.required")));
              }
              return Promise.resolve();
            },
          }),
        ]}
      >
        <Input
          size="large"
          placeholder={appI18n.t("company.steps.launchServices.fields.serviceName.placeholder")}
          data-cy={`launch-service-name-input-${index}`}
          prefix={
            <FieldIcon aria-hidden>
              <ListChecks size={18} />
            </FieldIcon>
          }
        />
      </Form.Item>

      <Form.Item label={appI18n.t("company.steps.launchServices.fields.category.label")} name={["services", index, "category"]}>
        <Select
          size="large"
          placeholder={appI18n.t("company.steps.launchServices.fields.category.placeholder")}
          options={categoryOptions}
          allowClear
          data-cy={`launch-service-category-select-${index}`}
        />
      </Form.Item>

      <Form.Item label={appI18n.t("company.steps.launchServices.fields.description.label")} name={["services", index, "description"]}>
        <Input.TextArea
          autoSize={{ minRows: 1, maxRows: 2 }}
          placeholder={appI18n.t("company.steps.launchServices.fields.description.placeholder")}
          data-cy={`launch-service-description-input-${index}`}
        />
      </Form.Item>
      <Form.Item label={appI18n.t("company.steps.launchServices.fields.duration.label")} name={["services", index, "durationMinutes"]}>
        <InputNumber
          size="large"
          min={5}
          max={600}
          step={5}
          placeholder={appI18n.t("company.steps.launchServices.fields.duration.placeholder")}
          style={{ width: "100%" }}
          data-cy={`launch-service-duration-input-${index}`}
        />
      </Form.Item>
      <Form.Item
        label={appI18n.t("company.steps.launchServices.fields.basePrice.label")}
        name={["services", index, "price"]}
        normalize={(value) => moneyMask.normalize(value)}
      >
        <Input
          size="large"
          inputMode="numeric"
          placeholder={appI18n.t("company.steps.launchServices.fields.basePrice.placeholder")}
          style={{ width: "100%" }}
          data-cy={`launch-service-price-input-${index}`}
        />
      </Form.Item>
      <Form.Item label={appI18n.t("company.steps.launchServices.fields.capacity.label")} name={["services", index, "capacity"]}>
        <InputNumber
          size="large"
          min={1}
          max={100}
          placeholder={appI18n.t("company.steps.launchServices.fields.capacity.placeholder")}
          style={{ width: "100%" }}
          data-cy={`launch-service-capacity-input-${index}`}
        />
      </Form.Item>
    </LaunchServicesGrid>
  );
}

export function launchServicesStep(categories?: ApplicationCategoryItem[]): WizardStep {
  const categoryOptions = (categories ?? []).map((item) => ({ value: item.uid, label: item.name }));

  const tabs = TAB_INDICES.map((index) => ({
    key: String(index),
    label: <span data-cy={`launch-service-tab-${index}`}>{appI18n.t("company.steps.launchServices.tabs.service", { index: index + 1 })}</span>,
    children: renderServiceFields(index, categoryOptions),
  }));

  const content: ReactNode = (
    <>
      <Typography.Paragraph type="secondary" style={{ marginTop: 0 }}>
        {appI18n.t("company.steps.launchServices.helper")}
      </Typography.Paragraph>

      <Tabs defaultActiveKey="0" items={tabs} />
    </>
  );

  return {
    id: "launch-services",
    title: appI18n.t("company.steps.launchServices.title"),
    subtitle: appI18n.t("company.steps.launchServices.subtitle"),
    icon: <Tag size={16} />,
    content,
    fields: [
      ["services", 0, "name"],
    ],
  };
}
