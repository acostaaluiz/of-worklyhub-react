import React from "react";
import { AutoComplete, Input, Spin } from "antd";
import type { BaseProps } from "@shared/base/interfaces/base-props.interface";
import type { BaseState } from "@shared/base/interfaces/base-state.interface";
import { BaseComponent } from "@shared/base/base.component";
import { OptionRow, OptionIcon, OptionSubtitle, OptionTexts, OptionTitle, EmptyState } from "./autocomplete.component.styles";

export type AutocompleteItem = {
  key: string;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  value?: string;
  meta?: DataValue;
};

type Props = BaseProps & {
  placeholder?: string;
  maxItems?: number;
  fetchItems: (query: string) => Promise<AutocompleteItem[]>;
  onSelect?: (item: AutocompleteItem) => void;
  prefix?: React.ReactNode;
  allowClear?: boolean;
  minLength?: number;
};

type State = BaseState & {
  query: string;
  items: AutocompleteItem[];
  open: boolean;
};

export class AutocompleteInput extends BaseComponent<Props, State> {
  public state: State = {
    isLoading: false,
    error: undefined,
    query: "",
    items: [],
    open: false,
  };

  private debounceTimer?: number | ReturnType<typeof setTimeout>;
  private requestId = 0;

  private maxVisible(): number {
    return this.props.maxItems && this.props.maxItems > 0 ? this.props.maxItems : 4;
  }

  private handleFocus = (): void => {
    if (!this.state.items.length) {
      void this.runSearch(this.state.query);
    }
    this.setSafeState({ open: true });
  };

  private handleBlur = (): void => {
    this.setSafeState({ open: false });
  };

  private handleSearch = (value: string): void => {
    this.setSafeState({ query: value, open: true });

    const minLength = this.props.minLength ?? 0;
    if ((value ?? "").length < minLength) {
      this.setSafeState({ items: [], open: false });
      return;
    }

    if (this.debounceTimer) window.clearTimeout(this.debounceTimer);
    this.debounceTimer = window.setTimeout(() => void this.runSearch(value), 180);
  };

  private async runSearch(value: string): Promise<void> {
    const currentRequest = ++this.requestId;
    this.setLoading(true);
    try {
      const results = await this.props.fetchItems(value ?? "");
      if (currentRequest !== this.requestId) return;
      const maxItems = this.maxVisible();
      const nextItems = Array.isArray(results) ? results.slice(0, maxItems) : [];
      this.setSafeState({ items: nextItems, error: undefined });
    } catch (err) {
      console.debug("autocomplete search failed", err);
      this.clearError();
    } finally {
      this.setLoading(false);
    }
  }

  private handleSelect = (_value: string, option: { item?: AutocompleteItem } | undefined): void => {
    const selected = option?.item ?? this.state.items.find((i) => i.key === _value || i.value === _value);
    if (selected) this.props.onSelect?.(selected);
    this.setSafeState({ open: false });
  };

  override componentWillUnmount(): void {
    super.componentWillUnmount();
    if (this.debounceTimer) window.clearTimeout(this.debounceTimer);
  }

  protected override renderView(): React.ReactNode {
    const minLen = this.props.minLength ?? 0;
    const options = this.state.items.map((item) => ({
      value: item.value ?? item.key,
      label: (
        <OptionRow>
          <OptionIcon>{item.icon}</OptionIcon>
          <OptionTexts>
            <OptionTitle title={item.title}>{item.title}</OptionTitle>
            {item.subtitle ? <OptionSubtitle title={item.subtitle}>{item.subtitle}</OptionSubtitle> : null}
          </OptionTexts>
        </OptionRow>
      ),
      item,
    }));

    const shouldOpen =
      this.state.open &&
      (options.length > 0 || this.state.isLoading || (this.state.query?.length ?? 0) >= minLen);

    return (
      <AutoComplete
        value={this.state.query}
        options={options}
        style={{ width: "100%" }}
        data-testid={this.props.testId}
        onSearch={this.handleSearch}
        onSelect={this.handleSelect}
        onFocus={this.handleFocus}
        onBlur={this.handleBlur}
        open={shouldOpen}
        listHeight={this.maxVisible() * 64}
        popupMatchSelectWidth
        allowClear={this.props.allowClear ?? true}
        popupClassName="autocomplete-dropdown"
        notFoundContent={
          this.state.isLoading ? <Spin size="small" /> : <EmptyState>No matches</EmptyState>
        }
      >
        <Input
          placeholder={this.props.placeholder}
          allowClear={this.props.allowClear ?? true}
          prefix={this.props.prefix}
        />
      </AutoComplete>
    );
  }
}

export default AutocompleteInput;
