import React from "react";
import { Input, Table } from "antd";
import type { ColumnsType, ColumnType } from "antd/es/table";
import { BaseComponent } from "@shared/base/base.component";
import type { BaseProps } from "@shared/base/interfaces/base-props.interface";
import type { BaseState } from "@shared/base/interfaces/base-state.interface";

type SmartTableProps<T> = BaseProps & {
  columns: ColumnsType<T>;
  dataSource: T[];
  rowKey?: string | ((record: T) => string);
  pageSize?: number;
  searchFields?: Array<keyof T | string>;
  topLeft?: React.ReactNode;
  topRight?: React.ReactNode;
};

type SmartTableState<T> = BaseState & {
  query: string;
  filtered: T[];
};
function getValue(record: Record<string, unknown> | null | undefined, dataIndex?: string | number | (string | number)[]): unknown {
  if (!dataIndex || record == null) return undefined;

  let acc: unknown = record;

  if (Array.isArray(dataIndex)) {
    for (const k of dataIndex) {
      if (acc && typeof acc === "object") {
        acc = (acc as Record<string, unknown>)[String(k)];
      } else {
        return undefined;
      }
    }
    return acc;
  }

  if (typeof dataIndex === "string" && dataIndex.includes(".")) {
    const parts = dataIndex.split(".");
    for (const k of parts) {
      if (acc && typeof acc === "object") {
        acc = (acc as Record<string, unknown>)[k];
      } else {
        return undefined;
      }
    }
    return acc;
  }

  if (acc && typeof acc === "object") {
    return (acc as Record<string, unknown>)[String(dataIndex)];
  }

  return undefined;
}

export class SmartTable<T extends Record<string, unknown>> extends BaseComponent<SmartTableProps<T>, SmartTableState<T>> {
  public state: SmartTableState<T> = { isLoading: false, error: undefined, query: "", filtered: [] } as SmartTableState<T>;

  protected renderView(): React.ReactNode {
    const { columns, dataSource, rowKey, pageSize = 10 } = this.props;

    const mappedColumns: ColumnsType<T> = columns.map((col) => {
      // add client-side sorter when possible
      if (!col.sorter && "dataIndex" in col && col.dataIndex) {
        const column = col as ColumnType<T>;
        const dataIndex = column.dataIndex as string | number | (string | number)[];
        return {
          ...col,
          sorter: (a: T, b: T) => {
            const va = getValue(a as unknown as Record<string, unknown>, dataIndex);
            const vb = getValue(b as unknown as Record<string, unknown>, dataIndex);
            if (va == null && vb == null) return 0;
            if (va == null) return -1;
            if (vb == null) return 1;
            if (typeof va === "number" && typeof vb === "number") return va - vb;
            return String(va).localeCompare(String(vb));
          },
        };
      }

      return col;
    });

    return (
      <div>
        <div style={{ marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Input.Search placeholder="Search" allowClear onSearch={this.handleSearch} onChange={(e) => this.handleSearch((e.target as HTMLInputElement).value)} style={{ width: 280 }} />
            {this.props.topLeft}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>{this.props.topRight}</div>
        </div>
        <Table rowKey={rowKey ?? "id"} columns={mappedColumns} dataSource={this.state.filtered.length ? this.state.filtered : dataSource} pagination={{ pageSize }} />
      </div>
    );
  }

  componentDidMount(): void {
    super.componentDidMount();
    this.setSafeState({ filtered: this.props.dataSource ?? [] } as SmartTableState<T>);
  }

  componentDidUpdate(prevProps: SmartTableProps<T>): void {
    if (prevProps.dataSource !== this.props.dataSource) {
      // reset filter when data changes
      this.setSafeState({ filtered: this.props.dataSource ?? [], query: "" } as SmartTableState<T>);
    }
  }

  private handleSearch = (q?: string) => {
    const query = (q ?? "").trim().toLowerCase();
    const { dataSource } = this.props;
    if (!query) {
      this.setSafeState({ filtered: dataSource ?? [], query: "" } as SmartTableState<T>);
      return;
    }

    const fields = (this.props.searchFields && this.props.searchFields.length ? this.props.searchFields : Object.keys((dataSource && dataSource[0]) || {})) as Array<string>;

    const filtered = (dataSource || []).filter((row) => {
      return fields.some((f) => {
        const v = getValue(row as unknown as Record<string, unknown>, String(f));
        return (typeof v === "string" && v.toLowerCase().includes(query)) || (typeof v === "number" && String(v).includes(query));
      });
    });

    this.setSafeState({ filtered, query } as SmartTableState<T>);
  };
}

export default SmartTable;
