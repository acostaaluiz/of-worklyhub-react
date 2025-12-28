import { toAppError } from "@core/errors/to-app-error";
import type { ProductModel, InventoryTransactionModel } from "@modules/inventory/interfaces/product.model";
import type { CategoryModel, CategoryCreatePayload } from "@modules/inventory/interfaces/category.model";

function nowIso() {
  return new Date().toISOString();
}

function makeId(prefix = "id") {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;
}

export class InventoryService {
  // mock stores
  private products: ProductModel[] = [
    { id: makeId("p"), name: "Camiseta básica", sku: "TSH-001", barcode: "1234567890123", unit: "un", categoryId: undefined, costCents: 1500, priceCents: 2990, minStock: 5, location: "A1", active: true, stock: 120, createdAt: nowIso() },
    { id: makeId("p"), name: "Caneca personalizada", sku: "MUG-01", barcode: "9876543210987", unit: "un", categoryId: undefined, costCents: 800, priceCents: 1590, minStock: 2, location: "B2", active: true, stock: 42, createdAt: nowIso() },
  ];

  private transactions: InventoryTransactionModel[] = [];
  private categories: CategoryModel[] = [
    { id: makeId("c"), name: "Produtos", description: "Categoria padrão", active: true, createdAt: nowIso() },
  ];

  async listProducts(): Promise<ProductModel[]> {
    try {
      await new Promise((r) => setTimeout(r, 80));
      return this.products.slice();
    } catch (err) {
      throw toAppError(err);
    }
  }

  async createProduct(payload: Omit<ProductModel, "id" | "createdAt">): Promise<ProductModel> {
    try {
      await new Promise((r) => setTimeout(r, 80));
      const p: ProductModel = { ...payload, id: makeId("p"), createdAt: nowIso() } as ProductModel;
      this.products.unshift(p);
      return p;
    } catch (err) {
      throw toAppError(err);
    }
  }

  async listCategories(): Promise<CategoryModel[]> {
    try {
      await new Promise((r) => setTimeout(r, 60));
      return this.categories.slice();
    } catch (err) {
      throw toAppError(err);
    }
  }

  async createCategory(payload: CategoryCreatePayload): Promise<CategoryModel> {
    try {
      await new Promise((r) => setTimeout(r, 60));
      const c: CategoryModel = { ...payload, id: makeId("c"), createdAt: nowIso() } as CategoryModel;
      this.categories.unshift(c);
      return c;
    } catch (err) {
      throw toAppError(err);
    }
  }

  async updateCategory(id: string, patch: Partial<CategoryModel>): Promise<CategoryModel> {
    try {
      await new Promise((r) => setTimeout(r, 60));
      const idx = this.categories.findIndex((x) => x.id === id);
      if (idx === -1) throw new Error("Category not found");
      this.categories[idx] = { ...this.categories[idx], ...patch };
      return this.categories[idx];
    } catch (err) {
      throw toAppError(err);
    }
  }

  async deactivateCategory(id: string): Promise<void> {
    try {
      await new Promise((r) => setTimeout(r, 60));
      const c = this.categories.find((x) => x.id === id);
      if (!c) throw new Error("Category not found");
      c.active = false;
    } catch (err) {
      throw toAppError(err);
    }
  }

  async updateProduct(id: string, patch: Partial<ProductModel>): Promise<ProductModel> {
    try {
      await new Promise((r) => setTimeout(r, 80));
      const idx = this.products.findIndex((x) => x.id === id);
      if (idx === -1) throw new Error("Product not found");
      this.products[idx] = { ...this.products[idx], ...patch };
      return this.products[idx];
    } catch (err) {
      throw toAppError(err);
    }
  }

  async changeStock(productId: string, quantity: number, type: InventoryTransactionModel["type"], note?: string): Promise<InventoryTransactionModel> {
    try {
      await new Promise((r) => setTimeout(r, 80));
      const p = this.products.find((x) => x.id === productId);
      if (!p) throw new Error("Product not found");
      if (type === "OUT" && p.stock - quantity < 0) throw new Error("Insufficient stock");
      p.stock = p.stock + (type === "IN" ? quantity : -quantity);
      const tx: InventoryTransactionModel = { id: makeId("tx"), productId, type, quantity, date: nowIso(), note };
      this.transactions.unshift(tx);
      return tx;
    } catch (err) {
      throw toAppError(err);
    }
  }

  async listTransactions(productId?: string): Promise<InventoryTransactionModel[]> {
    try {
      await new Promise((r) => setTimeout(r, 80));
      return productId ? this.transactions.filter((t) => t.productId === productId) : this.transactions.slice();
    } catch (err) {
      throw toAppError(err);
    }
  }
}

export default InventoryService;
