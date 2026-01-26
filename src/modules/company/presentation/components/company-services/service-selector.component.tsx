import React from "react";
import { List, Checkbox, Space, InputNumber, Button, Typography, Divider } from "antd";
import { formatMoneyFromCents } from "@core/utils/mask";
import { BaseComponent } from "@shared/base/base.component";
import type { ServiceModel } from "@modules/clients/interfaces/service.model";
import { SelectorFooter, SelectorShell } from "./service-selector.component.styles";

type Props = {
  services: ServiceModel[];
  onCancel?: () => void;
  onAdd?: (items: { service: ServiceModel; qty: number }[]) => void;
};

type State = {
  selected: Record<string, number>;
};

export class ServiceSelector extends BaseComponent<Props, State> {
  protected override state: State = { selected: {} };

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
    return services.filter((svc) => this.state.selected[svc.id]).map((svc) => ({ service: svc, qty: this.state.selected[svc.id] }));
  }

  private get total() {
    return this.selectedItems.reduce((acc, cur) => acc + (cur.service.priceCents ?? 0) * cur.qty, 0);
  }

  protected override renderView(): React.ReactNode {
    const { services, onCancel, onAdd } = this.props;

    return (
      <SelectorShell>
        <List
          dataSource={services}
          renderItem={(s) => (
            <List.Item>
              <Space style={{ width: "100%" }} align="center" direction="horizontal" wrap>
                <Checkbox checked={!!this.state.selected[s.id]} onChange={() => this.toggle(s.id)} />

                <div style={{ flex: 1 }}>
                  <Typography.Text strong>{s.title}</Typography.Text>
                  <div>
                    <Typography.Text type="secondary">{s.description}</Typography.Text>
                  </div>
                </div>

                <div style={{ width: 120, textAlign: "right" }}>
                  <div style={{ fontWeight: 700 }}>
                    {typeof s.priceCents === "number" ? formatMoneyFromCents(s.priceCents) : s.priceFormatted}
                  </div>
                  <div style={{ marginTop: 6 }}>
                    <InputNumber
                      min={1}
                      value={this.state.selected[s.id] ?? 1}
                      onChange={(v) => this.setQty(s.id, Number(v || 1))}
                      disabled={!this.state.selected[s.id]}
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
            <Typography.Text type="secondary">Total</Typography.Text>
            <div style={{ fontWeight: 800 }}>{formatMoneyFromCents(this.total)}</div>
          </div>

          <Space>
            <Button onClick={onCancel}>Cancelar</Button>
            <Button type="primary" disabled={this.selectedItems.length === 0} onClick={() => onAdd?.(this.selectedItems)}>
              Adicionar ({this.selectedItems.length})
            </Button>
          </Space>
        </SelectorFooter>
      </SelectorShell>
    );
  }
}

export default ServiceSelector;
