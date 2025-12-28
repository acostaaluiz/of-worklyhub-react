import React from "react";
import CategoryManagerComponent from "@modules/inventory/presentation/components/category-manager/category-manager.component";
import StockTemplate from "@modules/inventory/presentation/templates/stock/stock.template";
import { BasePage } from "@shared/base/base.page";

function InventoryCategoriesPageContent(): JSX.Element {
  return (
    <StockTemplate>
      <CategoryManagerComponent />
    </StockTemplate>
  );
}

export class InventoryCategoriesPage extends BasePage {
  protected override options = {
    title: "Inventory - Categories | WorklyHub",
    requiresAuth: true,
  };

  protected override renderPage(): React.ReactNode {
    return <InventoryCategoriesPageContent />;
  }
}

export default InventoryCategoriesPage;
