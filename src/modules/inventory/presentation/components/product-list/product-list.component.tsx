import React from "react";
import { Table, Button, Space, Tag } from "antd";
import { ArrowDownOutlined, ArrowUpOutlined, EditOutlined } from "@ant-design/icons";
import { formatMoneyFromCents } from "@core/utils/mask";
import type { CategoryModel } from "@modules/inventory/interfaces/category.model";
import type { ProductModel } from "@modules/inventory/interfaces/product.model";

type Props = {
  products: ProductModel[];
  categories?: CategoryModel[];
  onEdit: (p: ProductModel) => void;
  onEntry: (p: ProductModel) => void;
  onExit: (p: ProductModel) => void;
};

export function ProductListComponent({ products, categories = [], onEdit, onEntry, onExit }: Props) {
  const isCompactViewport =
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 1024px)").matches;

  const catMap = new Map(categories.map((c) => [c.id, c]));

  const cellBorder = { borderRight: "1px solid rgba(255,255,255,0.06)", padding: "8px 12px" } as React.CSSProperties;

  const cols = [
    { title: "Name", dataIndex: "name", key: "name", ellipsis: true, onCell: () => ({ style: cellBorder }) },
    { title: "SKU", dataIndex: "sku", key: "sku", ellipsis: true, onCell: () => ({ style: cellBorder }) },
    {
      title: "Category",
      dataIndex: "categoryId",
      key: "categoryId",
      ellipsis: true,
      render: (id?: string) => (id ? catMap.get(id)?.name ?? "-" : "-"),
      onCell: () => ({ style: cellBorder }),
    },
    {
      title: "Stock",
      dataIndex: "stock",
      key: "stock",
      width: 90,
      render: (v: number, r: ProductModel) => (
        <b style={{ color: r.stock <= (r.minStock ?? 0) ? "#d4380d" : undefined }}>{v}</b>
      ),
      onCell: () => ({ style: cellBorder }),
    },
    { title: "Minimum stock", dataIndex: "minStock", key: "minStock", width: 120, onCell: () => ({ style: cellBorder }) },
    { title: "Location", dataIndex: "location", key: "location", ellipsis: true, onCell: () => ({ style: cellBorder }) },
    {
      title: "Price",
      dataIndex: "priceCents",
      key: "priceCents",
      width: 120,
      render: (v?: number) => (typeof v === "number" ? formatMoneyFromCents(v) : "-"),
      onCell: () => ({ style: cellBorder }),
    },
    {
      title: "Active",
      dataIndex: "active",
      key: "active",
      width: 90,
      render: (v?: boolean) => (v ? <Tag color="green">Yes</Tag> : <Tag>No</Tag>),
      onCell: () => ({ style: cellBorder }),
    },
    {
      title: "Actions",
      key: "actions",
      width: 130,
      // no right border on the last column
      onCell: () => ({ style: { padding: "8px 12px" } }),
      render: (_: DataMap, record: ProductModel) => (
        <Space size={4}>
          <Button size="small" icon={<EditOutlined />} onClick={() => onEdit(record)} />
          <Button
            size="small"
            type="primary"
            icon={<ArrowUpOutlined />}
            onClick={() => onEntry(record)}
          />
          <Button
            size="small"
            danger
            icon={<ArrowDownOutlined />}
            onClick={() => onExit(record)}
          />
        </Space>
      ),
    },
  ];

  return (
    <Table
      rowKey="id"
      columns={cols}
      dataSource={products}
      tableLayout="fixed"
      size={isCompactViewport ? "small" : "middle"}
      pagination={{ pageSize: 4, size: "small", showSizeChanger: false }}
      scroll={{ x: 980, y: isCompactViewport ? 220 : 250 }}
    />
  );
}

export default ProductListComponent;
