import React from "react";
import { Button, Space, Tag } from "antd";
import { formatMoneyFromCents } from "@core/utils/mask";
import SmartTable from "@shared/ui/components/smart-table/smart-table.component";
import type { CompanyServiceModel } from "@modules/company/interfaces/service.model";

type Props = {
  services: CompanyServiceModel[];
  onEdit: (s: CompanyServiceModel) => void;
  onDeactivate: (s: CompanyServiceModel) => void;
  toolbarLeft?: React.ReactNode;
  toolbarRight?: React.ReactNode;
};

export function ServiceListComponent({ services, onEdit, onDeactivate, toolbarLeft, toolbarRight }: Props) {
  const cols = [
    { title: "Title", dataIndex: "title", key: "title" },
    { title: "Duration (min)", dataIndex: "durationMinutes", key: "durationMinutes" },
    { title: "Price", dataIndex: "priceCents", key: "priceCents", render: (v?: number) => (typeof v === "number" ? formatMoneyFromCents(v) : "-") },
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

  return <SmartTable columns={cols} dataSource={services} rowKey="id" pageSize={10} searchFields={["title"]} topLeft={toolbarLeft} topRight={toolbarRight} />;
}

export default ServiceListComponent;
