import { Form, Radio, Typography } from "antd";

import { MethodsHint, MethodsWrap } from "./payment-methods.component.styles";

type PaymentMethodValue = "card" | "pix";

type PaymentMethodsProps = {
  value?: PaymentMethodValue;
  onChange?: (value: PaymentMethodValue) => void;
  disablePix?: boolean;
};

export function PaymentMethods({
  value,
  onChange,
  disablePix = true,
}: PaymentMethodsProps) {
  return (
    <MethodsWrap>
      <Radio.Group
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        style={{ width: "100%" }}
      >
        <Radio value="card">Card</Radio>
        <Radio value="pix" disabled={disablePix}>
          Pix (soon)
        </Radio>
      </Radio.Group>

      <MethodsHint>
        <Typography.Text type="secondary">
          You can change the payment method later.
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
