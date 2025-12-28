export interface ProductModel {
  id: string;
  name: string;
  sku?: string;
  description?: string;
  barcode?: string;
  sku?: string;
  unit?: string;
  categoryId?: string;
  costCents?: number;
  priceCents?: number;
  minStock?: number;
  location?: string;
  tags?: string[];
  active?: boolean;
  stock: number;
  createdAt: string;
}

export type InventoryTransactionType = "IN" | "OUT";

export interface InventoryTransactionModel {
  id: string;
  productId: string;
  type: InventoryTransactionType;
  quantity: number;
  date: string;
  note?: string;
}
