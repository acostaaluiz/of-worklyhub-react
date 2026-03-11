import React from "react";
import { InventoryService } from "@modules/inventory/services/inventory.service";
import type { CategoryModel } from "@modules/inventory/interfaces/category.model";
import CategoryListComponent from "../category-list/category-list.component";
import CategoryFormComponent from "../category-form/category-form.component";
import { Card, Divider, message } from "antd";

export function CategoryManagerComponent() {
  const [categories, setCategories] = React.useState<CategoryModel[]>([]);
  const [, setEditing] = React.useState<CategoryModel | null>(null);
  const [loading, setLoading] = React.useState(false);
  const service = React.useMemo(() => new InventoryService(), []);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await service.listCategories();
      setCategories(res);
    } catch (err) {
      // swallow
    } finally {
      setLoading(false);
    }
  }, [service]);

  React.useEffect(() => {
    load();
  }, [load]);

  async function handleCreate(payload: Omit<CategoryModel, "id" | "createdAt">) {
      try {
        await service.createCategory(payload);
        message.success("Category created");
        load();
      } catch (e) {
        message.error("Failed to create category");
      }
  }

  async function handleDeactivate(c: CategoryModel) {
    try {
      await service.deactivateCategory(c.id);
      message.success("Category deactivated");
      load();
    } catch (e) {
      message.error("Failed to deactivate category");
    }
  }

  return (
    <Card bordered={false} loading={loading} data-cy="inventory-categories-manager-card">
      <h3 data-cy="inventory-categories-title">Categories</h3>
      <CategoryFormComponent onSubmit={handleCreate} />
      <Divider />
      <CategoryListComponent categories={categories} onEdit={setEditing} onDeactivate={handleDeactivate} />
    </Card>
  );
}

export default CategoryManagerComponent;
