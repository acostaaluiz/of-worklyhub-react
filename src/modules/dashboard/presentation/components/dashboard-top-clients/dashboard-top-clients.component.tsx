import { Skeleton, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";

import type { DashboardClientRankModel } from "../../../interfaces/dashboard-client-rank.model";
import {
  WidgetCard,
  WidgetHeader,
} from "./dashboard-top-clients.component.styles";

type Props = {
  items: DashboardClientRankModel[];
  loading?: boolean;
};

const formatMoney = (value: number) =>
  value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

export function DashboardTopClients(props: Props) {
  const { items, loading } = props;

  const columns: ColumnsType<DashboardClientRankModel> = [
    {
      title: "Client",
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
      title: "Spent",
      dataIndex: "totalSpent",
      key: "totalSpent",
      align: "right",
      width: 140,
      render: (v: number) => formatMoney(v),
    },
    {
      title: "Orders",
      dataIndex: "ordersCount",
      key: "ordersCount",
      align: "right",
      width: 110,
    },
    {
      title: "Avg",
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
          <div className="title">Top clients</div>
          <div className="subtitle">Who buys the most</div>
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
