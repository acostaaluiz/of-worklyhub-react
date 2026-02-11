import { Form, Radio, Typography } from "antd";

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
  return (
    <MethodsWrap>
      <Radio.Group
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        style={{ width: "100%" }}
      >
        <Radio value="card">Card</Radio>
        <Radio value="hosted" disabled={disableHosted}>
          Hosted checkout
        </Radio>
      </Radio.Group>

      <MethodsHint>
        <Typography.Text type="secondary">
          Card keeps the user here; hosted redirects to Mercado Pago.
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
