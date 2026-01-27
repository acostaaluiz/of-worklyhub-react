import React from "react";
import { List, Card, Typography, Empty, Input, Tag, Space, Button, Modal, Select, Slider, Switch } from "antd";
import { Search, Heart, Star, Filter, Sparkles, Scissors, Car, Camera, Palette, UtensilsCrossed, Dumbbell, Flower2, CalendarCheck } from "lucide-react";
import { formatMoneyFromCents } from "@core/utils/mask";
import { BaseComponent } from "@shared/base/base.component";
import { FieldIcon, TitleBlock } from "@shared/styles/global";
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
  CardActionIcon,
  TitleWithIcon,
  TitleIcon,
  CategoryFilterRow,
  CategoryFilterButton,
} from "./services-list.component.styles";
import { Link } from "react-router-dom";

type State = {
  items: ServiceModel[];
  q: string;
  isLoading: boolean;
  columns: number;
  pageSize: number;
  isFilterOpen: boolean;
  category?: string;
  minRating?: number;
  featuredOnly: boolean;
  priceRange?: [number, number];
  error?: unknown;
};

export class ServicesList extends BaseComponent<{}, State> {
  state: State = {
    items: [],
    q: "",
    isLoading: false,
    columns: 4,
    pageSize: 8,
    isFilterOpen: false,
    category: undefined,
    minRating: undefined,
    featuredOnly: false,
    priceRange: undefined,
    error: undefined,
  };

  private handleResize = () => {
    const width = window.innerWidth;
    const columns = width < 576 ? 1 : width < 900 ? 2 : width < 1200 ? 3 : 4;
    const rows = 1;
    const pageSize = columns * rows;

    if (columns !== this.state.columns || pageSize !== this.state.pageSize) {
      this.setSafeState({ columns, pageSize });
    }
  };

