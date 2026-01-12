import React from "react";
import { Form, Input, InputNumber, Select, Button, DatePicker, message } from "antd";
import dayjs from "dayjs";
import type { FinanceEntryCreatePayload } from "@modules/finance/interfaces/finance-entry.model";
import { useFinanceApi } from "@modules/finance/services/finance.service";

type Props = {
  initial?: Partial<FinanceEntryCreatePayload>;
  onSaved?: (entry: any) => void;
};

export function FinanceEntryForm({ initial, onSaved }: Props) {
  const [form] = Form.useForm();
  const api = useFinanceApi();

  async function onFinish(values: any) {
    try {
      const payload = {
        serviceId: values.serviceId,
        amount: Number(values.amount || 0),
        date: (values.date || dayjs()).format("YYYY-MM-DD"),
        note: values.description,
      };

      const created = await api.createEntry(payload);
      message.success("Entry saved");
      onSaved?.(created);
      form.resetFields();
    } catch (err) {
      message.error("Error saving entry");
    }
  }

  return (
    <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ type: "expense", amount: initial?.amountCents ? initial.amountCents / 100 : undefined }}>
      <Form.Item name="type" label="Type" rules={[{ required: true }]}>
        <Select options={[{ label: "Income", value: "income" }, { label: "Expense", value: "expense" }, { label: "Fixed", value: "fixed" }]} />
      </Form.Item>

      <Form.Item name="amount" label="Amount (BRL)" rules={[{ required: true }]}>
        <InputNumber style={{ width: "100%" }} min={0} step={0.01} />
      </Form.Item>

      <Form.Item name="date" label="Date">
        <DatePicker style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item name="description" label="Description">
        <Input />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          Save
        </Button>
      </Form.Item>
    </Form>
  );
}

export default FinanceEntryForm;
