import { Skeleton, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";

import type { FinanceCashflowRow } from "../../../../interfaces/finance-table.model";
import {
  WidgetBody,
  WidgetCard,
  WidgetHeader,
} from "../finance-widgets.shared.styles";
import styled from "styled-components";

type Props = {
  className?: string;
  items: FinanceCashflowRow[];
  loading?: boolean;
  subtitle?: string;
  dense?: boolean;
};

const Wrap = styled.div`
  min-width: 0;
  min-height: 0;
  height: 100%;

  /* Containment rules */
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

export function CashflowTableWidget({
  className,
  items,
  loading,
  subtitle,
  dense = true,
}: Props) {
  const columns: ColumnsType<FinanceCashflowRow> = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      width: 120,
      ellipsis: true,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      width: 90,
      render: (v) => <Tag>{v === "in" ? "IN" : "OUT"}</Tag>,
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      width: 120,
      ellipsis: true,
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      width: 120,
      align: "right",
      render: (v) => formatMoney(v),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 110,
      render: (v) => <Tag>{v === "paid" ? "PAID" : "PENDING"}</Tag>,
    },
  ];

  return (
    <WidgetCard className={className}>
      <WidgetHeader>
        <div className="title">Cashflow</div>
        <div className="subtitle">
          {subtitle ?? "Latest incoming and outgoing records."}
        </div>
      </WidgetHeader>

      <WidgetBody>
        {loading ? (
          <Skeleton active paragraph={{ rows: 8 }} />
        ) : (
          <Wrap>
            <Table
              rowKey="id"
              size={dense ? "small" : "middle"}
              columns={columns}
              dataSource={items}
              pagination={false}
              tableLayout="fixed"
              scroll={{ x: 720, y: dense ? 180 : 360 }}
            />
          </Wrap>
        )}
      </WidgetBody>
    </WidgetCard>
  );
}
