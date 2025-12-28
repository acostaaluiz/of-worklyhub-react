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
      message.success("Categoria criada");
      load();
    } catch (e) {
      message.error("Erro ao criar categoria");
    }
  }

  async function handleDeactivate(c: CategoryModel) {
    try {
      await InventoryService.deactivateCategory(c.id);
      message.success("Categoria inativada");
      load();
    } catch (e) {
      message.error("Erro ao inativar categoria");
    }
  }

  async function _handleEditSubmit(payload: Omit<CategoryModel, "id" | "createdAt">) {
    if (!editing) return;
    try {
      await InventoryService.updateCategory(editing.id, payload);
      message.success("Categoria atualizada");
      setEditing(null);
      load();
    } catch (e) {
      message.error("Erro ao atualizar categoria");
    }
  }

  return (
    <Card bordered={false} loading={loading}>
      <h3>Categorias</h3>
      <CategoryFormComponent onSubmit={handleCreate} />
      <Divider />
      <CategoryListComponent categories={categories} onEdit={setEditing} onDeactivate={handleDeactivate} />
    </Card>
  );
}

export default CategoryManagerComponent;
