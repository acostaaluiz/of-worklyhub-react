import React from "react";
import { Button, Checkbox, Divider, InputNumber, List, Space, Typography } from "antd";

import { i18n as appI18n } from "@core/i18n";
import { formatMoneyFromCents } from "@core/utils/mask";
import type { ServiceModel } from "@modules/clients/interfaces/service.model";
import { BaseComponent } from "@shared/base/base.component";
import type { BaseProps } from "@shared/base/interfaces/base-props.interface";

import { SelectorFooter, SelectorShell } from "./service-selector.component.styles";

type Props = BaseProps & {
  services: ServiceModel[];
  onCancel?: () => void;
  onAdd?: (items: { service: ServiceModel; qty: number }[]) => void;
};

type State = {
  isLoading: boolean;
  selected: Record<string, number>;
};

export class ServiceSelector extends BaseComponent<Props, State> {
  public override state: State = { isLoading: false, selected: {} };

  private toggle = (id: string) => {
    this.setState(({ selected }) => {
      const next = { ...selected };
      if (next[id]) delete next[id];
      else next[id] = 1;
      return { selected: next };
    });
  };

  private setQty = (id: string, qty: number) => {
    this.setState(({ selected }) => ({ selected: { ...selected, [id]: qty } }));
  };

  private get selectedItems() {
    const { services } = this.props;
    return services
      .filter((service) => this.state.selected[service.id])
      .map((service) => ({ service, qty: this.state.selected[service.id] }));
  }

  private get total() {
    return this.selectedItems.reduce(
      (acc, current) => acc + (current.service.priceCents ?? 0) * current.qty,
      0
    );
  }

  protected override renderView(): React.ReactNode {
    const { services, onCancel, onAdd } = this.props;

    return (
      <SelectorShell>
        <List
          dataSource={services}
          renderItem={(service) => (
            <List.Item>
              <Space style={{ width: "100%" }} align="center" direction="horizontal" wrap>
                <Checkbox
                  checked={!!this.state.selected[service.id]}
                  onChange={() => this.toggle(service.id)}
                />

                <div style={{ flex: 1 }}>
                  <Typography.Text strong>{service.title}</Typography.Text>
                  <div>
                    <Typography.Text type="secondary">{service.description}</Typography.Text>
                  </div>
                </div>

                <div style={{ width: 120, textAlign: "right" }}>
                  <div style={{ fontWeight: 700 }}>
                    {typeof service.priceCents === "number"
                      ? formatMoneyFromCents(service.priceCents)
                      : service.priceFormatted}
                  </div>
                  <div style={{ marginTop: 6 }}>
                    <InputNumber
                      min={1}
                      value={this.state.selected[service.id] ?? 1}
                      onChange={(value) => this.setQty(service.id, Number(value || 1))}
                      disabled={!this.state.selected[service.id]}
                    />
                  </div>
                </div>
              </Space>
            </List.Item>
          )}
        />

        <Divider />

        <SelectorFooter>
          <div>
            <Typography.Text type="secondary">{appI18n.t("company.profile.serviceSelector.total")}</Typography.Text>
            <div style={{ fontWeight: 800 }}>{formatMoneyFromCents(this.total)}</div>
          </div>

          <Space>
            <Button onClick={onCancel}>{appI18n.t("company.profile.serviceSelector.cancel")}</Button>
            <Button
              type="primary"
              disabled={this.selectedItems.length === 0}
              onClick={() => onAdd?.(this.selectedItems)}
            >
              {appI18n.t("company.profile.serviceSelector.add", {
                count: this.selectedItems.length,
              })}
            </Button>
          </Space>
        </SelectorFooter>
      </SelectorShell>
    );
  }
}

export default ServiceSelector;
