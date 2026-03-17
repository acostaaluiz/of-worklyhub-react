import React from "react";

import { i18n as appI18n } from "@core/i18n";
import { BasePage } from "@shared/base/base.page";
import { SuggestionsTemplate } from "@modules/finance/presentation/templates/suggestions/suggestions.template";

export class SuggestionsPage extends BasePage {
  protected override options = {
    title: `${appI18n.t("finance.pageTitles.suggestions")} | WorklyHub`,
    requiresAuth: true,
  };

  protected override renderPage(): React.ReactNode {
    return <SuggestionsTemplate />;
  }
}

export default SuggestionsPage;
