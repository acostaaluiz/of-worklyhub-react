import { Typography } from "antd";
import { Gauge } from "lucide-react";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

  return (
    <BaseTemplate
      content={
        <PageStack data-cy="sla-page">
          <TemplateTitleRow data-cy="sla-page-header">
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
                  <Typography.Title level={2} style={{ margin: 0 }} data-cy="sla-page-title">
                    {t("sla.header.title")}
                  </Typography.Title>
                  <Typography.Text type="secondary">
                    {t("sla.header.subtitle")}
                  </Typography.Text>
                </div>
              </div>
            </TemplateTitleBlock>
          </TemplateTitleRow>

          <FiltersCard data-cy="sla-filters-card">
            <SlaFiltersComponent
              employees={employees}
              filters={filters}
              loading={loading}
              onChangeFilters={onChangeFilters}
              onApply={onApplyFilters}
              onReset={onResetFilters}
            />
            <HelperText>
              {t("sla.header.helper")}
            </HelperText>
          </FiltersCard>

          <ResultsCard data-cy="sla-results-card">
            <SlaTable rows={rows} loading={loading} />
          </ResultsCard>
        </PageStack>
      }
    />
  );
}

export default SlaByEmployeeTemplate;
