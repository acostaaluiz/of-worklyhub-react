import React from "react";
import { i18n as appI18n } from "@core/i18n";
import {
  Alert,
  Button,
  Card,
  Col,
  Empty,
  Grid,
  InputNumber,
  List,
  Modal,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Tabs,
  Tooltip,
  Typography,
  message,
} from "antd";
import {
  AlertOutlined,
  BarChartOutlined,
  HistoryOutlined,
  ReloadOutlined,
  ShoppingCartOutlined,
  WarningOutlined,
} from "@ant-design/icons";

import { BasePage } from "@shared/base/base.page";
import PageSkeleton from "@shared/ui/components/page-skeleton/page-skeleton.component";
import type { CategoryModel } from "@modules/inventory/interfaces/category.model";
import type { ProductModel } from "@modules/inventory/interfaces/product.model";
import type {
  CreateInventoryItemPayload,
  InventoryAlert,
  InventoryMovement,
  InventoryPurchaseSuggestion,
} from "@modules/inventory/services/inventory-api";
import {
  createInventoryItem,
  createInventoryMovement,
  getInventoryAlerts,
  listInventoryItems,
  listInventoryMovements,
  updateInventoryItem,
} from "@modules/inventory/services/inventory.http.service";
import { companyService } from "@modules/company/services/company.service";
import type { InventoryFilterState } from "@modules/inventory/presentation/components/inventory-filter/inventory-filter.component";
import InventoryFilterComponent from "@modules/inventory/presentation/components/inventory-filter/inventory-filter.component";
import ProductListComponent from "@modules/inventory/presentation/components/product-list/product-list.component";
import ProductModal from "@modules/inventory/presentation/components/product-modal/product-modal.component";
import StockTemplate from "@modules/inventory/presentation/templates/stock/stock.template";
import { TabsHost } from "@modules/inventory/presentation/templates/stock/stock.template.styles";

type MovementWindow = 7 | 30 | 90;

type BackendErrorShape = {
  code?: string;
  message: string;
};

function toDataMap(value: DataValue | null | undefined): DataMap | null {
  if (!value || typeof value !== "object" || Array.isArray(value) || value instanceof Date) {
    return null;
  }
  return value;
}

function resolveWorkspaceId(): string | null {
  const workspace = companyService.getWorkspaceValue() as
    | { workspaceId?: string; id?: string }
    | null;
  return (workspace?.workspaceId ?? workspace?.id ?? null) as string | null;
}

function toProduct(item: {
  id: string;
  name: string;
  sku?: string | null;
  category?: string | null;
  quantity: number;
  minQuantity: number;
  location?: string | null;
  priceCents: number;
  isActive: boolean;
  createdAt: string;
}): ProductModel {
  return {
    id: item.id,
    name: item.name,
    sku: item.sku ?? undefined,
    categoryId: item.category ?? undefined,
    stock: item.quantity ?? 0,
    minStock: item.minQuantity ?? 0,
    location: item.location ?? undefined,
    priceCents: item.priceCents ?? 0,
    active: item.isActive,
    createdAt: item.createdAt,
    description: undefined,
    barcode: undefined,
    unit: "un",
    tags: undefined,
    costCents: undefined,
  };
}

function toCategoryList(products: ProductModel[]): CategoryModel[] {
  const map = new Map<string, CategoryModel>();
  products.forEach((item) => {
    const name = item.categoryId?.trim();
    if (!name || map.has(name)) return;
    map.set(name, {
      id: name,
      name,
      active: true,
      createdAt: new Date().toISOString(),
      description: undefined,
    });
  });
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
}

function toBackendError(err: DataValue): BackendErrorShape {
  const root = toDataMap(err);
  const response = toDataMap(root?.response);
  const details = toDataMap(root?.details) ?? toDataMap(response?.data);
  const detailsError = toDataMap(details?.error);
  const codeValue = detailsError?.code ?? details?.code;
  const messageValue =
    detailsError?.message ?? details?.message ?? root?.message ?? "Unexpected inventory error";
  const code = typeof codeValue === "string" ? codeValue : undefined;
  const message = typeof messageValue === "string" ? messageValue : "Unexpected inventory error";
  return { code, message };
}

