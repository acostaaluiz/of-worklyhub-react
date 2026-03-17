import { ReceiptText } from "lucide-react";

import { i18n as appI18n } from "@core/i18n";
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
          <HeaderRow data-cy="finance-entries-header">
            <HeaderMain>
              <HeaderIcon>
                <ReceiptText size={20} />
              </HeaderIcon>
              <HeaderCopy>
                <HeaderTitle data-cy="finance-entries-title">{appI18n.t("legacyInline.finance.presentation_templates_entries_entries_template.k001")}</HeaderTitle>
                <HeaderSubtitle>
                  {appI18n.t("legacyInline.finance.presentation_templates_entries_entries_template.k002")}
                </HeaderSubtitle>
              </HeaderCopy>
            </HeaderMain>
          </HeaderRow>

          <ContentGrid data-cy="finance-entries-content">
            <MainPanel data-cy="finance-entries-main-panel">
              <FinanceKpis workspaceId={workspaceId} />
              <FinanceEntriesList workspaceId={workspaceId} />
            </MainPanel>

            <SidePanel data-cy="finance-entries-side-panel">
              <SidePanelInner data-cy="finance-entries-form-panel">
                <h3 style={{ marginTop: 0 }}>{appI18n.t("legacyInline.finance.presentation_templates_entries_entries_template.k003")}</h3>
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
