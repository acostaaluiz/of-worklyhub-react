import React from "react";
import { Table, Button, Space, Tag } from "antd";
import type { ProductModel } from "@modules/inventory/interfaces/product.model";
import type { CategoryModel } from "@modules/inventory/interfaces/category.model";

type Props = {
  products: ProductModel[];
  categories?: CategoryModel[];
  onEdit: (p: ProductModel) => void;
  onEntry: (p: ProductModel) => void;
  onExit: (p: ProductModel) => void;
};

export function ProductListComponent({ products, categories = [], onEdit, onEntry, onExit }: Props) {
  const catMap = new Map(categories.map((c) => [c.id, c]));

  const cols = [
    { title: "Nome", dataIndex: "name", key: "name" },
    { title: "SKU", dataIndex: "sku", key: "sku" },
    { title: "Categoria", dataIndex: "categoryId", key: "categoryId", render: (id?: string) => (id ? catMap.get(id)?.name ?? "-" : "-") },
    { title: "Estoque", dataIndex: "stock", key: "stock", render: (v: number, r: ProductModel) => <b style={{ color: r.stock <= (r.minStock ?? 0) ? "#d4380d" : undefined }}>{v}</b> },
    { title: "Estoque mínimo", dataIndex: "minStock", key: "minStock" },
    { title: "Localização", dataIndex: "location", key: "location" },
    { title: "Preço", dataIndex: "priceCents", key: "priceCents", render: (v?: number) => (v ? `R$ ${(v / 100).toFixed(2)}` : "-") },
    { title: "Ativo", dataIndex: "active", key: "active", render: (v?: boolean) => (v ? <Tag color="green">Sim</Tag> : <Tag>Não</Tag>) },
    {
      title: "Ações",
      key: "actions",
      render: (_: any, record: ProductModel) => (
        <Space>
          <Button onClick={() => onEdit(record)}>Editar</Button>
          <Button type="primary" onClick={() => onEntry(record)}>Entrada</Button>
          <Button danger onClick={() => onExit(record)}>Saída</Button>
        </Space>
      ),
    },
  ];

  return <Table rowKey="id" columns={cols} dataSource={products} pagination={{ pageSize: 10 }} />;
}

export default ProductListComponent;
