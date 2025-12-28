import React from "react";
import { BasePage } from "@shared/base/base.page";
import { FinanceTemplate } from "../../templates/finance/finance.template";

export class FinancePage extends BasePage {
  protected override options = {
    title: "Finance | WorklyHub",
    requiresAuth: true,
  };

  protected override renderPage(): React.ReactNode {
    return <FinanceTemplate />;
  }
}

export default FinancePage;
