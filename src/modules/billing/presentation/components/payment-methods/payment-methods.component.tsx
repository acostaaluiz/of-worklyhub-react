import { Form, Radio, Typography } from "antd";
import { useTranslation } from "react-i18next";

import { MethodsHint, MethodsWrap } from "./payment-methods.component.styles";

type PaymentMethodValue = "card" | "hosted";

type PaymentMethodsProps = {
  value?: PaymentMethodValue;
  onChange?: (value: PaymentMethodValue) => void;
  disableHosted?: boolean;
};

export function PaymentMethods({
  value,
  onChange,
  disableHosted = false,
}: PaymentMethodsProps) {
  const { t } = useTranslation();

  return (
    <MethodsWrap>
      <Radio.Group
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        style={{ width: "100%" }}
      >
        <Radio value="card">{t("billing.paymentMethods.card")}</Radio>
        <Radio value="hosted" disabled={disableHosted}>
          {t("billing.paymentMethods.hosted")}
        </Radio>
      </Radio.Group>

      <MethodsHint>
        <Typography.Text type="secondary">
          {t("billing.paymentMethods.hint")}
        </Typography.Text>
      </MethodsHint>
    </MethodsWrap>
  );
}

export function PaymentMethodsField() {
  return (
    <Form.Item name="method" style={{ marginBottom: 0 }}>
      <PaymentMethods />
    </Form.Item>
  );
}
