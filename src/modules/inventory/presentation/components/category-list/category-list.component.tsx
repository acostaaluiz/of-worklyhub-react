import React from "react";
import { Table, Button, Space } from "antd";
import type { CategoryModel } from "@modules/inventory/interfaces/category.model";

type Props = {
  categories: CategoryModel[];
  onEdit: (c: CategoryModel) => void;
  onDeactivate: (c: CategoryModel) => void;
};

export function CategoryListComponent({ categories, onEdit, onDeactivate }: Props) {
  const cols = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Description", dataIndex: "description", key: "description" },
    { title: "Active", dataIndex: "active", key: "active", render: (v: boolean) => (v ? "Yes" : "No") },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: CategoryModel) => (
        <Space>
          <Button onClick={() => onEdit(record)}>Edit</Button>
          <Button danger onClick={() => onDeactivate(record)}>Deactivate</Button>
        </Space>
      ),
    },
  ];

  return <Table rowKey="id" columns={cols} dataSource={categories} pagination={{ pageSize: 10 }} />;
}

export default CategoryListComponent;
