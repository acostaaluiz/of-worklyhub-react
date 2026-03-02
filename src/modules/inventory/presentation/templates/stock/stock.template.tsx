import React from "react";
import { PackageSearch } from "lucide-react";
import InventoryFilterComponent, { type InventoryFilterState } from "@modules/inventory/presentation/components/inventory-filter/inventory-filter.component";
import type { CategoryModel } from "@modules/inventory/interfaces/category.model";
import {
  StockTemplateShell,
  ContentWrap,
  FilterWrap,
  HeaderCopy,
  HeaderIcon,
  HeaderMain,
  HeaderRow,
  HeaderSubtitle,
  HeaderTitle,
  TemplateShell,
} from "./stock.template.styles";

type Props = {
  title?: string;
  children?: React.ReactNode;
  showFilter?: boolean;
  filterValue?: InventoryFilterState;
  onFilterChange?: (s: InventoryFilterState) => void;
  categories?: CategoryModel[];
};

export function StockTemplate(props: Props) {
  const { title = "Stock", children, showFilter = false, filterValue, onFilterChange, categories } = props;

  return (
    <StockTemplateShell
      content={
        <TemplateShell>
          <HeaderRow>
            <HeaderMain>
              <HeaderIcon>
                <PackageSearch size={20} />
              </HeaderIcon>
              <HeaderCopy>
                <HeaderTitle>{title}</HeaderTitle>
                <HeaderSubtitle>
                  Monitor stock levels and keep inventory operations under control.
                </HeaderSubtitle>
              </HeaderCopy>
            </HeaderMain>
          </HeaderRow>

          {showFilter ? (
            <FilterWrap>
              <InventoryFilterComponent
                categories={categories}
                value={filterValue}
                onChange={onFilterChange}
              />
            </FilterWrap>
          ) : null}

          <ContentWrap>{children}</ContentWrap>
        </TemplateShell>
          }
    />
  );
}

export default StockTemplate;
