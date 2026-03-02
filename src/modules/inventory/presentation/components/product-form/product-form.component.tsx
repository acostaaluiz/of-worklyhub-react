import React, { useEffect, useState } from "react";
import { Form, Input, InputNumber, Button, Select, Switch } from "antd";
import { centsToMoney, getMoneyInput, moneyToCents } from "@core/utils/mask";
import type { CategoryModel } from "@modules/inventory/interfaces/category.model";
import type { ProductModel } from "@modules/inventory/interfaces/product.model";
import { InventoryService } from "@modules/inventory/services/inventory.service";

type ProductFormValues = Omit<ProductModel, "id" | "createdAt">;

type Props = {
  initial?: Partial<ProductModel>;
  onSubmit: (data: Omit<ProductModel, "id" | "createdAt">) => Promise<void> | void;
  submitting?: boolean;
};

export function ProductFormComponent({ initial, onSubmit, submitting }: Props) {
  const [form] = Form.useForm<ProductFormValues>();
  const [categories, setCategories] = useState<CategoryModel[]>([]);
  const service = React.useMemo(() => new InventoryService(), []);
  const moneyInput = getMoneyInput();

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const cats = await service.listCategories();
        if (!alive) return;
        setCategories(cats.filter((c) => c.active));
      } catch (err) {
        console.debug('product-form: failed to load categories', err);
      }
    })();
    return () => {
      alive = false;
    };
  }, [service]);
  return (
    <Form<ProductFormValues>
      form={form}
      layout="vertical"
      initialValues={{
        stock: 0,
        unit: "un",
        active: true,
        ...initial,
        priceCents: typeof initial?.priceCents === "number" ? centsToMoney(initial.priceCents) : undefined,
        costCents: typeof initial?.costCents === "number" ? centsToMoney(initial.costCents) : undefined,
      }}
      onFinish={(values) => {
        const prepared: Omit<ProductModel, "id" | "createdAt"> = {
          ...values,
          name: values.name,
          stock: typeof values.stock === "number" ? values.stock : 0,
          unit: values.unit ?? "un",
          active: values.active ?? true,
          priceCents:
            typeof values.priceCents === "number" && Number.isFinite(values.priceCents)
              ? moneyToCents(values.priceCents)
              : undefined,
          costCents:
            typeof values.costCents === "number" && Number.isFinite(values.costCents)
              ? moneyToCents(values.costCents)
              : undefined,
        };
        onSubmit(prepared);
      }}
    >
      <Form.Item name="name" label="Name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>

      <Form.Item name="sku" label="SKU">
        <Input />
      </Form.Item>

      <Form.Item name="description" label="Description">
        <Input.TextArea rows={3} />
      </Form.Item>

      <Form.Item name="priceCents" label="Price">
        <InputNumber style={{ width: "100%" }} min={0} step={moneyInput.step} formatter={moneyInput.formatter} parser={moneyInput.parser} precision={moneyInput.precision} />
      </Form.Item>

      <Form.Item name="categoryId" label="Category">
        <Select allowClear placeholder="Select a category">
          {categories.map((c) => (
            <Select.Option key={c.id} value={c.id}>
              {c.name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item name="stock" label="Initial stock">
        <InputNumber style={{ width: "100%" }} min={0} />
      </Form.Item>
      
      <Form.Item name="barcode" label="Barcode">
        <Input />
      </Form.Item>

      <Form.Item name="costCents" label="Cost">
        <InputNumber style={{ width: "100%" }} min={0} step={moneyInput.step} formatter={moneyInput.formatter} parser={moneyInput.parser} precision={moneyInput.precision} />
      </Form.Item>

      <Form.Item name="minStock" label="Minimum stock">
        <InputNumber style={{ width: "100%" }} min={0} />
      </Form.Item>

      <Form.Item name="location" label="Location">
        <Input />
      </Form.Item>

      <Form.Item name="active" label="Active" valuePropName="checked">
        <Switch />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={submitting}>Save</Button>
      </Form.Item>
    </Form>
  );
}

export default ProductFormComponent;
