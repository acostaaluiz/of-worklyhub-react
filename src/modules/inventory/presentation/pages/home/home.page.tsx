import React, { useEffect, useMemo, useState } from "react";
import { Button, Modal, InputNumber, message } from "antd";
import StockTemplate from "@modules/inventory/presentation/templates/stock/stock.template";
import ProductListComponent from "@modules/inventory/presentation/components/product-list/product-list.component";
import ProductModal from "@modules/inventory/presentation/components/product-modal/product-modal.component";
import { InventoryService } from "@modules/inventory/services/inventory.service";
import { companyService } from "@modules/company/services/company.service";
import { listInventoryItems, createInventoryItem, updateInventoryItem } from "@modules/inventory/services/inventory.http.service";
import type { ProductModel } from "@modules/inventory/interfaces/product.model";
import type { CategoryModel } from "@modules/inventory/interfaces/category.model";
import type { InventoryFilterState } from "@modules/inventory/presentation/components/inventory-filter/inventory-filter.component";
import { BasePage } from "@shared/base/base.page";

function InventoryHomePageContent(): React.ReactElement {
  const service = useMemo(() => new InventoryService(), []);
  const [products, setProducts] = useState<ProductModel[]>([]);
  const [categories, setCategories] = useState<CategoryModel[]>([]);
  const [_loading, setLoading] = useState(false);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [productModalInitial, setProductModalInitial] = useState<Partial<ProductModel> | null>(null);
  const [filter, setFilter] = useState<InventoryFilterState>({ q: "", stockStatus: "all" });

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const ws = companyService.getWorkspaceValue() as { workspaceId?: string; id?: string } | null;
        const workspaceId = (ws?.workspaceId ?? ws?.id) as string | undefined;

        if (workspaceId) {
          // load from backend when workspace available
          const rows = await listInventoryItems(workspaceId);
          // map InventoryItem -> ProductModel shape used by UI
          const mapped = rows.map((r) => ({
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
          // categories kept from mock service for now
          const cats = await service.listCategories();
          setCategories(cats.filter((c) => c.active));
        } else {
          const res = await service.listProducts();
          setProducts(res);
          const cats = await service.listCategories();
          setCategories(cats.filter((c) => c.active));
        }
      } catch (e) {
        message.error("Error loading products");
      } finally {
        setLoading(false);
      }
    })();
  }, [service, setLoading]);

  // create/update handled by ProductModal; keep page logic minimal

  function openCreate() {
    setProductModalInitial(null);
    setProductModalOpen(true);
  }

  function openEdit(p: ProductModel) {
    setProductModalInitial(p);
    setProductModalOpen(true);
  }

  function openEntry(p: ProductModel) {
    Modal.confirm({
      title: `Stock entry: ${p.name}`,
      content: React.createElement(
        "div",
        null,
        React.createElement("p", null, "Quantity"),
        React.createElement(InputNumber, { id: "__inv_entry_qty", min: 1, defaultValue: 1 })
      ),
      onOk: async () => {
        const el = document.getElementById("__inv_entry_qty") as HTMLInputElement | null;
        const val = (el && Number((el as any).value)) || 0;
        if (val <= 0) return Promise.reject();
        const ws = companyService.getWorkspaceValue() as { workspaceId?: string; id?: string } | null;
        const workspaceId = (ws?.workspaceId ?? ws?.id) as string | undefined;
        if (workspaceId) {
          // fetch current item to compute new quantity
          const rows = await listInventoryItems(workspaceId);
          const found = rows.find((r) => r.id === p.id);
          const newQty = (found?.quantity ?? 0) + val;
          await updateInventoryItem(p.id, { quantity: newQty, workspaceId } as any);
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
          message.success("Entry recorded");
        } else {
          await service.changeStock(p.id, val, "IN");
          const res = await service.listProducts();
          setProducts(res);
          message.success("Entry recorded");
        }
      },
    });
  }

  function openExit(p: ProductModel) {
    Modal.confirm({
      title: `Stock exit: ${p.name}`,
      content: React.createElement(
        "div",
        null,
        React.createElement("p", null, "Quantity"),
        React.createElement(InputNumber, { id: "__inv_exit_qty", min: 1, defaultValue: 1 })
      ),
      onOk: async () => {
        const el = document.getElementById("__inv_exit_qty") as HTMLInputElement | null;
        const val = (el && Number((el as any).value)) || 0;
        if (val <= 0) return Promise.reject();
        const ws = companyService.getWorkspaceValue() as { workspaceId?: string; id?: string } | null;
        const workspaceId = (ws?.workspaceId ?? ws?.id) as string | undefined;
        if (workspaceId) {
          const rows = await listInventoryItems(workspaceId);
          const found = rows.find((r) => r.id === p.id);
          const newQty = Math.max(0, (found?.quantity ?? 0) - val);
          await updateInventoryItem(p.id, { quantity: newQty, workspaceId } as any);
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
          message.success("Exit recorded");
        } else {
          await service.changeStock(p.id, val, "OUT");
          const res = await service.listProducts();
          setProducts(res);
          message.success("Exit recorded");
        }
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

  return React.createElement(
    StockTemplate,
    { showFilter: true, filterValue: filter, onFilterChange: setFilter, categories: categories },
    React.createElement(
      "div",
      { style: { display: "flex", justifyContent: "space-between", marginBottom: 16 } },
      React.createElement("div", null),
      React.createElement(
        "div",
        null,
        React.createElement(
          Button,
          { type: "primary", onClick: openCreate, style: { marginRight: 8 } },
          "New product"
        )
      )
    ),

    React.createElement(ProductListComponent, { products: filtered, categories: categories, onEdit: openEdit, onEntry: openEntry, onExit: openExit }),

    React.createElement(ProductModal, {
      open: productModalOpen,
      initial: productModalInitial ?? undefined,
      workspaceId: (companyService.getWorkspaceValue() as any)?.workspaceId ?? (companyService.getWorkspaceValue() as any)?.id,
      categories: categories,
      onClose: () => setProductModalOpen(false),
      onSaved: async (payload: any, id?: string) => {
        const ws = companyService.getWorkspaceValue() as { workspaceId?: string; id?: string } | null;
        const workspaceId = (ws?.workspaceId ?? ws?.id) as string | undefined;
        setLoading(true);
        try {
          if (workspaceId) {
            if (id) {
              await updateInventoryItem(id, { ...payload, workspaceId });
              message.success("Item updated successfully");
            } else {
              await createInventoryItem({ ...payload, workspaceId } as any);
              message.success("Item created successfully");
            }

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
            if (id) {
              await service.updateProduct(id, payload);
              message.success("Item updated successfully");
            } else {
              await service.createProduct(payload);
              message.success("Item created successfully");
            }
            const res = await service.listProducts();
            setProducts(res);
          }
          setProductModalOpen(false);
        } finally {
          setLoading(false);
        }
      },
    })
  );
}

export class InventoryHomePage extends BasePage {
  protected override options = {
    title: "Inventory | WorklyHub",
    requiresAuth: true,
  };

  protected override renderPage(): React.ReactNode {
    return React.createElement(InventoryHomePageContent);
  }
}

export default InventoryHomePage;
