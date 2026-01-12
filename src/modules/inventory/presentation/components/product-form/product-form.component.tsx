import React, { useEffect, useState } from "react";
import { Form, Input, InputNumber, Button, Select, Switch } from "antd";
import type { ProductModel } from "@modules/inventory/interfaces/product.model";
import type { CategoryModel } from "@modules/inventory/interfaces/category.model";
import { InventoryService } from "@modules/inventory/services/inventory.service";

type Props = {
  initial?: Partial<ProductModel>;
  onSubmit: (data: Omit<ProductModel, "id" | "createdAt">) => Promise<void> | void;
  submitting?: boolean;
};

export function ProductFormComponent({ initial, onSubmit, submitting }: Props) {
  const [form] = Form.useForm();
  const [categories, setCategories] = useState<CategoryModel[]>([]);
  const service = React.useMemo(() => new InventoryService(), []);

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
    <Form form={form} layout="vertical" initialValues={{ stock: 0, unit: "un", active: true, ...initial }} onFinish={(v) => onSubmit(v as any)}>
      <Form.Item name="name" label="Nome" rules={[{ required: true }]}>
        <Input />
      </Form.Item>

      <Form.Item name="sku" label="SKU">
        <Input />
      </Form.Item>

      <Form.Item name="description" label="Descrição">
        <Input.TextArea rows={3} />
      </Form.Item>

      <Form.Item name="priceCents" label="Preço (centavos)">
        <InputNumber style={{ width: "100%" }} min={0} />
      </Form.Item>

      <Form.Item name="categoryId" label="Categoria">
        <Select allowClear placeholder="Selecione uma categoria">
          {categories.map((c) => (
            <Select.Option key={c.id} value={c.id}>
              {c.name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item name="stock" label="Estoque inicial">
        <InputNumber style={{ width: "100%" }} min={0} />
      </Form.Item>
      
      <Form.Item name="barcode" label="Código de barras">
        <Input />
      </Form.Item>

      <Form.Item name="costCents" label="Custo (centavos)">
        <InputNumber style={{ width: "100%" }} min={0} />
      </Form.Item>

      <Form.Item name="minStock" label="Estoque mínimo">
        <InputNumber style={{ width: "100%" }} min={0} />
      </Form.Item>

      <Form.Item name="location" label="Localização">
        <Input />
      </Form.Item>

      <Form.Item name="active" label="Ativo" valuePropName="checked">
        <Switch />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={submitting}>Salvar</Button>
      </Form.Item>
    </Form>
  );
}

export default ProductFormComponent;
