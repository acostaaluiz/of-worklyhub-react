import React from "react";
import { Input, Table } from "antd";
import type { ColumnsType, ColumnType, TableProps } from "antd/es/table";
import { BaseComponent } from "@shared/base/base.component";
import type { BaseProps } from "@shared/base/interfaces/base-props.interface";
import type { BaseState } from "@shared/base/interfaces/base-state.interface";

type SmartTableProps<T extends object> = BaseProps & {
  columns: ColumnsType<T>;
  dataSource: T[];
  rowKey?: string | ((record: T) => string);
  pageSize?: number;
  searchFields?: Array<keyof T | string>;
  topLeft?: React.ReactNode;
  topRight?: React.ReactNode;
  pagination?: TableProps<T>["pagination"];
  tableScroll?: TableProps<T>["scroll"];
};

type SmartTableState<T extends object> = BaseState & {
  query: string;
  filtered: T[];
};

function toDataMap(value: DataValue): DataMap | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as DataMap;
  }
  return null;
}

function getValue(
  record: object | null | undefined,
  dataIndex?: string | number | (string | number)[]
): DataValue {
  if (!dataIndex || record == null) return undefined;

  let acc: DataValue = record as DataMap;

  if (Array.isArray(dataIndex)) {
    for (const k of dataIndex) {
      const map = toDataMap(acc);
      if (!map) return undefined;
      acc = map[String(k)];
    }
    return acc;
  }

  if (typeof dataIndex === "string" && dataIndex.includes(".")) {
    const parts = dataIndex.split(".");
    for (const k of parts) {
      const map = toDataMap(acc);
      if (!map) return undefined;
      acc = map[k];
    }
    return acc;
  }

  const map = toDataMap(acc);
  if (!map) return undefined;
  return map[String(dataIndex)];
}

export class SmartTable<T extends object> extends BaseComponent<SmartTableProps<T>, SmartTableState<T>> {
  public state: SmartTableState<T> = { isLoading: false, error: undefined, query: "", filtered: [] } as SmartTableState<T>;

  protected renderView(): React.ReactNode {
    const { columns, dataSource, rowKey, pageSize = 10 } = this.props;
    const isCompactViewport =
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 1024px)").matches;

    const mappedColumns: ColumnsType<T> = columns.map((col) => {
      // add client-side sorter when possible
      if (!col.sorter && "dataIndex" in col && col.dataIndex) {
        const column = col as ColumnType<T>;
        const dataIndex = column.dataIndex as string | number | (string | number)[];
        return {
          ...col,
          sorter: (a: T, b: T) => {
            const va = getValue(a, dataIndex);
            const vb = getValue(b, dataIndex);
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

    const pagination: TableProps<T>["pagination"] =
      this.props.pagination === undefined
        ? { pageSize, size: isCompactViewport ? ("small" as const) : undefined }
        : this.props.pagination;

    const tableScroll = this.props.tableScroll
      ? {
          ...(isCompactViewport ? { x: "max-content" } : {}),
          ...this.props.tableScroll,
        }
      : isCompactViewport
        ? { x: "max-content" }
        : undefined;

    return (
      <div>
        <div style={{ marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", minWidth: 0, flex: "1 1 320px" }}>
            <Input.Search
              placeholder="Search"
              allowClear
              onSearch={this.handleSearch}
              onChange={(e) => this.handleSearch((e.target as HTMLInputElement).value)}
              style={{ width: "min(280px, 100%)" }}
            />
            {this.props.topLeft}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>{this.props.topRight}</div>
        </div>
        <Table
          rowKey={rowKey ?? "id"}
          columns={mappedColumns}
          dataSource={this.state.filtered.length ? this.state.filtered : dataSource}
          pagination={pagination}
          size={isCompactViewport ? "small" : "middle"}
          scroll={tableScroll}
        />
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
        const v = getValue(row, String(f));
        return (typeof v === "string" && v.toLowerCase().includes(query)) || (typeof v === "number" && String(v).includes(query));
      });
    });

    this.setSafeState({ filtered, query } as SmartTableState<T>);
  };
}

export default SmartTable;
