import React, { useEffect, useMemo, useState } from "react";
import { Input, Select, Row, Col, Card, message } from "antd";
import StockTemplate from "@modules/inventory/presentation/templates/stock/stock.template";
import ProductListComponent from "@modules/inventory/presentation/components/product-list/product-list.component";
import ProductModal from "@modules/inventory/presentation/components/product-modal/product-modal.component";
import { companyService } from "@modules/company/services/company.service";
import { listInventoryItems } from "@modules/inventory/services/inventory.http.service";
import { InventoryService } from "@modules/inventory/services/inventory.service";
import type { ProductModel } from "@modules/inventory/interfaces/product.model";
import type { CategoryModel } from "@modules/inventory/interfaces/category.model";
import { BasePage } from "@shared/base/base.page";

const { Search } = Input;

function InventoryOverviewPageContent(): JSX.Element {
  const service = useMemo(() => new InventoryService(), []);
  const [products, setProducts] = useState<ProductModel[]>([]);
  const [categories, setCategories] = useState<CategoryModel[]>([]);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [productModalInitial, setProductModalInitial] = useState<Partial<ProductModel> | null>(null);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | undefined>(undefined);
  const [_loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [ps, cs] = await Promise.all([service.listProducts(), service.listCategories()]);
        setProducts(ps);
        setCategories(cs);
      } catch (e) {
        message.error("Falha ao carregar dados");
      } finally {
        setLoading(false);
      }
    })();
  }, [service]);

  const filtered = products.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()) && (cat ? p.categoryId === cat : true));

  async function handleEntry(p: ProductModel) {
    const qty = 1;
    try {
      await service.changeStock(p.id, qty, "IN");
      const res = await service.listProducts();
      setProducts(res);
      message.success("Entrada registrada");
    } catch (e) {
      message.error("Falha ao registrar entrada");
    }
  }

  async function handleExit(p: ProductModel) {
    const qty = 1;
    try {
      await service.changeStock(p.id, qty, "OUT");
      const res = await service.listProducts();
      setProducts(res);
      message.success("Saída registrada");
    } catch (e) {
      message.error("Falha ao registrar saída");
    }
  }

  return (
    <StockTemplate>
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={12}>
          <Col span={12}>
            <Search placeholder="Pesquisar produto" enterButton onSearch={(v) => setQ(v)} allowClear />
          </Col>
          <Col span={6}>
            <Select allowClear style={{ width: "100%" }} placeholder="Filtrar por categoria" options={categories.map((c) => ({ label: c.name, value: c.id }))} onChange={(v) => setCat(v)} />
          </Col>
        </Row>
      </Card>

      <ProductListComponent products={filtered} categories={categories} onEdit={(p) => {
        setProductModalInitial(p);
        setProductModalOpen(true);
      }} onEntry={handleEntry} onExit={handleExit} />

      <ProductModal
        open={productModalOpen}
        initial={productModalInitial ?? undefined}
        categories={categories}
        workspaceId={(companyService.getWorkspaceValue() as any)?.workspaceId ?? (companyService.getWorkspaceValue() as any)?.id}
        onClose={() => setProductModalOpen(false)}
        onSaved={async () => {
          const ws = companyService.getWorkspaceValue() as { workspaceId?: string; id?: string } | null;
          const workspaceId = (ws?.workspaceId ?? ws?.id) as string | undefined;
          if (workspaceId) {
            const res = await listInventoryItems(workspaceId);
            const mapped = res.map((r) => ({
              id: r.id,
              name: r.name,
              sku: r.sku ?? undefined,
              description: undefined,
              barcode: undefined,
              unit: "un",
              categoryId: r.category ?? undefined,
              costCents: undefined,
              priceCents: r.priceCents ?? undefined,
              minStock: r.minQuantity ?? undefined,
              location: r.location ?? undefined,
              tags: undefined,
              active: r.isActive,
              stock: r.quantity ?? 0,
              createdAt: r.createdAt,
            }));
            setProducts(mapped);
          } else {
            const res = await service.listProducts();
            setProducts(res);
          }
          setProductModalOpen(false);
        }}
      />
    </StockTemplate>
  );
}

export class InventoryOverviewPage extends BasePage {
  protected override options = {
    title: "Inventory - Overview | WorklyHub",
    requiresAuth: true,
  };

  protected override renderPage(): React.ReactNode {
    return <InventoryOverviewPageContent />;
  }
}

export default InventoryOverviewPage;
