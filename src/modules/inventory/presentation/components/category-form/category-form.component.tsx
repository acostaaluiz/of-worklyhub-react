import { Form, Input, Button } from "antd";
import type { CategoryModel } from "@modules/inventory/interfaces/category.model";

type CategoryFormValues = Omit<CategoryModel, "id" | "createdAt">;

type Props = {
  initial?: Partial<CategoryModel>;
  onSubmit: (data: Omit<CategoryModel, "id" | "createdAt">) => Promise<void> | void;
  submitting?: boolean;
};

export function CategoryFormComponent({ initial, onSubmit, submitting }: Props) {
  const [form] = Form.useForm<CategoryFormValues>();
  return (
    <Form<CategoryFormValues>
      form={form}
      layout="vertical"
      initialValues={{ active: true, ...initial }}
      onFinish={(values) =>
        onSubmit({
          name: values.name,
          description: values.description,
          active: values.active ?? true,
        })
      }
      data-cy="inventory-category-form"
    >
      <Form.Item name="name" label="Name" rules={[{ required: true }]}>
        <Input data-cy="inventory-category-name-input" />
      </Form.Item>

      <Form.Item name="description" label="Description">
        <Input.TextArea rows={2} data-cy="inventory-category-description-input" />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={submitting} data-cy="inventory-category-save-button">Save</Button>
      </Form.Item>
    </Form>
  );
}

export default CategoryFormComponent;
