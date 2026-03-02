import { Typography } from "antd";
import { Gauge } from "lucide-react";

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
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid color-mix(in srgb, var(--color-primary) 24%, var(--color-border))",
                    background: "color-mix(in srgb, var(--color-surface-2) 78%, transparent)",
                    boxShadow: "var(--shadow-sm)",
                    flexShrink: 0,
                  }}
                >
                  <Gauge size={22} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Typography.Title level={2} style={{ margin: 0 }}>
                    Employee SLA
                  </Typography.Title>
                  <Typography.Text type="secondary">
                    Review completed schedule hours grouped by employee and work date.
                  </Typography.Text>
                </div>
              </div>
            </TemplateTitleBlock>
          </TemplateTitleRow>

          <FiltersCard>
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

          <ResultsCard>
            <SlaTable rows={rows} loading={loading} />
          </ResultsCard>
        </PageStack>
      }
    />
  );
}

export default SlaByEmployeeTemplate;
