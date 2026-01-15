import React from "react";
import { InventoryService } from "@modules/inventory/services/inventory.service";
import type { CategoryModel } from "@modules/inventory/interfaces/category.model";
import CategoryListComponent from "../category-list/category-list.component";
import CategoryFormComponent from "../category-form/category-form.component";
import { Card, Divider, message } from "antd";

export function CategoryManagerComponent() {
  const [categories, setCategories] = React.useState<CategoryModel[]>([]);
  const [editing, setEditing] = React.useState<CategoryModel | null>(null);
  const [loading, setLoading] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await InventoryService.listCategories();
      setCategories(res);
    } catch (err) {
      // swallow
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  async function handleCreate(payload: Omit<CategoryModel, "id" | "createdAt">) {
      try {
        await InventoryService.createCategory(payload);
        message.success("Category created");
        load();
      } catch (e) {
        message.error("Failed to create category");
      }
  }

  async function handleDeactivate(c: CategoryModel) {
    try {
      await InventoryService.deactivateCategory(c.id);
      message.success("Category deactivated");
      load();
    } catch (e) {
      message.error("Failed to deactivate category");
    }
  }

  async function _handleEditSubmit(payload: Omit<CategoryModel, "id" | "createdAt">) {
    if (!editing) return;
    try {
      await InventoryService.updateCategory(editing.id, payload);
      message.success("Category updated");
      setEditing(null);
      load();
    } catch (e) {
      message.error("Failed to update category");
    }
  }

  return (
    <Card bordered={false} loading={loading}>
      <h3>Categories</h3>
      <CategoryFormComponent onSubmit={handleCreate} />
      <Divider />
      <CategoryListComponent categories={categories} onEdit={setEditing} onDeactivate={handleDeactivate} />
    </Card>
  );
}

export default CategoryManagerComponent;
