import React from "react";
import { Form, Input, DatePicker, InputNumber, Button } from "antd";
import type { EmployeeModel } from "@modules/people/interfaces/employee.model";
import dayjs from "dayjs";

type Props = {
  initial?: Partial<EmployeeModel>;
  onSubmit: (data: Omit<EmployeeModel, "id" | "createdAt">) => Promise<void> | void;
  submitting?: boolean;
};

export function EmployeeFormComponent({ initial, onSubmit, submitting }: Props) {
  const [form] = Form.useForm();

  return (
    <Form form={form} layout="vertical" initialValues={{ active: true, ...initial }} onFinish={(v) => {
      const prepared = { ...v } as any;
      if (v.hiredAt) prepared.hiredAt = (v.hiredAt as dayjs.Dayjs).format("YYYY-MM-DD");
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

      <Form.Item name="phone" label="Phone">
        <Input />
      </Form.Item>

      <Form.Item name="role" label="Role">
        <Input />
      </Form.Item>

      <Form.Item name="department" label="Department">
        <Input />
      </Form.Item>

      <Form.Item name="hiredAt" label="Hired at">
        <DatePicker style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item name="salaryCents" label="Salary (cents)">
        <InputNumber style={{ width: "100%" }} min={0} />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={submitting}>Save</Button>
      </Form.Item>
    </Form>
  );
}

export default EmployeeFormComponent;
