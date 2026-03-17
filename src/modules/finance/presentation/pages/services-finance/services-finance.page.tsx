import React from "react";

import { i18n as appI18n } from "@core/i18n";
import { BasePage } from "@shared/base/base.page";
import type { BaseProps } from "@shared/base/interfaces/base-props.interface";
import type { BasePageState } from "@shared/base/interfaces/base-page.state.interface";
import { ServicesFinanceTemplate } from "@modules/finance/presentation/templates/services-finance/services-finance.template";
import type { CompanyServiceModel } from "@modules/company/interfaces/service.model";

type ServicesFinancePageState = BasePageState & {
  selectedService?: CompanyServiceModel & { suggestedCents?: number };
};

export class ServicesFinancePage extends BasePage<BaseProps, ServicesFinancePageState> {
  protected override options = {
    title: `${appI18n.t("finance.pageTitles.services")} | WorklyHub`,
    requiresAuth: true,
  };

  public override state: ServicesFinancePageState = {
    isLoading: false,
    initialized: false,
    error: undefined,
    selectedService: undefined,
  };

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
