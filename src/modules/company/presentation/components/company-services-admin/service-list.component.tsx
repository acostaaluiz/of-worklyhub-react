import type { ReactNode } from "react";
import { Button, Space, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  CheckCircle2,
  CircleAlert,
  CircleDollarSign,
  Clock3,
  Edit,
  Gauge,
  XCircle,
} from "lucide-react";

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
    {
      title: appI18n.t("company.admin.list.columns.title"),
      dataIndex: "title",
      key: "title",
      render: (value?: string) => <Typography.Text strong>{value || appI18n.t("company.admin.common.dash")}</Typography.Text>,
    },
    {
      title: appI18n.t("company.admin.list.columns.duration"),
      dataIndex: "durationMinutes",
      key: "durationMinutes",
      render: (value?: number) => (
        <Space size={6}>
          <Clock3 size={14} />
          <span>{typeof value === "number" ? String(value) : appI18n.t("company.admin.common.dash")}</span>
        </Space>
      ),
    },
    {
      title: appI18n.t("company.admin.list.columns.price"),
      dataIndex: "priceCents",
      key: "priceCents",
      render: (value?: number) => (
        <Space size={6}>
          <CircleDollarSign size={14} />
          <span>{typeof value === "number" ? formatMoneyFromCents(value) : appI18n.t("company.admin.common.dash")}</span>
        </Space>
      ),
    },
    {
      title: appI18n.t("company.admin.list.columns.capacity"),
      dataIndex: "capacity",
      key: "capacity",
      render: (value?: number) => (
        <Space size={6}>
          <Gauge size={14} />
          <span>{typeof value === "number" ? String(value) : appI18n.t("company.admin.common.dash")}</span>
        </Space>
      ),
    },
    {
      title: appI18n.t("company.admin.list.columns.active"),
      dataIndex: "active",
      key: "active",
      render: (value?: boolean) => (
        <Tag color={value ? "green" : "default"}>
          <Space size={4}>
            {value ? <CheckCircle2 size={12} /> : <CircleAlert size={12} />}
            <span>{value ? appI18n.t("company.admin.list.active.yes") : appI18n.t("company.admin.list.active.no")}</span>
          </Space>
        </Tag>
      ),
    },
    {
      title: appI18n.t("company.admin.list.columns.actions"),
      key: "actions",
      render: (_value: unknown, record: CompanyServiceModel) => {
        const isActive = Boolean(record.active);
        return (
          <Space wrap>
            <Button icon={<Edit size={14} />} onClick={() => onEdit(record)}>
              {appI18n.t("company.admin.list.actions.edit")}
            </Button>
            <Button
              type={isActive ? "default" : "primary"}
              danger={isActive}
              icon={isActive ? <XCircle size={14} /> : <CheckCircle2 size={14} />}
              onClick={() => onDeactivate(record)}
            >
              {isActive
                ? appI18n.t("company.admin.list.actions.deactivate")
                : appI18n.t("company.admin.list.actions.activate")}
            </Button>
          </Space>
        );
      },
    },
  ];

  return (
    <SmartTable<CompanyServiceModel>
      columns={cols}
      dataSource={services}
      rowKey="id"
      pageSize={5}
      searchFields={["title", "description"]}
      topLeft={toolbarLeft}
      topRight={toolbarRight}
      tableScroll={{ x: 940 }}
    />
  );
}

export default ServiceListComponent;
