import React from "react";
import { BasePage } from "@shared/base/base.page";
import { InventoryLandingTemplate } from "@modules/inventory/presentation/templates/landing/landing.template";

export class InventoryLandingPage extends BasePage {
  protected override options = {
    title: "Inventory overview | WorklyHub",
    requiresAuth: true,
  };

  protected override renderPage(): React.ReactNode {
    return <InventoryLandingTemplate />;
  }
}

export default InventoryLandingPage;
