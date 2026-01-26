import { Button, DatePicker, Segmented, Typography } from "antd";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import { RefreshCw } from "lucide-react";
import { useMemo } from "react";
import { getDateFormat } from "@core/utils/mask";

import type {
  DashboardQueryModel,
  DashboardGroupBy,
} from "../../../interfaces/dashboard-query.model";
import {
  FiltersCard,
  FiltersLeft,
  FiltersRight,
  ViewSegment,
} from "./dashboard-filters.component.styles";

export type DashboardView =
  | "overview"
  | "revenue"
  | "services"
  | "clients"
  | "sales";

type Props = {
  value: DashboardQueryModel;
  onChange: (next: DashboardQueryModel) => void;
  view: DashboardView;
  onViewChange: (next: DashboardView) => void;
  loading?: boolean;
};

export function DashboardFilters(props: Props) {
  const { value, onChange, loading, view, onViewChange } = props;
  const dateFormat = getDateFormat();

  const rangeValue = useMemo<[Dayjs, Dayjs]>(() => {
    return [dayjs(value.from, "YYYY-MM-DD"), dayjs(value.to, "YYYY-MM-DD")];
  }, [value.from, value.to]);

  const setRange = (next: [Dayjs, Dayjs] | null) => {
    if (!next) return;
    onChange({
      ...value,
      from: next[0].format("YYYY-MM-DD"),
      to: next[1].format("YYYY-MM-DD"),
    });
  };

  const setGroupBy = (g: DashboardGroupBy) => {
    onChange({ ...value, groupBy: g });
  };

  const handleRefresh = () => {
    onChange({ ...value });
  };

  return (
    <FiltersCard className="surface">
      <FiltersLeft>
        <Typography.Text strong>Period</Typography.Text>
        <DatePicker.RangePicker value={rangeValue} onChange={setRange as any} format={dateFormat} />
        <ViewSegment
          value={view}
          onChange={(v) => onViewChange(v as DashboardView)}
          options={[
            { label: "Overview", value: "overview" },
            { label: "Revenue", value: "revenue" },
            { label: "Services", value: "services" },
            { label: "Clients", value: "clients" },
            { label: "Sales", value: "sales" },
          ]}
        />
      </FiltersLeft>

      <FiltersRight>
        <Segmented
          value={value.groupBy}
          onChange={(v) => setGroupBy(v as DashboardGroupBy)}
          options={[
            { label: "Day", value: "day" },
            { label: "Week", value: "week" },
            { label: "Month", value: "month" },
          ]}
        />
        <Button
          icon={<RefreshCw size={16} />}
          onClick={handleRefresh}
          loading={loading}
        >
          Refresh
        </Button>
      </FiltersRight>
    </FiltersCard>
  );
}
