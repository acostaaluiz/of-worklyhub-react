import type { ReactNode } from "react";
import { i18n as appI18n } from "@core/i18n";
import CategoryManagerComponent from "@modules/inventory/presentation/components/category-manager/category-manager.component";
import StockTemplate from "@modules/inventory/presentation/templates/stock/stock.template";
import { BasePage } from "@shared/base/base.page";

function InventoryCategoriesPageContent() {
  return (
    <StockTemplate>
      <div data-cy="inventory-categories-page">
        <CategoryManagerComponent />
      </div>
    </StockTemplate>
  );
}

export class InventoryCategoriesPage extends BasePage {
  protected override options = {
    title: `${appI18n.t("inventory.pageTitles.categories")} | WorklyHub`,
    requiresAuth: true,
  };

  protected override renderPage(): ReactNode {
    return <InventoryCategoriesPageContent />;
  }
}

export default InventoryCategoriesPage;
