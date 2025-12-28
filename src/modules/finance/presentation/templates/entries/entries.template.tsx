import React from "react";
import { BaseTemplate } from "@shared/base/base.template";
import { PrivateFrameLayout } from "@shared/ui/layout/private-frame/private-frame.component";
import { FinanceEntryForm } from "@modules/finance/presentation/components/finance-entry-form/finance-entry-form.component";
import { FinanceEntriesList } from "@modules/finance/presentation/components/finance-entries-list/finance-entries-list.component";
import { Grid, LeftPanel, RightPanel } from "@modules/users/presentation/templates/login/login.template.styles";
import { FinanceKpis } from "@modules/finance/presentation/components/finance-kpis/finance-kpis.component";

export function EntriesTemplate() {
  return (
    <BaseTemplate
      content={
        <PrivateFrameLayout>
          <Grid>
            <LeftPanel>
              <h2>Lançamentos</h2>
              <p>Entradas, saídas e despesas fixas.</p>
              <FinanceKpis />
              <FinanceEntriesList />
            </LeftPanel>

            <RightPanel>
              <div style={{ width: "100%", maxWidth: 380 }}>
                <h3>Adicionar novo lançamento</h3>
                <FinanceEntryForm />
              </div>
            </RightPanel>
          </Grid>
        </PrivateFrameLayout>
      }
    />
  );
}

export default EntriesTemplate;
