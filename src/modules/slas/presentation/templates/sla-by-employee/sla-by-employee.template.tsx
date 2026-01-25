import { Typography } from "antd";

import { BaseTemplate } from "@shared/base/base.template";
import type { SlaEmployeeOption, SlaFilters, SlaRow } from "@modules/slas/interfaces/sla-report.model";
import { SlaFilters as SlaFiltersComponent } from "@modules/slas/presentation/components/sla-filters/sla-filters.component";
import { SlaTable } from "@modules/slas/presentation/components/sla-table/sla-table.component";
import {
  FiltersCard,
  HelperText,
  PageStack,
  ResultsCard,
  TemplateTitleBlock,
  TemplateTitleRow,
} from "./sla-by-employee.template.styles";

type Props = {
  employees: SlaEmployeeOption[];
  filters: SlaFilters;
  rows: SlaRow[];
  loading?: boolean;
  onChangeFilters: (patch: Partial<SlaFilters>) => void;
  onApplyFilters: () => void;
  onResetFilters: () => void;
};

export function SlaByEmployeeTemplate({
  employees,
  filters,
  rows,
  loading,
  onChangeFilters,
  onApplyFilters,
  onResetFilters,
}: Props) {
  return (
    <BaseTemplate
      content={
        <PageStack>
          <TemplateTitleRow>
            <TemplateTitleBlock>
              <Typography.Title level={2} style={{ margin: 0 }}>
                Employee SLA
              </Typography.Title>
              <Typography.Text type="secondary">
                Review completed schedule hours grouped by employee and work date.
              </Typography.Text>
            </TemplateTitleBlock>
          </TemplateTitleRow>

          <FiltersCard className="surface">
            <SlaFiltersComponent
              employees={employees}
              filters={filters}
              loading={loading}
              onChangeFilters={onChangeFilters}
              onApply={onApplyFilters}
              onReset={onResetFilters}
            />
            <HelperText>
              SLAs are created when schedules move to completed. Use a date range to keep the report fast.
            </HelperText>
          </FiltersCard>

          <ResultsCard className="surface">
            <SlaTable rows={rows} loading={loading} />
          </ResultsCard>
        </PageStack>
      }
    />
  );
}

export default SlaByEmployeeTemplate;
