import React from "react";
import { Form, Input, DatePicker, InputNumber, Button } from "antd";
import dayjs from "dayjs";
import { centsToMoney, getDateFormat, getMoneyInput, maskPhone, moneyToCents, unmaskPhone } from "@core/utils/mask";
import type { EmployeeModel } from "@modules/people/interfaces/employee.model";

type Props = {
  initial?: Partial<EmployeeModel>;
  onSubmit: (data: Omit<EmployeeModel, "id" | "createdAt">) => Promise<void> | void;
  submitting?: boolean;
};

export function EmployeeFormComponent({ initial, onSubmit, submitting }: Props) {
  const [form] = Form.useForm();
  const moneyInput = getMoneyInput();
  const dateFormat = getDateFormat();

  return (
    <Form form={form} layout="vertical" initialValues={{ active: true, ...initial, salaryCents: typeof initial?.salaryCents === "number" ? centsToMoney(initial.salaryCents) : undefined, phone: maskPhone(initial?.phone) }} onFinish={(v) => {
      const prepared = { ...v } as any;
      if (v.hiredAt) prepared.hiredAt = (v.hiredAt as dayjs.Dayjs).format("YYYY-MM-DD");
      if (v.phone) prepared.phone = unmaskPhone(v.phone);
      if (typeof v.salaryCents === "number" && Number.isFinite(v.salaryCents)) {
        prepared.salaryCents = moneyToCents(v.salaryCents);
      } else {
        prepared.salaryCents = undefined;
      }
      onSubmit(prepared);
    }}>
      <Form.Item name="firstName" label="First name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>

      <Form.Item name="lastName" label="Last name">
        <Input />
      </Form.Item>

      <Form.Item name="email" label="Email">
        <Input />
      </Form.Item>

      <Form.Item name="phone" label="Phone" normalize={(value) => maskPhone(String(value ?? ""))}>
        <Input />
      </Form.Item>

      <Form.Item name="role" label="Role">
        <Input />
      </Form.Item>

      <Form.Item name="department" label="Department">
        <Input />
      </Form.Item>

      <Form.Item name="hiredAt" label="Hired at">
        <DatePicker style={{ width: "100%" }} format={dateFormat} />
      </Form.Item>

      <Form.Item name="salaryCents" label="Salary">
        <InputNumber style={{ width: "100%" }} min={0} step={moneyInput.step} formatter={moneyInput.formatter} parser={moneyInput.parser} precision={moneyInput.precision} />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={submitting}>Save</Button>
      </Form.Item>
    </Form>
  );
}

export default EmployeeFormComponent;