  protected override renderView(): React.ReactNode {
    const { items, q, columns, pageSize, category, minRating, featuredOnly, priceRange, isFilterOpen } = this.state;

    if (!items) return null;
    if (items.length === 0) return <Empty description="No services found" />;

    const term = q.trim().toLowerCase();
    const categories = Array.from(
      new Set(items.flatMap((item) => item.tags || []).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b));

    const prices = items
      .map((item) => item.priceCents)
      .filter((value): value is number => typeof value === "number");
    const minPrice = prices.length ? Math.min(...prices) : 0;
    const maxPrice = prices.length ? Math.max(...prices) : 0;
    const activePriceRange = priceRange ?? [minPrice, maxPrice];

    const list = items.filter((it) => {
      const fields = [it.title, it.providerName, it.description, it.address, (it.tags || []).join(" ")]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const matchesTerm = !term || fields.includes(term);
      const matchesCategory = !category || (it.tags || []).includes(category);
      const matchesRating = typeof minRating !== "number" || (it.rating ?? 0) >= minRating;
      const matchesFeatured = !featuredOnly || Boolean(it.featured);
      const matchesPrice =
        typeof it.priceCents !== "number" ||
        (it.priceCents >= activePriceRange[0] && it.priceCents <= activePriceRange[1]);
      return matchesTerm && matchesCategory && matchesRating && matchesFeatured && matchesPrice;
    });
    const formatRangeMoney = (value: number) =>
      formatMoneyFromCents(value, { locale: "pt-BR", currency: "BRL" });

    const resolveCardIcon = (tags?: string[]) => {
      const joined = (tags ?? []).join(" ").toLowerCase();
      if (joined.includes("barbearia") || joined.includes("cabelo") || joined.includes("beleza")) return <Scissors size={14} />;
      if (joined.includes("auto")) return <Car size={14} />;
      if (joined.includes("foto")) return <Camera size={14} />;
      if (joined.includes("web") || joined.includes("design") || joined.includes("criativo")) return <Palette size={14} />;
      if (joined.includes("culinaria") || joined.includes("gastronomia")) return <UtensilsCrossed size={14} />;
      if (joined.includes("saude") || joined.includes("fitness")) return <Dumbbell size={14} />;
      if (joined.includes("decor") || joined.includes("flor")) return <Flower2 size={14} />;
      if (joined.includes("evento")) return <CalendarCheck size={14} />;
      return <Sparkles size={14} />;
    };

    const categoryPalette = [
      "#10B981",
      "#06B6D4",
      "#F59E0B",
      "#A78BFA",
      "#F97316",
      "#0EA5E9",
      "#EF4444",
      "#22C55E",
    ];

    const colorFromCategory = (label: string, idx: number) => {
      let hash = 0;
      for (let i = 0; i < label.length; i += 1) {
        hash = (hash << 5) - hash + label.charCodeAt(i);
        hash |= 0;
      }
      const pick = Math.abs(hash + idx) % categoryPalette.length;
      return categoryPalette[pick];
    };

    return (
      <ServicesWrap>
        <HeaderRow>
          <TitleBlock>
            <TitleWithIcon>
              <TitleIcon aria-hidden><Sparkles size={18} /></TitleIcon>
              <Typography.Title level={3} style={{ margin: 0 }}>
                Available Services
              </Typography.Title>
            </TitleWithIcon>
            <Typography.Text type="secondary">Explore companies and services</Typography.Text>
          </TitleBlock>

          <SearchWrap>
            <Button
              type="primary"
              icon={<Filter size={16} />}
              onClick={() =>
                this.setSafeState({
                  isFilterOpen: true,
                  priceRange: priceRange ?? [minPrice, maxPrice],
                })
              }
            >
              Filters
            </Button>
            <Input
              placeholder="Search services or companies"
              allowClear
              value={q}
              onChange={(ev) => this.setSafeState({ q: ev.target.value })}
              prefix={
                <FieldIcon aria-hidden>
                  <Search size={18} />
                </FieldIcon>
              }
            />
          </SearchWrap>
        </HeaderRow>

        <CategoryFilterRow>
          <CategoryFilterButton
            type="button"
            $active={!category}
            $color="var(--color-primary)"
            onClick={() => this.setSafeState({ category: undefined })}
          >
            All
          </CategoryFilterButton>
          {categories.slice(0, 5).map((cat, idx) => (
            <CategoryFilterButton
              key={cat}
              type="button"
              $active={category === cat}
              $color={colorFromCategory(cat, idx)}
              onClick={() => this.setSafeState({ category: cat })}
            >
              {cat}
            </CategoryFilterButton>
          ))}
        </CategoryFilterRow>

        <List
          grid={{ gutter: 16, column: columns }}
          dataSource={list}
          pagination={{
            pageSize,
            position: "bottom",
            align: "center",
            showSizeChanger: false,
            style: { marginTop: 16 },
          }}
          renderItem={(item) => (
            <List.Item>
              <Link to={`/clients/service/${item.id}`} style={{ textDecoration: "none" }}>
                <ServiceCard className="surface" style={{ cursor: "pointer" }}>
                  <Card bordered={false} bodyStyle={{ padding: 0 }}>
                    <ImageWrap style={{ backgroundImage: `url(${item.imageUrl})` }}>
                    <RatingBadge>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <Star size={12} fill="#f5c518" color="#f5c518" />
                        <span>{item.rating?.toFixed(1)}</span>
                      </div>
                      <div style={{ fontSize: 12 }}>{item.reviewsCount}</div>
                    </RatingBadge>
                  </ImageWrap>

                  <div className="service-content" style={{ padding: "12px" }}>
                    <div className="service-body">
                      <HeaderRow style={{ alignItems: "center" }}>
                        <div>
                          <Typography.Title level={5} style={{ margin: 0 }}>
                            <span className="service-title">{item.providerName}</span>
                          </Typography.Title>
                          <ServiceMeta className="service-address">{item.address}</ServiceMeta>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          {item.featured ? <Tag color="gold">Featured</Tag> : null}
                          <CardActionIcon aria-hidden>{resolveCardIcon(item.tags)}</CardActionIcon>
                        </div>
                      </HeaderRow>

                      <Typography.Paragraph type="secondary" style={{ marginBottom: 4 }}>
                        <span className="service-description">{item.description}</span>
                      </Typography.Paragraph>

                      <ActionsRow>
                        <div style={{ fontWeight: 600 }}>
                          {item.priceFormatted ??
                            (typeof item.priceCents === "number"
                              ? formatMoneyFromCents(item.priceCents, { locale: "pt-BR", currency: "BRL" })
                              : "")}
                        </div>
                        <div style={{ marginLeft: 8 }}>
                          <Heart size={16} />
                        </div>
                      </ActionsRow>
                    </div>
                  </div>
                  </Card>
                </ServiceCard>
              </Link>
            </List.Item>
          )}
        />
        <Modal
          title="Filters"
          open={isFilterOpen}
          onCancel={() => this.setSafeState({ isFilterOpen: false })}
          onOk={() => this.setSafeState({ isFilterOpen: false })}
          okText="Apply"
          cancelText="Close"
        >
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <div>
              <Typography.Text strong>Category</Typography.Text>
              <CategoryFilterRow>
                <CategoryFilterButton
                  type="button"
                  $active={!category}
                  $color="var(--color-primary)"
                  onClick={() => this.setSafeState({ category: undefined })}
                >
                  All
                </CategoryFilterButton>
                {categories.map((cat, idx) => (
                  <CategoryFilterButton
                    key={cat}
                    type="button"
                    $active={category === cat}
                    $color={colorFromCategory(cat, idx)}
                    onClick={() => this.setSafeState({ category: cat })}
                  >
                    {cat}
                  </CategoryFilterButton>
                ))}
              </CategoryFilterRow>
            </div>
            <div>
              <Typography.Text strong>Minimum rating</Typography.Text>
              <Select
                placeholder="Any"
                allowClear
                value={minRating}
                onChange={(value) => this.setSafeState({ minRating: value })}
                options={[0, 3, 3.5, 4, 4.5].map((value) => ({
                  label: value === 0 ? "Any" : `${value}+`,
                  value,
                }))}
                style={{ width: "100%", marginTop: 8 }}
              />
            </div>
            <div>
              <Typography.Text strong>Price</Typography.Text>
              <div style={{ marginTop: 8 }}>
                <Slider
                  range
                  min={minPrice}
                  max={maxPrice}
                  value={activePriceRange}
                  onChange={(value) => this.setSafeState({ priceRange: value as [number, number] })}
                  disabled={minPrice === maxPrice}
                />
                <Typography.Text type="secondary">
                  {formatRangeMoney(activePriceRange[0])} – {formatRangeMoney(activePriceRange[1])}
                </Typography.Text>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Typography.Text strong>Featured only</Typography.Text>
              <Switch
                checked={featuredOnly}
                onChange={(checked) => this.setSafeState({ featuredOnly: checked })}
              />
            </div>
            <Button
              block
              type="default"
              onClick={() =>
                this.setSafeState({
                  category: undefined,
                  minRating: undefined,
                  featuredOnly: false,
                  priceRange: undefined,
                })
              }
            >
              Clear filters
            </Button>
          </Space>
        </Modal>
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
    this.handleResize();
    window.addEventListener("resize", this.handleResize);
    this.runAsync(async () => {
      const data = await getAvailableServices();
      this.setSafeState({ items: data });
    }, { setLoading: true, swallowError: true });
  }

  componentWillUnmount(): void {
    window.removeEventListener("resize", this.handleResize);
  }
}

export default ServicesList;


