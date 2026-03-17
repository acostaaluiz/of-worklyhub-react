import type { ReactNode } from "react";
import { Button, Space, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { i18n as appI18n } from "@core/i18n";
import { formatMoneyFromCents } from "@core/utils/mask";
import SmartTable from "@shared/ui/components/smart-table/smart-table.component";
import type { CompanyServiceModel } from "@modules/company/interfaces/service.model";

type Props = {
  services: CompanyServiceModel[];
  onEdit: (s: CompanyServiceModel) => void;
  onDeactivate: (s: CompanyServiceModel) => void;
  toolbarLeft?: ReactNode;
  toolbarRight?: ReactNode;
};

export function ServiceListComponent({ services, onEdit, onDeactivate, toolbarLeft, toolbarRight }: Props) {
  const cols: ColumnsType<CompanyServiceModel> = [
    { title: appI18n.t("company.admin.list.columns.title"), dataIndex: "title", key: "title" },
    { title: appI18n.t("company.admin.list.columns.duration"), dataIndex: "durationMinutes", key: "durationMinutes" },
    { title: appI18n.t("company.admin.list.columns.price"), dataIndex: "priceCents", key: "priceCents", render: (v?: number) => (typeof v === "number" ? formatMoneyFromCents(v) : appI18n.t("company.admin.common.dash")) },
    { title: appI18n.t("company.admin.list.columns.capacity"), dataIndex: "capacity", key: "capacity" },
    { title: appI18n.t("company.admin.list.columns.active"), dataIndex: "active", key: "active", render: (v?: boolean) => (v ? <Tag color="green">{appI18n.t("company.admin.list.active.yes")}</Tag> : <Tag>{appI18n.t("company.admin.list.active.no")}</Tag>) },
    {
      title: appI18n.t("company.admin.list.columns.actions"),
      key: "actions",
      render: (_: DataMap, record: CompanyServiceModel) => {
        const isActive = Boolean(record?.active);
        return (
          <Space>
            <Button onClick={() => onEdit(record)}>{appI18n.t("company.admin.list.actions.edit")}</Button>
            <Button type={isActive ? undefined : "primary"} danger={isActive} onClick={() => onDeactivate(record)}>
              {isActive ? appI18n.t("company.admin.list.actions.deactivate") : appI18n.t("company.admin.list.actions.activate")}
            </Button>
          </Space>
        );
      },
    },
  ];

  return <SmartTable<CompanyServiceModel> columns={cols} dataSource={services} rowKey="id" pageSize={10} searchFields={["title"]} topLeft={toolbarLeft} topRight={toolbarRight} />;
}

export default ServiceListComponent;
