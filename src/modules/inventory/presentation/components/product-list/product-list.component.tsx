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

  const cellBorder = { borderRight: "1px solid rgba(255,255,255,0.06)", padding: "8px 12px" } as React.CSSProperties;

  const cols = [
    { title: "Name", dataIndex: "name", key: "name", onCell: () => ({ style: cellBorder }) },
    { title: "SKU", dataIndex: "sku", key: "sku", onCell: () => ({ style: cellBorder }) },
    { title: "Category", dataIndex: "categoryId", key: "categoryId", render: (id?: string) => (id ? catMap.get(id)?.name ?? "-" : "-"), onCell: () => ({ style: cellBorder }) },
    { title: "Stock", dataIndex: "stock", key: "stock", render: (v: number, r: ProductModel) => <b style={{ color: r.stock <= (r.minStock ?? 0) ? "#d4380d" : undefined }}>{v}</b>, onCell: () => ({ style: cellBorder }) },
    { title: "Minimum stock", dataIndex: "minStock", key: "minStock", onCell: () => ({ style: cellBorder }) },
    { title: "Location", dataIndex: "location", key: "location", onCell: () => ({ style: cellBorder }) },
    { title: "Price", dataIndex: "priceCents", key: "priceCents", render: (v?: number) => (v ? `R$ ${(v / 100).toFixed(2)}` : "-"), onCell: () => ({ style: cellBorder }) },
    { title: "Active", dataIndex: "active", key: "active", render: (v?: boolean) => (v ? <Tag color="green">Yes</Tag> : <Tag>No</Tag>), onCell: () => ({ style: cellBorder }) },
    {
      title: "Actions",
      key: "actions",
      // no right border on the last column
      onCell: () => ({ style: { padding: "8px 12px" } }),
      render: (_: any, record: ProductModel) => (
        <Space>
          <Button onClick={() => onEdit(record)}>Edit</Button>
          <Button type="primary" onClick={() => onEntry(record)}>Stock In</Button>
          <Button danger onClick={() => onExit(record)}>Stock Out</Button>
        </Space>
      ),
    },
  ];

  return <Table rowKey="id" columns={cols} dataSource={products} pagination={{ pageSize: 10 }} />;
}

export default ProductListComponent;
