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
      message.success("Lançamento salvo");
      onSaved?.(created);
      form.resetFields();
    } catch (err) {
      message.error("Erro ao salvar lançamento");
    }
  }

  return (
    <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ type: "expense", amount: initial?.amountCents ? initial.amountCents / 100 : undefined }}>
      <Form.Item name="type" label="Tipo" rules={[{ required: true }]}>
        <Select options={[{ label: "Receita", value: "income" }, { label: "Despesa", value: "expense" }, { label: "Fixa", value: "fixed" }]} />
      </Form.Item>

      <Form.Item name="amount" label="Valor (R$)" rules={[{ required: true }]}>
        <InputNumber style={{ width: "100%" }} min={0} step={0.01} />
      </Form.Item>

      <Form.Item name="date" label="Data">
        <DatePicker style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item name="description" label="Descrição">
        <Input />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          Salvar
        </Button>
      </Form.Item>
    </Form>
  );
}

export default FinanceEntryForm;
