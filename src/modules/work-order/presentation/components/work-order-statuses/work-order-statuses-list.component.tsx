import React from "react";
import { Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";

import { i18n as appI18n } from "@core/i18n";
import type { WorkOrderStatus } from "@modules/work-order/interfaces/work-order.model";

type Props = {
  statuses: WorkOrderStatus[];
  loading?: boolean;
};

export function WorkOrderStatusesList({ statuses, loading }: Props) {
        const columns = React.useMemo<ColumnsType<WorkOrderStatus>>(
    () => [
      { title: appI18n.t("legacyInline.work_order.presentation_components_work_order_statuses_work_order_statuses_list_component.k001"), dataIndex: "code", key: "code" },
      { title: appI18n.t("legacyInline.work_order.presentation_components_work_order_statuses_work_order_statuses_list_component.k002"), dataIndex: "label", key: "label" },
      {
        title: appI18n.t("legacyInline.work_order.presentation_components_work_order_statuses_work_order_statuses_list_component.k003"),
        dataIndex: "isTerminal",
        key: "isTerminal",
        width: 120,
        render: (value: boolean) => (
          <Tag color={value ? "green" : "default"}>
            {value ? appI18n.t("legacyInline.work_order.presentation_components_work_order_statuses_work_order_statuses_list_component.k004") : appI18n.t("legacyInline.work_order.presentation_components_work_order_statuses_work_order_statuses_list_component.k005")}
          </Tag>
        ),
      },
      {
        title: appI18n.t("legacyInline.work_order.presentation_components_work_order_statuses_work_order_statuses_list_component.k006"),
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
      <div style={{ fontWeight: 600, fontSize: 16 }}>{appI18n.t("legacyInline.work_order.presentation_components_work_order_statuses_work_order_statuses_list_component.k007")}</div>
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
