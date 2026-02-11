import React from "react";
import { Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";

import type { WorkOrderStatus } from "@modules/work-order/interfaces/work-order.model";

type Props = {
  statuses: WorkOrderStatus[];
  loading?: boolean;
};

export function WorkOrderStatusesList({ statuses, loading }: Props) {
  const columns = React.useMemo<ColumnsType<WorkOrderStatus>>(
    () => [
      { title: "Code", dataIndex: "code", key: "code" },
      { title: "Label", dataIndex: "label", key: "label" },
      {
        title: "Terminal",
        dataIndex: "isTerminal",
        key: "isTerminal",
        width: 120,
        render: (value: boolean) => (
          <Tag color={value ? "green" : "default"}>
            {value ? "Yes" : "No"}
          </Tag>
        ),
      },
      {
        title: "Order",
        dataIndex: "sortOrder",
        key: "sortOrder",
        width: 120,
        render: (value?: number) => (typeof value === "number" ? value : "--"),
      },
    ],
    []
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, height: "100%" }}>
      <div style={{ fontWeight: 600, fontSize: 16 }}>Statuses</div>
      <Table
        columns={columns}
        dataSource={statuses}
        loading={loading}
        rowKey={(record) => record.id}
        pagination={{ pageSize: 8, size: "small" }}
        scroll={{ y: 340 }}
      />
    </div>
  );
}

export default WorkOrderStatusesList;
