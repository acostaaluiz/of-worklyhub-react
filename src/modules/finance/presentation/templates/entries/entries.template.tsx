import { ReceiptText } from "lucide-react";
import { BaseTemplate } from "@shared/base/base.template";
import { FinanceEntryForm } from "@modules/finance/presentation/components/finance-entry-form/finance-entry-form.component";
import { FinanceEntriesList } from "@modules/finance/presentation/components/finance-entries-list/finance-entries-list.component";
import { FinanceKpis } from "@modules/finance/presentation/components/finance-kpis/finance-kpis.component";
import {
  ContentGrid,
  HeaderCopy,
  HeaderIcon,
  HeaderMain,
  HeaderRow,
  HeaderSubtitle,
  HeaderTitle,
  MainPanel,
  SidePanel,
  SidePanelInner,
  TemplateShell,
} from "../shared/finance-operations.template.styles";

type Props = {
  workspaceId?: string;
};

export function EntriesTemplate({ workspaceId }: Props) {
  return (
    <BaseTemplate
      content={
        <TemplateShell>
          <HeaderRow>
            <HeaderMain>
              <HeaderIcon>
                <ReceiptText size={20} />
              </HeaderIcon>
              <HeaderCopy>
                <HeaderTitle>Entries</HeaderTitle>
                <HeaderSubtitle>
                  Incomes, expenses, and fixed costs from your daily operation.
                </HeaderSubtitle>
              </HeaderCopy>
            </HeaderMain>
          </HeaderRow>

          <ContentGrid>
            <MainPanel>
              <FinanceKpis workspaceId={workspaceId} />
              <FinanceEntriesList workspaceId={workspaceId} />
            </MainPanel>

            <SidePanel>
              <SidePanelInner>
                <h3 style={{ marginTop: 0 }}>Add new entry</h3>
                <FinanceEntryForm workspaceId={workspaceId} />
              </SidePanelInner>
            </SidePanel>
          </ContentGrid>
        </TemplateShell>
      }
    />
  );
}

export default EntriesTemplate;
