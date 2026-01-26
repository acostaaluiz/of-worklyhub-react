import React from "react";
import { List, Card, Typography, Empty, Input, Tag, Space } from "antd";
import { Search, Heart } from "lucide-react";
import { formatMoneyFromCents } from "@core/utils/mask";
import { BaseComponent } from "@shared/base/base.component";
import { TitleBlock } from "@shared/styles/global";
import type { ServiceModel } from "@modules/clients/interfaces/service.model";
import { getAvailableServices } from "@modules/clients/services/clients.service";
import {
  ServicesWrap,
  ServiceCard,
  ServiceMeta,
  ImageWrap,
  RatingBadge,
  ActionsRow,
  HeaderRow,
  SearchWrap,
} from "./services-list.component.styles";
import { Link } from "react-router-dom";

type State = {
  items: ServiceModel[];
  q: string;
  isLoading: boolean;
  error?: unknown;
};

export class ServicesList extends BaseComponent<{}, State> {
  state: State = { items: [], q: "", isLoading: false, error: undefined };

  protected override renderView(): React.ReactNode {
    const { items, q } = this.state;

    if (!items) return null;
    if (items.length === 0) return <Empty description="Nenhum serviço encontrado" />;

    const term = q.trim().toLowerCase();
    const list = !term
      ? items
      : items.filter((it) => {
          const fields = [it.title, it.providerName, it.description, it.address, (it.tags || []).join(" ")] 
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          return fields.includes(term);
        });

    return (
      <ServicesWrap>
        <HeaderRow>
          <TitleBlock>
            <Typography.Title level={3} style={{ margin: 0 }}>
              Serviços Disponíveis
            </Typography.Title>
            <Typography.Text type="secondary">Explore empresas e serviços</Typography.Text>
          </TitleBlock>

          <SearchWrap>
            <Input
              placeholder="Pesquisar serviços ou empresas"
              allowClear
              value={q}
              onChange={(ev) => this.setSafeState({ q: ev.target.value })}
              prefix={<Search size={16} />}
            />
          </SearchWrap>
        </HeaderRow>

        <List
          grid={{ gutter: 16, column: 4 }}
          dataSource={list}
          renderItem={(item) => (
            <List.Item>
              <Link to={`/clients/service/${item.id}`} style={{ textDecoration: "none" }}>
                <ServiceCard className="surface" style={{ cursor: "pointer" }}>
                  <Card bordered={false} bodyStyle={{ padding: 0 }}>
                    <ImageWrap style={{ backgroundImage: `url(${item.imageUrl})` }}>
                    <RatingBadge>
                      <div>{item.rating?.toFixed(1)}</div>
                      <div style={{ fontSize: 12 }}>{item.reviewsCount}</div>
                    </RatingBadge>
                  </ImageWrap>

                  <div style={{ padding: "12px" }}>
                    <Space direction="vertical" style={{ width: "100%" }}>
                      <HeaderRow style={{ alignItems: "center" }}>
                        <div>
                          <Typography.Title level={5} style={{ margin: 0 }}>
                            {item.providerName}
                          </Typography.Title>
                          <ServiceMeta>{item.address}</ServiceMeta>
                        </div>

                        <div>{item.featured ? <Tag color="gold">Destaque</Tag> : null}</div>
                      </HeaderRow>

                      <Typography.Paragraph type="secondary" style={{ marginBottom: 4 }}>
                        {item.description}
                      </Typography.Paragraph>

                      <ActionsRow>
                        <div style={{ fontWeight: 600 }}>
                          {typeof item.priceCents === "number" ? formatMoneyFromCents(item.priceCents) : item.priceFormatted}
                        </div>
                        <div style={{ marginLeft: 8 }}>
                          <Heart size={16} />
                        </div>
                      </ActionsRow>
                    </Space>
                  </div>
                  </Card>
                </ServiceCard>
              </Link>
            </List.Item>
          )}
        />
      </ServicesWrap>
    );
  }

  protected override renderLoading(): React.ReactNode {
    return null;
  }

  protected override renderError(_error: unknown): React.ReactNode {
    return <div>Error loading services</div>;
  }

  componentDidMount(): void {
    super.componentDidMount?.();
    this.runAsync(async () => {
      const data = await getAvailableServices();
      this.setSafeState({ items: data });
    }, { setLoading: true, swallowError: true });
  }
}

export default ServicesList;
