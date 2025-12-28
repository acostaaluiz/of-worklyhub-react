export interface CategoryModel {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  createdAt: string;
}

export type CategoryCreatePayload = Omit<CategoryModel, "id" | "createdAt">;
