import React from "react";
import { BaseTemplate } from "@shared/base/base.template";
import { PrivateFrameLayout } from "@shared/ui/layout/private-frame/private-frame.component";
import { ServicesFinanceList } from "@modules/finance/presentation/components/services-finance-list/services-finance-list.component";
import { FinanceEntryForm } from "@modules/finance/presentation/components/finance-entry-form/finance-entry-form.component";
import { Grid, LeftPanel, RightPanel } from "@modules/users/presentation/templates/login/login.template.styles";
import { FinanceKpis } from "@modules/finance/presentation/components/finance-kpis/finance-kpis.component";

type Props = {
  selectedService?: any;
  onSelectService?: (svc: any, suggestedCents: number) => void;
  onSaved?: (entry: any) => void;
};

export function ServicesFinanceTemplate({ selectedService, onSelectService, onSaved }: Props) {
  return (
    <BaseTemplate
      content={
        <PrivateFrameLayout>
          <Grid>
            <LeftPanel>
              <h2>Serviços e sugestões</h2>
              <p>Lista de serviços da sua empresa com sugestões de preço baseadas em histórico.</p>
              <FinanceKpis />
              <ServicesFinanceList onSelect={onSelectService} />
            </LeftPanel>

            <RightPanel>
              <div style={{ width: "100%", maxWidth: 380 }}>
                <h3>Adicionar lançamento</h3>
                       <FinanceEntryForm initial={selectedService ? { serviceId: selectedService.id, amount: (selectedService.suggestedCents ?? 0) / 100 } : undefined} onSaved={onSaved} />
              </div>
            </RightPanel>
          </Grid>
        </PrivateFrameLayout>
      }
    />
  );
}

export default ServicesFinanceTemplate;
