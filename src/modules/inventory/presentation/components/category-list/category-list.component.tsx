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
    { title: "Nome", dataIndex: "name", key: "name" },
    { title: "Descrição", dataIndex: "description", key: "description" },
    { title: "Ativo", dataIndex: "active", key: "active", render: (v: boolean) => (v ? "Sim" : "Não") },
    {
      title: "Ações",
      key: "actions",
      render: (_: any, record: CategoryModel) => (
        <Space>
          <Button onClick={() => onEdit(record)}>Editar</Button>
          <Button danger onClick={() => onDeactivate(record)}>Inativar</Button>
        </Space>
      ),
    },
  ];

  return <Table rowKey="id" columns={cols} dataSource={categories} pagination={{ pageSize: 10 }} />;
}

export default CategoryListComponent;
