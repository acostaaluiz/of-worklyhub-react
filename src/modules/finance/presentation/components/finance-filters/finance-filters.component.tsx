import { Button, DatePicker, Grid, Segmented, Select } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { RefreshCcw } from "lucide-react";
import { getDateFormat } from "@core/utils/mask";
import { i18n as appI18n } from "@core/i18n";

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
    { label: appI18n.t("legacyInline.finance.presentation_components_finance_filters_finance_filters_component.k001"), value: "overview" },
    { label: appI18n.t("legacyInline.finance.presentation_components_finance_filters_finance_filters_component.k002"), value: "insights" },
    { label: appI18n.t("legacyInline.finance.presentation_components_finance_filters_finance_filters_component.k003"), value: "revenue" },
    { label: appI18n.t("legacyInline.finance.presentation_components_finance_filters_finance_filters_component.k004"), value: "top-services" },
    { label: appI18n.t("legacyInline.finance.presentation_components_finance_filters_finance_filters_component.k005"), value: "expenses" },
    { label: appI18n.t("legacyInline.finance.presentation_components_finance_filters_finance_filters_component.k006"), value: "profit" },
    { label: appI18n.t("legacyInline.finance.presentation_components_finance_filters_finance_filters_component.k007"), value: "cashflow" },
  ];

  const options = availableViews?.length
    ? viewOptions.filter((opt) => availableViews.includes(opt.value))
    : viewOptions;
  const periodValue: [Dayjs, Dayjs] = [dayjs(from), dayjs(to)];

  return (
    <Row>
      <Left>
        <PeriodGroup>
          <div className="label">{appI18n.t("legacyInline.finance.presentation_components_finance_filters_finance_filters_component.k008")}</div>

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
            <div className="label">{appI18n.t("legacyInline.finance.presentation_components_finance_filters_finance_filters_component.k009")}</div>
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
            <div className="label">{appI18n.t("legacyInline.finance.presentation_components_finance_filters_finance_filters_component.k010")}</div>
            <Select
              className="control"
              value={groupBy}
              onChange={(v) => onChangeGroupBy(v as FinanceGroupBy)}
              options={[
                { label: appI18n.t("legacyInline.finance.presentation_components_finance_filters_finance_filters_component.k011"), value: "day" },
                { label: appI18n.t("legacyInline.finance.presentation_components_finance_filters_finance_filters_component.k012"), value: "week" },
                { label: appI18n.t("legacyInline.finance.presentation_components_finance_filters_finance_filters_component.k013"), value: "month" },
              ]}
            />
          </SelectGroup>
        ) : (
          <SegmentedRail>
            <Segmented
              value={groupBy}
              onChange={(v) => onChangeGroupBy(v as FinanceGroupBy)}
              options={[
                { label: appI18n.t("legacyInline.finance.presentation_components_finance_filters_finance_filters_component.k014"), value: "day" },
                { label: appI18n.t("legacyInline.finance.presentation_components_finance_filters_finance_filters_component.k015"), value: "week" },
                { label: appI18n.t("legacyInline.finance.presentation_components_finance_filters_finance_filters_component.k016"), value: "month" },
              ]}
            />
          </SegmentedRail>
        )}

        <Button
          icon={<RefreshCcw size={16} />}
          loading={!!loading}
          onClick={onRefresh}
        >
          {appI18n.t("legacyInline.finance.presentation_components_finance_filters_finance_filters_component.k017")}
        </Button>
      </Right>
    </Row>
  );
}
