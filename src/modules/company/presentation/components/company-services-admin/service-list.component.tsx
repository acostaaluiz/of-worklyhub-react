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
    { title: "Title", dataIndex: "title", key: "title" },
    { title: "Duration (min)", dataIndex: "durationMinutes", key: "duration" },
    { title: "Price (cents)", dataIndex: "priceCents", key: "price", render: (v?: number) => (v ? `R$ ${(v / 100).toFixed(2)}` : "-") },
    { title: "Capacity", dataIndex: "capacity", key: "capacity" },
    { title: "Active", dataIndex: "active", key: "active", render: (v?: boolean) => (v ? <Tag color="green">Yes</Tag> : <Tag>No</Tag>) },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: CompanyServiceModel) => {
        const isActive = Boolean(record?.active);
        return (
          <Space>
            <Button onClick={() => onEdit(record)}>Edit</Button>
            <Button type={isActive ? undefined : "primary"} danger={isActive} onClick={() => onDeactivate(record)}>
              {isActive ? "Deactivate" : "Activate"}
            </Button>
          </Space>
        );
      },
    },
  ];

  return <Table rowKey="id" columns={cols} dataSource={services} pagination={{ pageSize: 10 }} />;
}

export default ServiceListComponent;
