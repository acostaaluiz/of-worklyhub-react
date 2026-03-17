import { Skeleton, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useTranslation } from "react-i18next";
import { formatDateTime, formatMoney } from "@core/utils/mask";

import type { DashboardSaleItemModel } from "../../../interfaces/dashboard-sale-item.model";
import {
  WidgetCard,
  WidgetHeader,
} from "./dashboard-recent-sales.component.styles";

type Props = {
  items: DashboardSaleItemModel[];
  loading?: boolean;
};

export function DashboardRecentSales(props: Props) {
  const { t } = useTranslation();
  const { items, loading } = props;

  const statusLabel: Record<string, string> = {
    paid: t("dashboard.common.statuses.paid"),
    pending: t("dashboard.common.statuses.pending"),
    refunded: t("dashboard.common.statuses.refunded"),
  };

  const columns: ColumnsType<DashboardSaleItemModel> = [
    {
      title: t("dashboard.recentSales.columns.client"),
      dataIndex: "clientName",
      key: "clientName",
      render: (v: string) => <Typography.Text strong>{v}</Typography.Text>,
    },
    {
      title: t("dashboard.recentSales.columns.service"),
      dataIndex: "serviceName",
      key: "serviceName",
    },
    {
      title: t("dashboard.recentSales.columns.date"),
      dataIndex: "dateTime",
      key: "dateTime",
      width: 170,
      render: (v: string) => (
        <Typography.Text type="secondary">{formatDateTime(v)}</Typography.Text>
      ),
    },
    {
      title: t("dashboard.recentSales.columns.amount"),
      dataIndex: "amount",
      key: "amount",
      align: "right",
      render: (v: number) => formatMoney(v),
    },
    {
      title: t("dashboard.recentSales.columns.status"),
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (v: string) => {
        const text = statusLabel[v] ?? v;
        if (v === "paid") return <Tag color="success">{text}</Tag>;
        if (v === "pending") return <Tag color="processing">{text}</Tag>;
        return <Tag color="default">{text}</Tag>;
      },
    },
  ];

  return (
    <WidgetCard className="surface">
      <WidgetHeader>
        <div>
          <div className="title">{t("dashboard.recentSales.title")}</div>
          <div className="subtitle">{t("dashboard.recentSales.subtitle")}</div>
        </div>
      </WidgetHeader>

      {loading ? (
        <Skeleton active paragraph={{ rows: 8 }} />
      ) : (
        <Table
          rowKey="id"
          size="middle"
          columns={columns}
          dataSource={items}
          pagination={false}
        />
      )}
    </WidgetCard>
  );
}