function toInventoryPayload(
  workspaceId: string,
  payload: Omit<ProductModel, "id" | "createdAt">
): CreateInventoryItemPayload {
  return {
    workspaceId,
    name: payload.name,
    sku: payload.sku ?? null,
    category: payload.categoryId ?? null,
    quantity: payload.stock ?? 0,
    minQuantity: payload.minStock ?? 0,
    location: payload.location ?? null,
    priceCents: payload.priceCents ?? 0,
    isActive: payload.active ?? true,
  };
}

function getWindowStartIso(days: MovementWindow): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

function severityColor(severity: InventoryAlert["severity"]): string {
  if (severity === "high") return "red";
  if (severity === "medium") return "orange";
  return "blue";
}

function sourceColor(source: InventoryMovement["source"]): string {
  if (source === "work-order") return "magenta";
  if (source === "schedule") return "purple";
  if (source === "adjustment") return "gold";
  if (source === "system") return "cyan";
  return "blue";
}

function renderTruncatedText(value: string, maxChars: number): React.ReactNode {
  const raw = value?.trim() ?? "";
  if (!raw) return "--";
  const needsTruncation = raw.length > maxChars;
  const short = needsTruncation ? `${raw.slice(0, maxChars).trimEnd()}...` : raw;

  return (
    <Tooltip title={needsTruncation ? raw : undefined}>
      <span
        style={{
          display: "inline-block",
          maxWidth: "100%",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          verticalAlign: "bottom",
        }}
      >
        {short}
      </span>
    </Tooltip>
  );
}

