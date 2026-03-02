import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";

import { BaseTemplate } from "@shared/base/base.template";
import { ServicesFinanceList } from "@modules/finance/presentation/components/services-finance-list/services-finance-list.component";
import { FinanceEntryForm } from "@modules/finance/presentation/components/finance-entry-form/finance-entry-form.component";
import { FinanceKpis } from "@modules/finance/presentation/components/finance-kpis/finance-kpis.component";
import type { CompanyServiceModel } from "@modules/company/interfaces/service.model";
import type {
  FinanceEntryListItem,
  FinanceEntryModel,
} from "@modules/finance/interfaces/finance-entry.model";
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
  selectedService?: CompanyServiceModel & { suggestedCents?: number };
  onSelectService?: (svc: CompanyServiceModel, suggestedCents: number) => void;
  onSaved?: (entry: FinanceEntryModel | FinanceEntryListItem) => void;
};

export function ServicesFinanceTemplate({
  selectedService,
  onSelectService,
  onSaved,
}: Props): ReactNode {
  return (
    <BaseTemplate
      content={
        <TemplateShell>
          <HeaderRow>
            <HeaderMain>
              <HeaderIcon>
                <Sparkles size={20} />
              </HeaderIcon>
              <HeaderCopy>
                <HeaderTitle>Services and suggestions</HeaderTitle>
                <HeaderSubtitle>
                  Service pricing suggestions based on your recent finance history.
                </HeaderSubtitle>
              </HeaderCopy>
            </HeaderMain>
          </HeaderRow>

          <ContentGrid>
            <MainPanel>
              <FinanceKpis />
              <ServicesFinanceList onSelect={onSelectService} />
            </MainPanel>

            <SidePanel>
              <SidePanelInner>
                <h3 style={{ marginTop: 0 }}>Add entry</h3>
                <FinanceEntryForm
                  initial={
                    selectedService
                      ? {
                          serviceId: selectedService.id,
                          amountCents: selectedService.suggestedCents ?? 0,
                        }
                      : undefined
                  }
                  onSaved={onSaved}
                />
              </SidePanelInner>
            </SidePanel>
          </ContentGrid>
        </TemplateShell>
      }
    />
  );
}

export default ServicesFinanceTemplate;
