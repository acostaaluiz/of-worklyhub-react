import React from "react";
import { BasePage } from "@shared/base/base.page";
import { ServicesFinanceTemplate } from "@modules/finance/presentation/templates/services-finance/services-finance.template";
import { FinanceService } from "@modules/finance/services/finance.service";
import type { CompanyServiceModel } from "@modules/company/interfaces/service.model";

export class ServicesFinancePage extends BasePage {
  protected override options = {
    title: "Finance - Services | WorklyHub",
    requiresAuth: true,
  };

  state: { selectedService?: CompanyServiceModel & { suggestedCents?: number } } = {};

  private svc = new FinanceService();

  protected override renderPage(): React.ReactNode {
    return (
      <ServicesFinanceTemplate
        selectedService={this.state.selectedService}
        onSelectService={(s, suggested) => this.setState({ selectedService: { ...s, suggestedCents: suggested } })}
        onSaved={() => this.refreshEntries()}
      />
    );
  }

  async refreshEntries() {
    // placeholder if we want to refresh list or stats later
    await Promise.resolve();
  }
}

export default ServicesFinancePage;
