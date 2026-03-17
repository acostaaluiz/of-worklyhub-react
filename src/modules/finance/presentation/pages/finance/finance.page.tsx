import React from "react";

import { i18n as appI18n } from "@core/i18n";
import { BasePage } from "@shared/base/base.page";
import { FinanceTemplate } from "../../templates/finance/finance.template";

export class FinancePage extends BasePage {
  protected override options = {
    title: `${appI18n.t("finance.pageTitles.finance")} | WorklyHub`,
    requiresAuth: true,
  };

  protected override renderPage(): React.ReactNode {
    return <FinanceTemplate />;
  }
}

export default FinancePage;
