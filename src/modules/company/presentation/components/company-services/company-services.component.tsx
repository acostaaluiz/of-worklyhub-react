import React from "react";
import { Button, Card, Drawer, List, Typography } from "antd";

import { i18n as appI18n } from "@core/i18n";
import { formatMoneyFromCents } from "@core/utils/mask";
import type { ServiceModel } from "@modules/clients/interfaces/service.model";
import { BaseComponent } from "@shared/base/base.component";
import type { BaseProps } from "@shared/base/interfaces/base-props.interface";

import { CartBar } from "./cart-bar.component";
import { ServicesGrid } from "./company-services.component.styles";
import { ServiceSelector } from "./service-selector.component";

type Props = BaseProps & {
  services?: ServiceModel[];
};

type State = {
  isLoading: boolean;
  open: boolean;
  cart: Record<string, number>;
};

export class CompanyServices extends BaseComponent<Props, State> {
  public override state: State = { isLoading: false, open: false, cart: {} };

  private handleAdd = (service: ServiceModel) => {
    this.setState(({ cart }) => ({
      cart: { ...cart, [service.id]: (cart[service.id] ?? 0) + 1 },
    }));
  };

  private handleOpen = () => this.setState({ open: true });

  private handleSelectorAdd = (items: { service: ServiceModel; qty: number }[]) => {
    const next: Record<string, number> = { ...this.state.cart };
    items.forEach((item) => {
      next[item.service.id] = (next[item.service.id] ?? 0) + item.qty;
    });
    this.setState({ cart: next, open: false });
  };

  private get cartCount() {
    return Object.values(this.state.cart).reduce((acc, qty) => acc + qty, 0);
  }

  private get cartTotal() {
    const services = this.props.services ?? [];
    return Object.entries(this.state.cart).reduce((acc, [id, qty]) => {
      const service = services.find((item) => item.id === id);
      return acc + (service?.priceCents ?? 0) * qty;
    }, 0);
  }

  protected override renderView(): React.ReactNode {
    const { services } = this.props;
    if (!services || services.length === 0) return null;
    const isMobileViewport =
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 768px)").matches;

    return (
      <div>
        <Typography.Title level={4}>{appI18n.t("company.profile.services.title")}</Typography.Title>

        <ServicesGrid>
          <List
            grid={{ gutter: 12, column: isMobileViewport ? 1 : 2 }}
            dataSource={services}
            renderItem={(service) => (
              <List.Item>
                <Card className="surface" bordered={false}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: isMobileViewport ? "flex-start" : "center",
                      flexWrap: isMobileViewport ? "wrap" : "nowrap",
                      gap: 8,
                    }}
                  >
                    <div>
                      <Typography.Title level={5} style={{ margin: 0 }}>
                        {service.title}
                      </Typography.Title>
                      <Typography.Text type="secondary">{service.description}</Typography.Text>
                    </div>

                    <div style={{ textAlign: isMobileViewport ? "left" : "right" }}>
                      <div style={{ fontWeight: 700 }}>
                        {typeof service.priceCents === "number"
                          ? formatMoneyFromCents(service.priceCents)
                          : service.priceFormatted}
                      </div>
                      <Button
                        type="default"
                        size="small"
                        style={{ marginTop: 8 }}
                        onClick={() => this.handleAdd(service)}
                      >
                        {appI18n.t("company.profile.services.add")}
                      </Button>
                    </div>
                  </div>
                </Card>
              </List.Item>
            )}
          />
        </ServicesGrid>

        <Drawer
          width={isMobileViewport ? "calc(100vw - 24px)" : 720}
          open={this.state.open}
          onClose={() => this.setState({ open: false })}
          title={appI18n.t("company.profile.services.adjustSelection")}
        >
          <ServiceSelector
            services={services}
            onCancel={() => this.setState({ open: false })}
            onAdd={this.handleSelectorAdd}
          />
        </Drawer>

        <CartBar count={this.cartCount} totalCents={this.cartTotal} onOpen={this.handleOpen} />
      </div>
    );
  }
}

export default CompanyServices;
