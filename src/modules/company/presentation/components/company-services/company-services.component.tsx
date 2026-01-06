import React from "react";
import { List, Card, Typography, Button, Drawer } from "antd";
import type { ServiceModel } from "@modules/clients/interfaces/service.model";
import { ServicesGrid } from "./company-services.component.styles";
import { ServiceSelector } from "./service-selector.component";
import { CartBar } from "./cart-bar.component";
import { BaseComponent } from "@shared/base/base.component";

type Props = {
  services?: ServiceModel[];
};

type State = {
  open: boolean;
  cart: Record<string, number>;
};

export class CompanyServices extends BaseComponent<Props, State> {
  public override state: State = { open: false, cart: {} };

  private handleAdd = (s: ServiceModel) => {
    this.setState(({ cart }) => ({ cart: { ...cart, [s.id]: (cart[s.id] ?? 0) + 1 } }));
  };

  private handleOpen = () => this.setState({ open: true });

  private handleSelectorAdd = (items: { service: ServiceModel; qty: number }[]) => {
    const next: Record<string, number> = { ...this.state.cart };
    items.forEach((it) => {
      next[it.service.id] = (next[it.service.id] ?? 0) + it.qty;
    });
    this.setState({ cart: next, open: false });
  };

  private get cartCount() {
    return Object.values(this.state.cart).reduce((a, b) => a + b, 0);
  }

  private get cartTotal() {
    const { services } = this.props;
    return Object.entries(this.state.cart).reduce((acc, [id, qty]) => {
      const svc = services.find((s) => s.id === id);
      return acc + ((svc?.priceCents ?? 0) * qty);
    }, 0);
  }

  protected override renderView(): React.ReactNode {
    const { services } = this.props;
    if (!services || services.length === 0) return null;

    return (
      <div>
        <Typography.Title level={4}>Serviços</Typography.Title>

        <ServicesGrid>
          <List
            grid={{ gutter: 12, column: 2 }}
            dataSource={services}
            renderItem={(s) => (
              <List.Item>
                <Card className="surface" bordered={false}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <Typography.Title level={5} style={{ margin: 0 }}>{s.title}</Typography.Title>
                      <Typography.Text type="secondary">{s.description}</Typography.Text>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 700 }}>{s.priceFormatted}</div>
                      <Button type="default" size="small" style={{ marginTop: 8 }} onClick={() => this.handleAdd(s)}>
                        Adicionar
                      </Button>
                    </div>
                  </div>
                </Card>
              </List.Item>
            )}
          />
        </ServicesGrid>

        <Drawer width={720} open={this.state.open} onClose={() => this.setState({ open: false })} title="Ajustar seleção">
          <ServiceSelector services={services} onCancel={() => this.setState({ open: false })} onAdd={this.handleSelectorAdd} />
        </Drawer>

        <CartBar count={this.cartCount} totalCents={this.cartTotal} onOpen={this.handleOpen} />
      </div>
    );
  }
}

export default CompanyServices;
