import { Button, Form, Input, InputNumber, Switch } from "antd";

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
      <div style={{ fontWeight: 600, fontSize: 16 }}>Create status</div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{ isTerminal: false, sortOrder: 10 }}
        data-cy="work-order-status-form"
      >
        <Form.Item
          name="code"
          label="Code"
          rules={[{ required: true, message: "Status code is required" }]}
        >
          <Input placeholder="e.g. opened" data-cy="work-order-status-code-input" />
        </Form.Item>

        <Form.Item
          name="label"
          label="Label"
          rules={[{ required: true, message: "Status label is required" }]}
        >
          <Input placeholder="e.g. Opened" data-cy="work-order-status-label-input" />
        </Form.Item>

        <Form.Item name="isTerminal" label="Terminal" valuePropName="checked">
          <Switch data-cy="work-order-status-terminal-switch" />
        </Form.Item>

        <Form.Item name="sortOrder" label="Sort order">
          <InputNumber min={0} style={{ width: "100%" }} data-cy="work-order-status-order-input" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} data-cy="work-order-status-save-button">
            Create status
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

export default WorkOrderStatusForm;
