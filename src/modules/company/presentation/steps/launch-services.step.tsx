import type { ReactNode } from "react";
import { Form, Input, InputNumber, Select, Tabs, Typography } from "antd";
import { ListChecks, Tag } from "lucide-react";
import type { ApplicationCategoryItem } from "@core/application/application-api";
import type { WizardStep } from "@shared/ui/components/form-step/form-step.component";
import { FieldIcon } from "@shared/styles/global";
import { LaunchServicesGrid } from "./launch-services.step.styles";

const TAB_INDICES = [0, 1, 2] as const;

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
        label="Service name"
        name={["services", index, "name"]}
        rules={[
          ({ getFieldValue }) => ({
            validator(_, value) {
              const current = getFieldValue(["services", index]) as Record<string, DataValue> | undefined;
              const requiresName = index === 0 || hasServiceDetails(current);
              if (requiresName && !String(value ?? "").trim()) {
                return Promise.reject(new Error("Service name is required."));
              }
              return Promise.resolve();
            },
          }),
        ]}
      >
        <Input
          size="large"
          placeholder="Example: Haircut + beard"
          data-cy={`launch-service-name-input-${index}`}
          prefix={
            <FieldIcon aria-hidden>
              <ListChecks size={18} />
            </FieldIcon>
          }
        />
      </Form.Item>

      <Form.Item label="Category (optional)" name={["services", index, "category"]}>
        <Select
          size="large"
          placeholder="Select a category"
          options={categoryOptions}
          allowClear
          data-cy={`launch-service-category-select-${index}`}
        />
      </Form.Item>

      <Form.Item label="Description (optional)" name={["services", index, "description"]}>
        <Input.TextArea
          autoSize={{ minRows: 1, maxRows: 2 }}
          placeholder="Short service summary..."
          data-cy={`launch-service-description-input-${index}`}
        />
      </Form.Item>
      <Form.Item label="Duration (minutes)" name={["services", index, "durationMinutes"]}>
        <InputNumber
          size="large"
          min={5}
          max={600}
          step={5}
          placeholder="60"
          style={{ width: "100%" }}
          data-cy={`launch-service-duration-input-${index}`}
        />
      </Form.Item>
      <Form.Item label="Base price" name={["services", index, "price"]}>
        <InputNumber
          size="large"
          min={0}
          step={1}
          placeholder="0"
          style={{ width: "100%" }}
          data-cy={`launch-service-price-input-${index}`}
        />
      </Form.Item>
      <Form.Item label="Capacity per slot" name={["services", index, "capacity"]}>
        <InputNumber
          size="large"
          min={1}
          max={100}
          placeholder="1"
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
    label: <span data-cy={`launch-service-tab-${index}`}>{`Service ${index + 1}`}</span>,
    children: renderServiceFields(index, categoryOptions),
  }));

  const content: ReactNode = (
    <>
      <Typography.Paragraph type="secondary" style={{ marginTop: 0 }}>
        Add up to three launch services. Extra services can be managed later in the company module.
      </Typography.Paragraph>

      <Tabs defaultActiveKey="0" items={tabs} />
    </>
  );

  return {
    id: "launch-services",
    title: "Launch services",
    subtitle: "Initial catalog, pricing and operational estimates.",
    icon: <Tag size={16} />,
    content,
    fields: [
      ["services", 0, "name"],
    ],
  };
}
