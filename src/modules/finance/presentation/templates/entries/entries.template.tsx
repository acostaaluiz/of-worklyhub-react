import React from "react";
import { BaseTemplate } from "@shared/base/base.template";
import { FinanceEntryForm } from "@modules/finance/presentation/components/finance-entry-form/finance-entry-form.component";
import { FinanceEntriesList } from "@modules/finance/presentation/components/finance-entries-list/finance-entries-list.component";
import { Grid, LeftPanel, RightPanel } from "@modules/users/presentation/templates/login/login.template.styles";
import { FinanceKpis } from "@modules/finance/presentation/components/finance-kpis/finance-kpis.component";

type Props = {
  workspaceId?: string;
};

export function EntriesTemplate({ workspaceId }: Props) {
  return (
    <BaseTemplate
      content={
        <>
          <Grid>
            <LeftPanel>
              <h2>Entries</h2>
              <p>Incomes, expenses and fixed costs.</p>
              <FinanceKpis workspaceId={workspaceId} />
              <FinanceEntriesList workspaceId={workspaceId} />
            </LeftPanel>

            <RightPanel>
              <div style={{ width: "100%", maxWidth: 380 }}>
                <h3>Add new entry</h3>
                <FinanceEntryForm workspaceId={workspaceId} />
              </div>
            </RightPanel>
          </Grid>
        </>
      }
    />
  );
}

export default EntriesTemplate;
