import { Skeleton, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import styled from "styled-components";
import { formatMoney } from "@core/utils/mask";
import { getFinanceValueColor } from "../../../../utils/finance-value-status";

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
      render: (v) => (
        <span style={{ color: getFinanceValueColor(v, { context: "income" }) }}>
          {formatMoney(v)}
        </span>
      ),
    },
    {
      title: "Avg Ticket",
      dataIndex: "avgTicket",
      key: "avgTicket",
      width: 120,
      align: "right",
      render: (v) => (
        <span style={{ color: getFinanceValueColor(v, { context: "income" }) }}>
          {formatMoney(v)}
        </span>
      ),
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
              scroll={{ x: 520, y: 180 }}
            />
          </Wrap>
        )}
      </WidgetBody>
    </WidgetCard>
  );
}
