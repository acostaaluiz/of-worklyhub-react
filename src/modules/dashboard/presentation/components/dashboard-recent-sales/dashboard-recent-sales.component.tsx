import { Skeleton, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";

import type { DashboardSaleItemModel } from "../../../interfaces/dashboard-sale-item.model";
import {
  WidgetCard,
  WidgetHeader,
} from "./dashboard-recent-sales.component.styles";

type Props = {
  items: DashboardSaleItemModel[];
  loading?: boolean;
};

const formatMoney = (value: number) =>
  value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

const statusLabel: Record<string, string> = {
  paid: "Paid",
  pending: "Pending",
  refunded: "Refunded",
};

export function DashboardRecentSales(props: Props) {
  const { items, loading } = props;

  const columns: ColumnsType<DashboardSaleItemModel> = [
    {
      title: "Client",
      dataIndex: "clientName",
      key: "clientName",
      render: (v: string) => <Typography.Text strong>{v}</Typography.Text>,
    },
    {
      title: "Service",
      dataIndex: "serviceName",
      key: "serviceName",
    },
    {
      title: "Date",
      dataIndex: "dateTime",
      key: "dateTime",
      width: 170,
      render: (v: string) => (
        <Typography.Text type="secondary">{v}</Typography.Text>
      ),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      align: "right",
      render: (v: number) => formatMoney(v),
    },
    {
      title: "Status",
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
          <div className="title">Recent sales</div>
          <div className="subtitle">Latest transactions</div>
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
