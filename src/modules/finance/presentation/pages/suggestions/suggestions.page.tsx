import React from "react";
import { BasePage } from "@shared/base/base.page";
import { SuggestionsTemplate } from "@modules/finance/presentation/templates/suggestions/suggestions.template";

export class SuggestionsPage extends BasePage {
  protected override options = {
    title: "Finance - Suggestions | WorklyHub",
    requiresAuth: true,
  };

  protected override renderPage(): React.ReactNode {
    return <SuggestionsTemplate />;
  }
}

export default SuggestionsPage;
