import { useEffect, useState } from "react";
import { Form, Input, InputNumber, Select, Button, DatePicker, message } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { getDateFormat, getMaskConfig, getMoneyInput } from "@core/utils/mask";
import { i18n as appI18n } from "@core/i18n";
import { loadingService } from "@shared/ui/services/loading.service";
import type {
  FinanceEntryCreatePayload,
  FinanceEntryListItem,
} from "@modules/finance/interfaces/finance-entry.model";
import type { FinanceEntryType } from "@modules/finance/services/finance-api";
import { useFinanceApi } from "@modules/finance/services/finance.service";

type FinanceEntryFormValues = {
  serviceId?: string;
  type?: string;
  amount?: number;
  date?: Dayjs | null;
  description?: string;
};

type Props = {
  initial?: Partial<FinanceEntryCreatePayload>;
  onSaved?: (entry: FinanceEntryListItem) => void;
  workspaceId?: string;
};

export function FinanceEntryForm({ initial, onSaved, workspaceId }: Props) {
        const [form] = Form.useForm<FinanceEntryFormValues>();
  const api = useFinanceApi();
  const [types, setTypes] = useState<FinanceEntryType[]>([]);
  const moneyInput = getMoneyInput();
  const dateFormat = getDateFormat();
  const currencyCode = getMaskConfig().currencyCode;

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const rows = await api.listEntryTypes(workspaceId);
        if (!mounted) return;
        setTypes(rows ?? []);

        const current = form.getFieldValue("type");
        if (!current) {
          const preferred = (rows ?? []).find((r) => {
            const dir = (r.direction ?? "").toString().toLowerCase();
            const key = (r.key ?? "").toString().toLowerCase();
            const name = (r.name ?? "").toString().toLowerCase();
            return dir === "expense" || key === "expense" || name === "expense";
          });
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

  async function onFinish(values: FinanceEntryFormValues) {
    try {
      const payload = {
        serviceId: values.serviceId,
        type: values.type,
        amount: Number(values.amount ?? 0),
        date: values.date ? values.date.format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD"),
        note: values.description,
      };

      loadingService.show();
      const created = await api.createEntry({ ...payload, workspaceId });
      message.success(appI18n.t("legacyInline.finance.presentation_components_finance_entry_form_finance_entry_form_component.k001"));
      onSaved?.(created);
      form.resetFields();
      return created;
    } catch (err) {
      message.error(appI18n.t("legacyInline.finance.presentation_components_finance_entry_form_finance_entry_form_component.k002"));
      throw err;
    } finally {
      loadingService.hide();
    }
  }

  return (
    <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ type: undefined, amount: initial?.amountCents ? initial.amountCents / 100 : undefined }}>
      <Form.Item name="type" label={appI18n.t("legacyInline.finance.presentation_components_finance_entry_form_finance_entry_form_component.k003")} rules={[{ required: true }]}>
        <Select
          options={types.map((t) => ({ label: t.name, value: t.id }))}
          loading={types.length === 0}
        />
      </Form.Item>

      <Form.Item name="amount" label={`${appI18n.t("legacyInline.finance.presentation_components_finance_entry_form_finance_entry_form_component.k004")} (${currencyCode})`} rules={[{ required: true }]}>
        <InputNumber style={{ width: "100%" }} min={0} step={moneyInput.step} formatter={moneyInput.formatter} parser={moneyInput.parser} precision={moneyInput.precision} />
      </Form.Item>

      <Form.Item name="date" label={appI18n.t("legacyInline.finance.presentation_components_finance_entry_form_finance_entry_form_component.k005")}>
        <DatePicker style={{ width: "100%" }} format={dateFormat} />
      </Form.Item>

      <Form.Item name="description" label={appI18n.t("legacyInline.finance.presentation_components_finance_entry_form_finance_entry_form_component.k006")}>
        <Input.TextArea rows={4} />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          {appI18n.t("legacyInline.finance.presentation_components_finance_entry_form_finance_entry_form_component.k007")}
        </Button>
      </Form.Item>
    </Form>
  );
}

export default FinanceEntryForm;
