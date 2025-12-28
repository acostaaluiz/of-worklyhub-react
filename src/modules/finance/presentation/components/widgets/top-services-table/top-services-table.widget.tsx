import { Skeleton, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import styled from "styled-components";

import type { FinanceTopServiceRow } from "../../../../interfaces/finance-table.model";
import {
  WidgetBody,
  WidgetCard,
  WidgetHeader,
} from "../finance-widgets.shared.styles";

type Props = {
  className?: string;
  items: FinanceTopServiceRow[];
  loading?: boolean;
  subtitle?: string;
};

const Wrap = styled.div`
  min-width: 0;
  min-height: 0;
  height: 100%;

  .ant-table-wrapper,
  .ant-spin-nested-loading,
  .ant-spin-container,
  .ant-table,
  .ant-table-container {
    height: 100%;
    min-height: 0;
    min-width: 0;
  }

  .ant-table-content {
    overflow: auto;
  }

  .ant-table-cell {
    white-space: nowrap;
  }
`;

const formatMoney = (value: number) =>
  value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

export function TopServicesTableWidget({
  className,
  items,
  loading,
  subtitle,
}: Props) {
  const columns: ColumnsType<FinanceTopServiceRow> = [
    {
      title: "Service",
      dataIndex: "serviceName",
      key: "serviceName",
      ellipsis: true,
    },
    {
      title: "Orders",
      dataIndex: "orders",
      key: "orders",
      width: 90,
      align: "right",
    },
    {
      title: "Revenue",
      dataIndex: "revenue",
      key: "revenue",
      width: 130,
      align: "right",
      render: (v) => formatMoney(v),
    },
    {
      title: "Avg Ticket",
      dataIndex: "avgTicket",
      key: "avgTicket",
      width: 120,
      align: "right",
      render: (v) => formatMoney(v),
    },
  ];

  return (
    <WidgetCard className={className}>
      <WidgetHeader>
        <div className="title">Top Services</div>
        <div className="subtitle">
          {subtitle ?? "Best performing services."}
        </div>
      </WidgetHeader>

      <WidgetBody>
        {loading ? (
          <Skeleton active paragraph={{ rows: 7 }} />
        ) : (
          <Wrap>
            <Table
              rowKey="id"
              size="small"
              columns={columns}
              dataSource={items}
              pagination={false}
              tableLayout="fixed"
              scroll={{ x: 520, y: 260 }}
            />
          </Wrap>
        )}
      </WidgetBody>
    </WidgetCard>
  );
}
