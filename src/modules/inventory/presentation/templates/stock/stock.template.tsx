import React from "react";
import { BaseTemplate } from "@shared/base/base.template";
import { PrivateFrameLayout } from "@shared/ui/layout/private-frame/private-frame.component";
import InventoryFilterComponent, { type InventoryFilterState } from "@modules/inventory/presentation/components/inventory-filter/inventory-filter.component";

type Props = {
  title?: string;
  children?: React.ReactNode;
  showFilter?: boolean;
  filterValue?: InventoryFilterState;
  onFilterChange?: (s: InventoryFilterState) => void;
  categories?: any[];
};

export function StockTemplate(props: Props) {
  const { title = "Estoque", children, showFilter = false, filterValue, onFilterChange, categories } = props;

  return (
    <BaseTemplate
      content={
        <PrivateFrameLayout>
          <div style={{ padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ margin: 0 }}>{title}</h2>
            </div>

            {showFilter ? (
              <div style={{ marginTop: 12, marginBottom: 12 }}>
                <InventoryFilterComponent categories={categories} value={filterValue} onChange={onFilterChange} />
              </div>
            ) : null}

            <div style={{ marginTop: 8 }}>{children}</div>
          </div>
        </PrivateFrameLayout>
      }
    />
  );
}

export default StockTemplate;
