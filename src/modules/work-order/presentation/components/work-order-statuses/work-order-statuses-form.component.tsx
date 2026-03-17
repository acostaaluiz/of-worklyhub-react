import { Button, Form, Input, InputNumber, Switch } from "antd";

import { i18n as appI18n } from "@core/i18n";
import type { CreateWorkOrderStatusInput } from "@modules/work-order/interfaces/work-order.model";

type Props = {
  loading?: boolean;
  onSubmit: (payload: CreateWorkOrderStatusInput) => void;
};

export function WorkOrderStatusForm({ loading, onSubmit }: Props) {
        const [form] = Form.useForm<CreateWorkOrderStatusInput>();

  const handleFinish = (values: CreateWorkOrderStatusInput) => {
    onSubmit(values);
    form.resetFields();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ fontWeight: 600, fontSize: 16 }}>{appI18n.t("legacyInline.work_order.presentation_components_work_order_statuses_work_order_statuses_form_component.k001")}</div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{ isTerminal: false, sortOrder: 10 }}
        data-cy="work-order-status-form"
      >
        <Form.Item
          name="code"
          label={appI18n.t("legacyInline.work_order.presentation_components_work_order_statuses_work_order_statuses_form_component.k002")}
          rules={[{ required: true, message: appI18n.t("legacyInline.work_order.presentation_components_work_order_statuses_work_order_statuses_form_component.k003") }]}
        >
          <Input placeholder={appI18n.t("legacyInline.work_order.presentation_components_work_order_statuses_work_order_statuses_form_component.k004")} data-cy="work-order-status-code-input" />
        </Form.Item>

        <Form.Item
          name="label"
          label={appI18n.t("legacyInline.work_order.presentation_components_work_order_statuses_work_order_statuses_form_component.k005")}
          rules={[{ required: true, message: appI18n.t("legacyInline.work_order.presentation_components_work_order_statuses_work_order_statuses_form_component.k006") }]}
        >
          <Input placeholder={appI18n.t("legacyInline.work_order.presentation_components_work_order_statuses_work_order_statuses_form_component.k007")} data-cy="work-order-status-label-input" />
        </Form.Item>

        <Form.Item name="isTerminal" label={appI18n.t("legacyInline.work_order.presentation_components_work_order_statuses_work_order_statuses_form_component.k008")} valuePropName="checked">
          <Switch data-cy="work-order-status-terminal-switch" />
        </Form.Item>

        <Form.Item name="sortOrder" label={appI18n.t("legacyInline.work_order.presentation_components_work_order_statuses_work_order_statuses_form_component.k009")}>
          <InputNumber min={0} style={{ width: "100%" }} data-cy="work-order-status-order-input" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} data-cy="work-order-status-save-button">
            {appI18n.t("legacyInline.work_order.presentation_components_work_order_statuses_work_order_statuses_form_component.k010")}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

export default WorkOrderStatusForm;
