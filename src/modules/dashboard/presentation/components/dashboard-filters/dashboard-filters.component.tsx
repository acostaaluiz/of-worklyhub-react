import { Button, DatePicker, Segmented, Typography } from "antd";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import { RefreshCw } from "lucide-react";
import { useMemo } from "react";
import { getDateFormat } from "@core/utils/mask";
import { useTranslation } from "react-i18next";

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
  | "trend"
  | "services"
  | "alerts";

type Props = {
  value: DashboardQueryModel;
  onChange: (next: DashboardQueryModel) => void;
  view: DashboardView;
  onViewChange: (next: DashboardView) => void;
  loading?: boolean;
};

export function DashboardFilters(props: Props) {
  const { t } = useTranslation();
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
        <Typography.Text strong>{t("dashboard.filters.period")}</Typography.Text>
        <DatePicker.RangePicker
          value={rangeValue}
          onChange={(dates) => {
            if (!dates || !dates[0] || !dates[1]) return;
            setRange([dates[0], dates[1]]);
          }}
          format={dateFormat}
        />
        <ViewSegment
          value={view}
          onChange={(v) => onViewChange(v as DashboardView)}
          options={[
            { label: t("dashboard.filters.view.overview"), value: "overview" },
            { label: t("dashboard.filters.view.trend"), value: "trend" },
            { label: t("dashboard.filters.view.services"), value: "services" },
            { label: t("dashboard.filters.view.alerts"), value: "alerts" },
          ]}
        />
      </FiltersLeft>

      <FiltersRight>
        <Segmented
          value={value.groupBy}
          onChange={(v) => setGroupBy(v as DashboardGroupBy)}
          options={[
            { label: t("dashboard.filters.groupBy.day"), value: "day" },
            { label: t("dashboard.filters.groupBy.week"), value: "week" },
            { label: t("dashboard.filters.groupBy.month"), value: "month" },
          ]}
        />
        <Button
          icon={<RefreshCw size={16} />}
          onClick={handleRefresh}
          loading={loading}
        >
          {t("dashboard.filters.refresh")}
        </Button>
      </FiltersRight>
    </FiltersCard>
  );
}
