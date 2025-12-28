import React from "react";
import { Form, Input, Button } from "antd";
import type { CategoryModel } from "@modules/inventory/interfaces/category.model";

type Props = {
  initial?: Partial<CategoryModel>;
  onSubmit: (data: Omit<CategoryModel, "id" | "createdAt">) => Promise<void> | void;
  submitting?: boolean;
};

export function CategoryFormComponent({ initial, onSubmit, submitting }: Props) {
  const [form] = Form.useForm();
  return (
    <Form form={form} layout="vertical" initialValues={{ active: true, ...initial }} onFinish={(v) => onSubmit(v as any)}>
      <Form.Item name="name" label="Nome" rules={[{ required: true }]}>
        <Input />
      </Form.Item>

      <Form.Item name="description" label="Descrição">
        <Input.TextArea rows={2} />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={submitting}>Salvar</Button>
      </Form.Item>
    </Form>
  );
}

export default CategoryFormComponent;
