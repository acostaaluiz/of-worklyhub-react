import React from "react";
import { i18n as appI18n } from "@core/i18n";
import { BasePage } from "@shared/base/base.page";
import { InventoryLandingTemplate } from "@modules/inventory/presentation/templates/landing/landing.template";

export class InventoryLandingPage extends BasePage {
  protected override options = {
    title: `${appI18n.t("inventory.pageTitles.landing")} | WorklyHub`,
    requiresAuth: true,
  };

  protected override renderPage(): React.ReactNode {
    return <InventoryLandingTemplate />;
  }
}

export default InventoryLandingPage;
