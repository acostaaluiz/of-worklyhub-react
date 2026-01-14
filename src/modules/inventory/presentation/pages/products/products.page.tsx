import React, { useEffect, useMemo, useState } from "react";
import { Button, Modal, message } from "antd";
import StockTemplate from "@modules/inventory/presentation/templates/stock/stock.template";
import ProductListComponent from "@modules/inventory/presentation/components/product-list/product-list.component";
import ProductModal from "@modules/inventory/presentation/components/product-modal/product-modal.component";
import { companyService } from "@modules/company/services/company.service";
import { listInventoryItems } from "@modules/inventory/services/inventory.http.service";
import { InventoryService } from "@modules/inventory/services/inventory.service";
import type { ProductModel } from "@modules/inventory/interfaces/product.model";
import { BasePage } from "@shared/base/base.page";

function InventoryProductsPageContent(): JSX.Element {
  const service = useMemo(() => new InventoryService(), []);
  const [products, setProducts] = useState<ProductModel[]>([]);
  const [categories, setCategories] = useState<import("@modules/inventory/interfaces/category.model").CategoryModel[]>([]);
  const [/* loading, */ setLoading] = useState(false);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [productModalInitial, setProductModalInitial] = useState<Partial<ProductModel> | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await service.listProducts();
        setProducts(res);
        const cats = await service.listCategories();
        setCategories(cats.filter((c) => c.active));
      } catch (e) {
        message.error("Erro ao carregar produtos");
      } finally {
        setLoading(false);
      }
    })();
  }, [service, setLoading]);

  // create/update handled by ProductModal; keep page logic minimal

  function openCreate() {
    setEditing(null);
    setProductModalInitial(null);
    setProductModalOpen(true);
  }

  function openEdit(p: ProductModel) {
    setEditing(p);
    setProductModalInitial(p);
    setProductModalOpen(true);
  }

  function openEntry(p: ProductModel) {
    Modal.confirm({
      title: `Entrada de estoque: ${p.name}`,
      content: (
        <div>
          <p>Quantidade</p>
        </div>
      ),
      onOk: async () => {
        const qty = 1; // simplified quick-entry
        await service.changeStock(p.id, qty, "IN");
        const res = await service.listProducts();
        setProducts(res);
        message.success("Entrada registrada");
      },
    });
  }

  function openExit(p: ProductModel) {
    Modal.confirm({
      title: `Saída de estoque: ${p.name}`,
      content: (
        <div>
          <p>Quantidade</p>
        </div>
      ),
      onOk: async () => {
        const qty = 1;
        await service.changeStock(p.id, qty, "OUT");
        const res = await service.listProducts();
        setProducts(res);
        message.success("Saída registrada");
      },
    });
  }

  return (
    <StockTemplate>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <div />
        <div>
          <Button type="primary" onClick={openCreate} style={{ marginRight: 8 }}>
            Novo produto
          </Button>
        </div>
      </div>

      <ProductListComponent products={products} categories={categories} onEdit={openEdit} onEntry={openEntry} onExit={openExit} />

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

export class InventoryProductsPage extends BasePage {
  protected override options = {
    title: "Inventory - Products | WorklyHub",
    requiresAuth: true,
  };

  protected override renderPage(): React.ReactNode {
    return <InventoryProductsPageContent />;
  }
}

export default InventoryProductsPage;
