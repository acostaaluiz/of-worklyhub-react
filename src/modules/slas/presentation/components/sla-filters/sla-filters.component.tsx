import { Button, DatePicker, Select } from "antd";
import type { RangePickerProps } from "antd/es/date-picker";
import dayjs from "dayjs";

import { BaseComponent } from "@shared/base/base.component";
import type { BaseProps } from "@shared/base/interfaces/base-props.interface";
import type { BaseState } from "@shared/base/interfaces/base-state.interface";

import type { SlaEmployeeOption, SlaFilters as SlaFiltersModel } from "@modules/slas/interfaces/sla-report.model";
import { Actions, FilterField, FiltersGroup, FiltersRow } from "./sla-filters.component.styles";

type Props = BaseProps & {
  employees: SlaEmployeeOption[];
  filters: SlaFiltersModel;
  loading?: boolean;
  onChangeFilters: (patch: Partial<SlaFiltersModel>) => void;
  onApply: () => void;
  onReset: () => void;
};

type State = BaseState;

export class SlaFilters extends BaseComponent<Props, State> {
  public state: State = { isLoading: false, error: undefined };

  protected renderView(): React.ReactNode {
    const { filters, employees, loading } = this.props;
    const rangeValue: RangePickerProps["value"] =
      filters.from && filters.to ? [dayjs(filters.from), dayjs(filters.to)] : null;

    const isApplyDisabled = !filters.from || !filters.to;

    return (
      <FiltersRow>
        <FiltersGroup>
          <FilterField>
            <div className="label">Employee</div>
            <Select<string>
              allowClear
              placeholder="All employees"
              value={filters.userUid ?? undefined}
              options={employees}
              onChange={this.handleEmployeeChange}
              style={{ minWidth: 240 }}
            />
          </FilterField>

          <FilterField>
            <div className="label">Date range</div>
            <DatePicker.RangePicker
              value={rangeValue}
              onChange={this.handleRangeChange}
              allowClear={false}
            />
          </FilterField>
        </FiltersGroup>

        <Actions>
          <Button onClick={this.props.onReset} disabled={!!loading}>
            Reset
          </Button>
          <Button
            type="primary"
            onClick={this.props.onApply}
            loading={!!loading}
            disabled={isApplyDisabled}
          >
            Apply filters
          </Button>
        </Actions>
      </FiltersRow>
    );
  }

  private handleEmployeeChange = (value: string | undefined) => {
    this.props.onChangeFilters({ userUid: value || undefined });
  };

  private handleRangeChange: RangePickerProps["onChange"] = (values) => {
    const from = values?.[0]?.format("YYYY-MM-DD");
    const to = values?.[1]?.format("YYYY-MM-DD");

    this.props.onChangeFilters({
      from: from ?? this.props.filters.from,
      to: to ?? this.props.filters.to,
    });
  };
}

export default SlaFilters;
