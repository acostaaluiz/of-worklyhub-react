import React, { useEffect, useMemo, useState } from "react";
import { Button, Modal, InputNumber, message } from "antd";
import StockTemplate from "@modules/inventory/presentation/templates/stock/stock.template";
import ProductListComponent from "@modules/inventory/presentation/components/product-list/product-list.component";
import ProductFormComponent from "@modules/inventory/presentation/components/product-form/product-form.component";
import { InventoryService } from "@modules/inventory/services/inventory.service";
import type { ProductModel } from "@modules/inventory/interfaces/product.model";
import type { CategoryModel } from "@modules/inventory/interfaces/category.model";
import type { InventoryFilterState } from "@modules/inventory/presentation/components/inventory-filter/inventory-filter.component";
import { BasePage } from "@shared/base/base.page";

function InventoryHomePageContent(): JSX.Element {
  const service = useMemo(() => new InventoryService(), []);
  const [products, setProducts] = useState<ProductModel[]>([]);
  const [categories, setCategories] = useState<CategoryModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ProductModel | null>(null);
  const [filter, setFilter] = useState<InventoryFilterState>({ q: "", stockStatus: "all" });

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
  }, [service]);

  async function handleCreate(data: Omit<ProductModel, "id" | "createdAt">) {
    setLoading(true);
    try {
      await service.createProduct(data);
      setShowForm(false);
      const res = await service.listProducts();
      setProducts(res);
      message.success("Produto criado");
    } catch (e) {
      message.error("Falha ao criar produto");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(id: string, patch: Partial<ProductModel>) {
    setLoading(true);
    try {
      await service.updateProduct(id, patch);
      setEditing(null);
      const res = await service.listProducts();
      setProducts(res);
      message.success("Produto atualizado");
    } catch (e) {
      message.error("Falha ao atualizar produto");
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setShowForm(true);
  }

  function openEdit(p: ProductModel) {
    setEditing(p);
    setShowForm(true);
  }

  function openEntry(p: ProductModel) {
    Modal.confirm({
      title: `Entrada de estoque: ${p.name}`,
      content: (
        <div>
          <p>Quantidade</p>
          <InputNumber id="__inv_entry_qty" min={1} defaultValue={1} />
        </div>
      ),
      onOk: async () => {
        const el = document.getElementById("__inv_entry_qty") as HTMLInputElement | null;
        const val = (el && Number((el as any).value)) || 0;
        if (val <= 0) return Promise.reject();
        await service.changeStock(p.id, val, "IN");
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
          <InputNumber id="__inv_exit_qty" min={1} defaultValue={1} />
        </div>
      ),
      onOk: async () => {
        const el = document.getElementById("__inv_exit_qty") as HTMLInputElement | null;
        const val = (el && Number((el as any).value)) || 0;
        if (val <= 0) return Promise.reject();
        await service.changeStock(p.id, val, "OUT");
        const res = await service.listProducts();
        setProducts(res);
        message.success("Saída registrada");
      },
    });
  }

  const filtered = products.filter((p) => {
    const q = (filter.q ?? "").toLowerCase();
    if (q) {
      if (!p.name.toLowerCase().includes(q) && !(p.sku ?? "").toLowerCase().includes(q) && !(p.barcode ?? "").toLowerCase().includes(q)) return false;
    }
    if (filter.categoryId) {
      if (p.categoryId !== filter.categoryId) return false;
    }
    if (filter.stockStatus === "in" && p.stock <= 0) return false;
    if (filter.stockStatus === "out" && p.stock > 0) return false;
    if (typeof filter.minStock === "number" && p.stock < (filter.minStock ?? 0)) return false;
    return true;
  });

  return (
    <StockTemplate showFilter filterValue={filter} onFilterChange={setFilter} categories={categories}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <div />
        <div>
          <Button type="primary" onClick={openCreate} style={{ marginRight: 8 }}>
            Novo produto
          </Button>
        </div>
      </div>

      <ProductListComponent products={filtered} categories={categories} onEdit={openEdit} onEntry={openEntry} onExit={openExit} />

      <Modal title={editing ? "Editar produto" : "Criar produto"} open={showForm} footer={null} onCancel={() => setShowForm(false)}>
        <ProductFormComponent initial={editing ?? undefined} onSubmit={(d) => (editing ? handleUpdate(editing.id, d as any) : handleCreate(d))} submitting={loading} />
      </Modal>
    </StockTemplate>
  );
}

export class InventoryHomePage extends BasePage {
  protected override options = {
    title: "Inventory | WorklyHub",
    requiresAuth: true,
  };

  protected override renderPage(): React.ReactNode {
    return <InventoryHomePageContent />;
  }
}

export default InventoryHomePage;
