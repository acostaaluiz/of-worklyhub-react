import React from "react";
import { Table, Button, Space, Tag } from "antd";
import type { CompanyServiceModel } from "@modules/company/interfaces/service.model";

type Props = {
  services: CompanyServiceModel[];
  onEdit: (s: CompanyServiceModel) => void;
  onDeactivate: (s: CompanyServiceModel) => void;
};

export function ServiceListComponent({ services, onEdit, onDeactivate }: Props) {
  const cols = [
    { title: "Título", dataIndex: "title", key: "title" },
    { title: "Duração (min)", dataIndex: "durationMinutes", key: "duration" },
    { title: "Preço", dataIndex: "priceCents", key: "price", render: (v?: number) => (v ? `R$ ${(v / 100).toFixed(2)}` : "-") },
    { title: "Capacidade", dataIndex: "capacity", key: "capacity" },
    { title: "Ativo", dataIndex: "active", key: "active", render: (v?: boolean) => (v ? <Tag color="green">Sim</Tag> : <Tag>Não</Tag>) },
    {
      title: "Ações",
      key: "actions",
      render: (_: any, record: CompanyServiceModel) => (
        <Space>
          <Button onClick={() => onEdit(record)}>Editar</Button>
          <Button danger onClick={() => onDeactivate(record)}>Inativar</Button>
        </Space>
      ),
    },
  ];

  return <Table rowKey="id" columns={cols} dataSource={services} pagination={{ pageSize: 10 }} />;
}

export default ServiceListComponent;
