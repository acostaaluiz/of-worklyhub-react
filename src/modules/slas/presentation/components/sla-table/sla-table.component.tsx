import { Empty, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { i18n as appI18n } from "@core/i18n";
import { formatDate } from "@core/utils/mask";
import { BaseComponent } from "@shared/base/base.component";
import type { BaseProps } from "@shared/base/interfaces/base-props.interface";
import type { BaseState } from "@shared/base/interfaces/base-state.interface";
import type { SlaRow } from "@modules/slas/interfaces/sla-report.model";
import { TableMeta, TableWrapper } from "./sla-table.component.styles";

type Props = BaseProps & {
  rows: SlaRow[];
  loading?: boolean;
};

type State = BaseState;

export class SlaTable extends BaseComponent<Props, State> {
  public state: State = { isLoading: false, error: undefined };

  protected renderView(): React.ReactNode {
    const { rows, loading } = this.props;

    const columns: ColumnsType<SlaRow> = [
      {
        title: appI18n.t("sla.table.date"),
        dataIndex: "workDate",
        key: "workDate",
        render: (value: string) => this.formatDate(value),
      },
      {
        title: appI18n.t("sla.table.employee"),
        dataIndex: "employeeName",
        key: "employeeName",
      },
      {
        title: appI18n.t("sla.table.totalHours"),
        dataIndex: "totalHours",
        key: "totalHours",
        align: "right",
        render: (value: number) => this.formatHours(value),
      },
    ];

    const totalMinutes = rows.reduce((sum, row) => sum + row.totalMinutes, 0);
    const totalHours = totalMinutes / 60;

    return (
      <TableWrapper data-cy="sla-table-wrapper">
        <TableMeta>
          <span data-cy="sla-day-entries">
            {appI18n.t("sla.table.dayEntries", { count: rows.length })}
          </span>
          <span data-cy="sla-total-hours">
            {appI18n.t("sla.table.totalWithValue", { value: this.formatHours(totalHours) })}
          </span>
        </TableMeta>

        <Table
          data-cy="sla-table"
          rowKey="key"
          columns={columns}
          dataSource={rows}
          loading={!!loading}
          pagination={{
            pageSize: 4,
            showSizeChanger: false,
            hideOnSinglePage: true,
          }}
          locale={{
            emptyText: (
              <Empty description={appI18n.t("sla.table.empty")} />
            ),
          }}
        />
      </TableWrapper>
    );
  }

  private formatDate(value: string): string {
    return formatDate(value);
  }

  private formatHours(value: number): string {
    const safe = Number.isFinite(value) ? value : 0;
    return `${safe.toFixed(2)} h`;
  }
}

export default SlaTable;
