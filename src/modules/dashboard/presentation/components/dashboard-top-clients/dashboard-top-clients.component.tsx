import { Skeleton, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useTranslation } from "react-i18next";
import { formatMoney } from "@core/utils/mask";

import type { DashboardClientRankModel } from "../../../interfaces/dashboard-client-rank.model";
import {
  WidgetCard,
  WidgetHeader,
} from "./dashboard-top-clients.component.styles";

type Props = {
  items: DashboardClientRankModel[];
  loading?: boolean;
};

export function DashboardTopClients(props: Props) {
  const { t } = useTranslation();
  const { items, loading } = props;

  const columns: ColumnsType<DashboardClientRankModel> = [
    {
      title: t("dashboard.topClients.columns.client"),
      dataIndex: "clientName",
      key: "clientName",
      ellipsis: true,
      render: (v: string) => (
        <Typography.Text strong ellipsis={{ tooltip: v }}>
          {v}
        </Typography.Text>
      ),
    },
    {
      title: t("dashboard.topClients.columns.spent"),
      dataIndex: "totalSpent",
      key: "totalSpent",
      align: "right",
      width: 140,
      render: (v: number) => formatMoney(v),
    },
    {
      title: t("dashboard.topClients.columns.orders"),
      dataIndex: "ordersCount",
      key: "ordersCount",
      align: "right",
      width: 110,
    },
    {
      title: t("dashboard.topClients.columns.avg"),
      dataIndex: "avgTicket",
      key: "avgTicket",
      align: "right",
      width: 120,
      render: (v: number) => formatMoney(v),
    },
  ];

  return (
    <WidgetCard className="surface">
      <WidgetHeader>
        <div>
          <div className="title">{t("dashboard.topClients.title")}</div>
          <div className="subtitle">{t("dashboard.topClients.subtitle")}</div>
        </div>
      </WidgetHeader>

      {loading ? (
        <Skeleton active paragraph={{ rows: 10 }} />
      ) : (
        <Table
          rowKey="clientId"
          size="small"
          tableLayout="fixed"
          columns={columns}
          dataSource={items}
          pagination={false}
        />
      )}
    </WidgetCard>
  );
}
