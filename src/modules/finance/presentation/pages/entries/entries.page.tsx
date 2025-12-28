import React from "react";
import { BasePage } from "@shared/base/base.page";
import { EntriesTemplate } from "@modules/finance/presentation/templates/entries/entries.template";

export class EntriesPage extends BasePage {
  protected override options = {
    title: "Finance - Entries | WorklyHub",
    requiresAuth: true,
  };

  protected override renderPage(): React.ReactNode {
    return <EntriesTemplate />;
  }
}

export default EntriesPage;
