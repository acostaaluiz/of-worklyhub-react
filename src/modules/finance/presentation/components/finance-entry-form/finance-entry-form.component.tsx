import React, { useEffect, useState } from "react";
import { Form, Input, InputNumber, Select, Button, DatePicker, message } from "antd";
import { loadingService } from "@shared/ui/services/loading.service";
import dayjs from "dayjs";
import type { FinanceEntryCreatePayload } from "@modules/finance/interfaces/finance-entry.model";
import { useFinanceApi } from "@modules/finance/services/finance.service";
import type { FinanceEntryType } from "@modules/finance/services/finance-api";

type Props = {
  initial?: Partial<FinanceEntryCreatePayload>;
  onSaved?: (entry: any) => void;
  workspaceId?: string;
};

export function FinanceEntryForm({ initial, onSaved, workspaceId }: Props) {
  const [form] = Form.useForm();
  const api = useFinanceApi();
  const [types, setTypes] = useState<FinanceEntryType[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const rows = await api.listEntryTypes(workspaceId);
        if (!mounted) return;
        setTypes(rows ?? []);

        const current = form.getFieldValue("type");
        if (!current) {
          const preferred = (rows ?? []).find((r) => (r.name ?? "").toString().toLowerCase() === "expense" || (r.key ?? "") === "expense");
          const defaultId = preferred?.id ?? (rows && rows[0]?.id);
          if (defaultId) form.setFieldsValue({ type: defaultId });
        }
      } catch (err) {
        setTypes([]);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [api, workspaceId, form]);

  async function onFinish(values: any) {
    try {
      const payload = {
        serviceId: values.serviceId,
        type: values.type,
        amount: Number(values.amount || 0),
        date: (values.date || dayjs()).format("YYYY-MM-DD"),
        note: values.description,
      };

      loadingService.show();
      const created = await api.createEntry({ ...payload, workspaceId });
      message.success("Entry saved");
      onSaved?.(created);
      form.resetFields();
      return created;
    } catch (err) {
      message.error("Error saving entry");
      throw err;
    } finally {
      loadingService.hide();
    }
  }

  return (
    <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ type: undefined, amount: initial?.amountCents ? initial.amountCents / 100 : undefined }}>
      <Form.Item name="type" label="Type" rules={[{ required: true }]}>
        <Select
          options={types.map((t) => ({ label: t.name, value: t.id }))}
          loading={types.length === 0}
        />
      </Form.Item>

      <Form.Item name="amount" label="Amount (BRL)" rules={[{ required: true }]}>
        <InputNumber style={{ width: "100%" }} min={0} step={0.01} />
      </Form.Item>

      <Form.Item name="date" label="Date">
        <DatePicker style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item name="description" label="Description">
        <Input.TextArea rows={4} />
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
