import React from "react";
import { LayoutGrid } from "lucide-react";
import { BaseComponent } from "@shared/base/base.component";
import {
  ModuleLanding,
  type ModuleLandingItem,
} from "@shared/ui/components/module-landing/module-landing.component";
import {
  EmptyState,
  EmptyTitle,
  EmptyText,
} from "./all-modules.component.styles";

type Props = {
  items: ModuleLandingItem[];
  title?: string;
  description?: string;
};

type State = {
  isLoading: boolean;
  error?: unknown;
};

export class AllModulesComponent extends BaseComponent<Props, State> {
  public state: State = { isLoading: false, error: undefined };

  protected override renderView(): React.ReactNode {
    const { items, title, description } = this.props;

    if (!items || items.length === 0) {
      return (
        <EmptyState className="surface">
          <EmptyTitle>No modules available</EmptyTitle>
          <EmptyText>
            There are no services available to show yet.
          </EmptyText>
        </EmptyState>
      );
    }

    return (
      <ModuleLanding
        title={title ?? "All modules"}
        headerIcon={<LayoutGrid size={18} />}
        description={
          description ?? "Access every service available in WorklyHub."
        }
        columns={2}
        items={items}
      />
    );
  }
}

export default AllModulesComponent;