function InventoryHomePageContent(): React.ReactElement {
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;

  const [workspaceId, setWorkspaceId] = React.useState<string | null>(() =>
    resolveWorkspaceId()
  );
  const [products, setProducts] = React.useState<ProductModel[]>([]);
  const [movements, setMovements] = React.useState<InventoryMovement[]>([]);
  const [alerts, setAlerts] = React.useState<InventoryAlert[]>([]);
  const [suggestions, setSuggestions] = React.useState<InventoryPurchaseSuggestion[]>([]);
  const [windowDays, setWindowDays] = React.useState<MovementWindow>(30);
  const [loading, setLoading] = React.useState(false);
  const [initialLoading, setInitialLoading] = React.useState(true);
  const [productModalOpen, setProductModalOpen] = React.useState(false);
  const [productModalInitial, setProductModalInitial] = React.useState<Partial<ProductModel> | null>(
    null
  );
  const [filter, setFilter] = React.useState<InventoryFilterState>({
    q: "",
    stockStatus: "all",
  });

  const categories = React.useMemo(() => toCategoryList(products), [products]);

  const refreshData = React.useCallback(async () => {
    if (!workspaceId) {
      setProducts([]);
      setMovements([]);
      setAlerts([]);
      setSuggestions([]);
      setInitialLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [itemsRows, movementRows, alertsResponse] = await Promise.all([
        listInventoryItems(workspaceId),
        listInventoryMovements(workspaceId, {
          from: getWindowStartIso(windowDays),
          limit: 80,
        }),
        getInventoryAlerts(workspaceId),
      ]);

      setProducts((itemsRows ?? []).map(toProduct));
      setMovements(movementRows ?? []);
      setAlerts(alertsResponse.alerts ?? []);
      setSuggestions(alertsResponse.suggestions ?? []);
    } catch (err) {
      message.error("Failed to load inventory dashboard.");
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [workspaceId, windowDays]);

  React.useEffect(() => {
    const sub = companyService.getWorkspace$().subscribe(() => {
      setWorkspaceId(resolveWorkspaceId());
    });
    return () => sub.unsubscribe();
  }, []);

  React.useEffect(() => {
    refreshData();
  }, [refreshData]);

  const totalItems = products.length;
  const lowStockItems = products.filter((item) => item.stock <= (item.minStock ?? 0)).length;
  const outOfStockItems = products.filter((item) => item.stock <= 0).length;
  const stockValueCents = products.reduce((acc, item) => {
    const qty = Math.max(0, Number(item.stock ?? 0));
    const price = Math.max(0, Number(item.priceCents ?? 0));
    return acc + qty * price;
  }, 0);

  const filteredProducts = products.filter((item) => {
    const q = (filter.q ?? "").trim().toLowerCase();
    if (q) {
      const matches =
        item.name.toLowerCase().includes(q) ||
        (item.sku ?? "").toLowerCase().includes(q) ||
        (item.barcode ?? "").toLowerCase().includes(q);
      if (!matches) return false;
    }
    if (filter.categoryId && item.categoryId !== filter.categoryId) return false;
    if (filter.stockStatus === "in" && item.stock <= 0) return false;
    if (filter.stockStatus === "out" && item.stock > 0) return false;
    if (typeof filter.minStock === "number" && item.stock < filter.minStock) return false;
    return true;
  });

  const openCreate = () => {
    setProductModalInitial(null);
    setProductModalOpen(true);
  };

  const openEdit = (product: ProductModel) => {
    setProductModalInitial(product);
    setProductModalOpen(true);
  };

  const openMovementModal = (product: ProductModel, direction: "in" | "out") => {
    if (!workspaceId) {
      message.warning("Workspace not found.");
      return;
    }

    let quantity = 1;

    Modal.confirm({
      title:
        direction === "in"
          ? `Stock entry: ${product.name}`
          : `Stock exit: ${product.name}`,
      content: (
        <div style={{ marginTop: 12 }}>
          <Typography.Text type="secondary">
            Inform quantity to {direction === "in" ? "add" : "consume"} from stock.
          </Typography.Text>
          <InputNumber
            min={1}
            defaultValue={1}
            style={{ width: "100%", marginTop: 10 }}
            onChange={(value) => {
              quantity = Math.max(0, Math.round(Number(value ?? 0)));
            }}
          />
        </div>
      ),
      onOk: async () => {
        if (quantity <= 0) return Promise.reject(new Error("invalid quantity"));
        try {
          await createInventoryMovement({
            workspaceId,
            inventoryItemId: product.id,
            direction,
            quantity,
            source: "manual",
            reason:
              direction === "in"
                ? "Manual stock entry from inventory panel"
                : "Manual stock exit from inventory panel",
            referenceType: "inventory-home",
            referenceId: product.id,
          });
          await refreshData();
          message.success("Inventory movement recorded.");
        } catch (err) {
          const parsed = toBackendError(err as DataValue);
          if (parsed.code === "STOCK_UNDERFLOW") {
            message.error("Insufficient stock for this movement.");
            return Promise.reject(err);
          }
          message.error(parsed.message);
          return Promise.reject(err);
        }
      },
    });
  };

  const movementColumns = React.useMemo(
    () => {
      const columns = [
      {
        title: "Date",
        dataIndex: "occurredAt",
        key: "occurredAt",
        width: isMobile ? 140 : 170,
        render: (value: string) =>
          new Date(value).toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
      },
      {
        title: "Item",
        dataIndex: "itemName",
        key: "itemName",
        width: isMobile ? 200 : 260,
        ellipsis: { showTitle: false },
        render: (_: string, row: InventoryMovement) => {
          const full = row.itemSku ? `${row.itemName} (${row.itemSku})` : row.itemName;
          return renderTruncatedText(full, isMobile ? 26 : 42);
        },
      },
      {
        title: "Direction",
        dataIndex: "direction",
        key: "direction",
        width: 110,
        render: (value: InventoryMovement["direction"]) => (
          <Tag color={value === "in" ? "green" : "volcano"}>
            {value === "in" ? "IN" : "OUT"}
          </Tag>
        ),
      },
      {
        title: "Qty",
        dataIndex: "quantity",
        key: "quantity",
        width: 90,
      },
      {
        title: "Source",
        dataIndex: "source",
        key: "source",
        width: 130,
        render: (value: InventoryMovement["source"]) => (
          <Tag color={sourceColor(value)}>{value}</Tag>
        ),
      },
      {
        title: "Balance",
        dataIndex: "nextQuantity",
        key: "nextQuantity",
        width: 100,
      },
      {
        title: "Reason",
        dataIndex: "reason",
        key: "reason",
        width: isMobile ? 210 : 320,
        ellipsis: { showTitle: false },
        render: (value?: string | null) => renderTruncatedText(value ?? "--", isMobile ? 28 : 56),
      },
    ];

      if (!isMobile) {
        return columns;
      }

      return columns.filter((column) =>
        ["occurredAt", "itemName", "direction", "quantity", "reason"].includes(
          String(column.key)
        )
      );
    },
    [isMobile]
  );

  if (initialLoading) {
    return <PageSkeleton mainRows={4} sideRows={3} height="100%" />;
  }

  const indicatorsTabContent = (
    <div
      style={{
        height: "100%",
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        gap: isMobile ? 10 : 12,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile
            ? "repeat(2, minmax(0, 1fr))"
            : "repeat(4, minmax(0, 1fr))",
          gap: isMobile ? 10 : 12,
          width: "100%",
          flexShrink: 0,
        }}
      >
        <Card
          size="small"
          className="surface"
          style={{ borderRadius: 12, minHeight: isMobile ? 84 : 92 }}
        >
          <Statistic title="Catalog items" value={totalItems} prefix={<ShoppingCartOutlined />} />
        </Card>
        <Card
          size="small"
          className="surface"
          style={{ borderRadius: 12, minHeight: isMobile ? 84 : 92 }}
        >
          <Statistic
            title="Low stock"
            value={lowStockItems}
            valueStyle={{ color: lowStockItems > 0 ? "#d46b08" : undefined }}
            prefix={<WarningOutlined />}
          />
        </Card>
        <Card
          size="small"
          className="surface"
          style={{ borderRadius: 12, minHeight: isMobile ? 84 : 92 }}
        >
          <Statistic
            title="Out of stock"
            value={outOfStockItems}
            valueStyle={{ color: outOfStockItems > 0 ? "#cf1322" : undefined }}
            prefix={<AlertOutlined />}
          />
        </Card>
        <Card
          size="small"
          className="surface"
          style={{ borderRadius: 12, minHeight: isMobile ? 84 : 92 }}
        >
          <Statistic
            title="Stock value"
            value={stockValueCents / 100}
            precision={isMobile ? 0 : 2}
            formatter={(value) =>
              `R$ ${Number(value ?? 0).toLocaleString("en-US", {
                minimumFractionDigits: isMobile ? 0 : 2,
                maximumFractionDigits: isMobile ? 0 : 2,
              })}`
            }
            valueStyle={{
              fontSize: isMobile ? 24 : undefined,
              lineHeight: 1.1,
              whiteSpace: "nowrap",
            }}
          />
        </Card>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile
            ? "minmax(0, 1fr)"
            : "repeat(2, minmax(0, 1fr))",
          gap: isMobile ? 10 : 12,
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        <Card
          size="small"
          className="surface"
          title={(
            <Space size={8}>
              <WarningOutlined />
              <span>Critical stock alerts</span>
            </Space>
          )}
          style={{ borderRadius: 12, minHeight: 0 }}
        >
          {alerts.length === 0 ? (
            <Empty description="No critical alerts" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          ) : (
            <List
              size="small"
              dataSource={alerts.slice(0, 4)}
              renderItem={(alert) => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <Space size={8}>
                        {renderTruncatedText(alert.itemName, isMobile ? 20 : 34)}
                        <Tag color={severityColor(alert.severity)}>
                          {alert.severity.toUpperCase()}
                        </Tag>
                      </Space>
                    }
                    description={`Current ${alert.quantity} • Min ${alert.minQuantity}`}
                  />
                </List.Item>
              )}
            />
          )}
        </Card>

        <Card
          size="small"
          className="surface"
          title={(
            <Space size={8}>
              <HistoryOutlined />
              <span>Recent stock movements</span>
            </Space>
          )}
          style={{ borderRadius: 12, minHeight: 0 }}
        >
          {movements.length === 0 ? (
            <Empty description="No recent movement" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          ) : (
            <List
              size="small"
              dataSource={movements.slice(0, 4)}
              renderItem={(movement) => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <Space size={8}>
                        {renderTruncatedText(movement.itemName, isMobile ? 20 : 34)}
                        <Tag color={movement.direction === "in" ? "green" : "volcano"}>
                          {movement.direction === "in" ? "IN" : "OUT"}
                        </Tag>
                      </Space>
                    }
                    description={`Qty ${movement.quantity} • ${new Date(movement.occurredAt).toLocaleDateString("en-US")}`}
                  />
                </List.Item>
              )}
            />
          )}
        </Card>
      </div>
    </div>
  );

  const productsTabContent = (
    <div style={{ height: "100%", minHeight: 0, overflow: "auto", overflowX: "hidden", paddingRight: 4 }}>
      <Card size="small" style={{ borderRadius: 12, marginBottom: 12 }}>
        <InventoryFilterComponent
          categories={categories}
          value={filter}
          onChange={setFilter}
        />
      </Card>

      <ProductListComponent
        products={filteredProducts}
        categories={categories}
        onEdit={openEdit}
        onEntry={(product) => openMovementModal(product, "in")}
        onExit={(product) => openMovementModal(product, "out")}
      />
    </div>
  );

  const alertsTabContent = (
    <Row gutter={[12, 12]}>
      <Col xs={24} lg={14}>
        <Card
          title={
            <Space>
              <AlertOutlined />
              <span>Operational alerts</span>
            </Space>
          }
          style={{ borderRadius: 12 }}
        >
          {alerts.length === 0 ? (
            <Empty description="No alerts for minimum stock" />
          ) : (
            <div style={{ maxHeight: 300, overflowY: "auto", paddingRight: 4 }}>
              <List
                dataSource={alerts}
                renderItem={(alert) => (
                  <List.Item>
                    <List.Item.Meta
                      title={
                        <Space>
                          <span>
                            {alert.itemSku
                              ? `${alert.itemName} (${alert.itemSku})`
                              : alert.itemName}
                          </span>
                          <Tag color={severityColor(alert.severity)}>
                            {alert.severity.toUpperCase()}
                          </Tag>
                        </Space>
                      }
                      description={
                        <Space size={18} wrap>
                          <Typography.Text type="secondary">
                            Current: <strong>{alert.quantity}</strong>
                          </Typography.Text>
                          <Typography.Text type="secondary">
                            Minimum: <strong>{alert.minQuantity}</strong>
                          </Typography.Text>
                          <Typography.Text type="secondary">
                            Coverage days:{" "}
                            <strong>
                              {alert.coverageDays === null ? "--" : alert.coverageDays}
                            </strong>
                          </Typography.Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </div>
          )}
        </Card>
      </Col>

      <Col xs={24} lg={10}>
        <Card
          title={
            <Space>
              <ShoppingCartOutlined />
              <span>Purchase suggestions</span>
            </Space>
          }
          style={{ borderRadius: 12 }}
        >
          {suggestions.length === 0 ? (
            <Empty description="No suggestions right now" />
          ) : (
            <div style={{ maxHeight: 300, overflowY: "auto", paddingRight: 4 }}>
              <List
                dataSource={suggestions}
                renderItem={(suggestion) => (
                  <List.Item>
                    <List.Item.Meta
                      title={
                        <Space>
                          <span>
                            {suggestion.itemSku
                              ? `${suggestion.itemName} (${suggestion.itemSku})`
                              : suggestion.itemName}
                          </span>
                          <Tag color="processing">Buy {suggestion.suggestedQuantity}</Tag>
                        </Space>
                      }
                      description={suggestion.reason}
                    />
                  </List.Item>
                )}
              />
            </div>
          )}
        </Card>
      </Col>
    </Row>
  );

  const movementsTabContent = (
    <Card
      title={
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <Space>
            <HistoryOutlined />
            <span>Stock movement ledger</span>
          </Space>
          <Select<MovementWindow>
            value={windowDays}
            style={{ width: 210 }}
            options={[
              { value: 7, label: "Last 7 days" },
              { value: 30, label: "Last 30 days" },
              { value: 90, label: "Last 90 days" },
            ]}
            onChange={(value) => setWindowDays(value)}
          />
        </div>
      }
      style={{ borderRadius: 12 }}
    >
      <Table
        rowKey="id"
        loading={loading}
        size="small"
        columns={movementColumns}
        dataSource={movements}
        tableLayout="fixed"
        pagination={{ pageSize: 4, size: "small", showSizeChanger: false }}
        scroll={isMobile ? { x: 760, y: 240 } : { y: 280 }}
      />
    </Card>
  );

  return (
    <StockTemplate title="Smart Inventory">
      <div
        data-cy="inventory-home-page"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          height: "100%",
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        {!workspaceId ? (
          <Alert
            type="warning"
            showIcon
            message="Workspace not found"
            description="Complete company onboarding to enable real inventory operations."
            style={{ marginBottom: 4 }}
          />
        ) : null}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
            flexShrink: 0,
          }}
        >
          <Typography.Text type="secondary">
            Use tabs to navigate products, alerts and movement ledger without page scroll.
          </Typography.Text>

          <Space>
            <Button type="primary" onClick={openCreate} disabled={!workspaceId} data-cy="inventory-new-product-button">
              New product
            </Button>
            <Button icon={<ReloadOutlined />} onClick={() => refreshData()} loading={loading}>
              Refresh
            </Button>
          </Space>
        </div>

        <TabsHost>
          <Tabs
            defaultActiveKey="products"
            destroyInactiveTabPane
            style={{ marginTop: 0 }}
            items={[
              {
                key: "products",
                label: (
                  <Space size={8}>
                    <ShoppingCartOutlined />
                    <span>Products</span>
                  </Space>
                ),
                children: productsTabContent,
              },
              {
                key: "indicators",
                label: (
                  <Space size={8}>
                    <BarChartOutlined />
                    <span>Indicators</span>
                  </Space>
                ),
                children: indicatorsTabContent,
              },
              {
                key: "alerts",
                label: (
                  <Space size={8}>
                    <AlertOutlined />
                    <span>Alerts & Suggestions</span>
                  </Space>
                ),
                children: (
                  <div style={{ height: "100%", minHeight: 0, overflow: "auto", overflowX: "hidden", paddingRight: 4 }}>
                    {alertsTabContent}
                  </div>
                ),
              },
              {
                key: "movements",
                label: (
                  <Space size={8}>
                    <HistoryOutlined />
                    <span>Movement Ledger</span>
                  </Space>
                ),
                children: (
                  <div style={{ height: "100%", minHeight: 0, overflow: "auto", overflowX: "hidden", paddingRight: 4 }}>
                    {movementsTabContent}
                  </div>
                ),
              },
            ]}
          />
        </TabsHost>
      </div>

      <ProductModal
        open={productModalOpen}
        initial={productModalInitial ?? undefined}
        workspaceId={workspaceId ?? undefined}
        categories={categories}
        onClose={() => setProductModalOpen(false)}
        onSaved={async (payload, id?: string) => {
          if (!workspaceId) {
            message.warning("Workspace not found.");
            return;
          }
          const inventoryPayload = toInventoryPayload(workspaceId, payload);
          try {
            if (id) {
              await updateInventoryItem(id, inventoryPayload);
              message.success("Item updated successfully.");
            } else {
              await createInventoryItem(inventoryPayload);
              message.success("Item created successfully.");
            }
            setProductModalOpen(false);
            await refreshData();
          } catch (err) {
            const parsed = toBackendError(err as DataValue);
            message.error(parsed.message);
            throw err;
          }
        }}
      />
    </StockTemplate>
  );
}

export class InventoryHomePage extends BasePage {
  protected override options = {
    title: `${appI18n.t("inventory.pageTitles.home")} | WorklyHub`,
    requiresAuth: true,
  };

  protected override renderPage(): React.ReactNode {
    return React.createElement(InventoryHomePageContent);
  }
}

export default InventoryHomePage;
