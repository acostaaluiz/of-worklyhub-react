import { Button, DatePicker, Grid, Segmented, Select } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { RefreshCcw } from "lucide-react";
import { getDateFormat } from "@core/utils/mask";

import type { FinanceGroupBy } from "../../../interfaces/finance-groupby.model";
import type { FinanceView } from "../../../interfaces/finance-query.model";

import {
  Left,
  PeriodGroup,
  Right,
  Row,
  SegmentedRail,
  SelectGroup,
} from "./finance-filters.component.styles";

type Props = {
  from: string;
  to: string;
  view: FinanceView;
  groupBy: FinanceGroupBy;
  loading?: boolean;
  availableViews?: FinanceView[];

  onChangePeriod: (from: string, to: string) => void;
  onChangeView: (view: FinanceView) => void;
  onChangeGroupBy: (groupBy: FinanceGroupBy) => void;
  onRefresh: () => void;
};

export function FinanceFilters({
  from,
  to,
  view,
  groupBy,
  loading,
  onChangePeriod,
  onChangeView,
  onChangeGroupBy,
  onRefresh,
  availableViews,
}: Props) {
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const dateFormat = getDateFormat();
  const viewOptions: Array<{ label: string; value: FinanceView }> = [
    { label: "Overview", value: "overview" },
    { label: "Insights", value: "insights" },
    { label: "Revenue", value: "revenue" },
    { label: "Services", value: "top-services" },
    { label: "Expenses", value: "expenses" },
    { label: "Profit", value: "profit" },
    { label: "Cashflow", value: "cashflow" },
  ];

  const options = availableViews?.length
    ? viewOptions.filter((opt) => availableViews.includes(opt.value))
    : viewOptions;
  const periodValue: [Dayjs, Dayjs] = [dayjs(from), dayjs(to)];

  return (
    <Row>
      <Left>
        <PeriodGroup>
          <div className="label">Period</div>

          <DatePicker.RangePicker
            value={periodValue}
            onChange={(v) => {
              const a = v?.[0] ? dayjs(v[0]).format("YYYY-MM-DD") : from;
              const b = v?.[1] ? dayjs(v[1]).format("YYYY-MM-DD") : to;
              onChangePeriod(a, b);
            }}
            allowClear={false}
            format={dateFormat}
          />
        </PeriodGroup>

        {/* VIEW selector must be next to period */}
        {isMobile ? (
          <SelectGroup>
            <div className="label">View</div>
            <Select
              className="control"
              value={view}
              onChange={(v) => onChangeView(v as FinanceView)}
              options={options}
            />
          </SelectGroup>
        ) : (
          <SegmentedRail>
            <Segmented
              value={view}
              onChange={(v) => onChangeView(v as FinanceView)}
              options={options}
            />
          </SegmentedRail>
        )}
      </Left>

      <Right>
        {isMobile ? (
          <SelectGroup>
            <div className="label">Group by</div>
            <Select
              className="control"
              value={groupBy}
              onChange={(v) => onChangeGroupBy(v as FinanceGroupBy)}
              options={[
                { label: "Day", value: "day" },
                { label: "Week", value: "week" },
                { label: "Month", value: "month" },
              ]}
            />
          </SelectGroup>
        ) : (
          <SegmentedRail>
            <Segmented
              value={groupBy}
              onChange={(v) => onChangeGroupBy(v as FinanceGroupBy)}
              options={[
                { label: "Day", value: "day" },
                { label: "Week", value: "week" },
                { label: "Month", value: "month" },
              ]}
            />
          </SegmentedRail>
        )}

        <Button
          icon={<RefreshCcw size={16} />}
          loading={!!loading}
          onClick={onRefresh}
        >
          Refresh
        </Button>
      </Right>
    </Row>
  );
}
