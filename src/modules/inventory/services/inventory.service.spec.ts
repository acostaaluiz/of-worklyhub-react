import InventoryService from "./inventory.service";

describe("InventoryService", () => {
  it("lists and creates products", async () => {
    const service = new InventoryService();

    const initial = await service.listProducts();
    expect(initial.length).toBeGreaterThan(0);

    const created = await service.createProduct({
      name: "Dental kit",
      stock: 20,
      active: true,
    });

    expect(created.id).toContain("p-");
    const next = await service.listProducts();
    expect(next[0].id).toBe(created.id);
  });

  it("handles category CRUD and deactivation errors", async () => {
    const service = new InventoryService();

    const categories = await service.listCategories();
    expect(categories.length).toBeGreaterThan(0);

    const created = await service.createCategory({
      name: "Consumables",
      active: true,
    });
    expect(created.id).toContain("c-");

    const updated = await service.updateCategory(created.id, {
      description: "Updated description",
    });
    expect(updated.description).toBe("Updated description");

    await service.deactivateCategory(created.id);
    const afterDeactivate = await service.listCategories();
    const found = afterDeactivate.find((row) => row.id === created.id);
    expect(found?.active).toBe(false);

    await expect(service.updateCategory("missing-category", {})).rejects.toMatchObject({
      message: "Category not found",
      kind: "Unknown",
    });
    await expect(service.deactivateCategory("missing-category")).rejects.toMatchObject({
      message: "Category not found",
      kind: "Unknown",
    });
  });

  it("updates product and validates product-not-found path", async () => {
    const service = new InventoryService();
    const listed = await service.listProducts();

    const updated = await service.updateProduct(listed[0].id, { location: "Shelf B2" });
    expect(updated.location).toBe("Shelf B2");

    await expect(service.updateProduct("missing-product", { location: "X" })).rejects.toMatchObject({
      message: "Product not found",
      kind: "Unknown",
    });
  });

  it("changes stock and lists filtered transactions", async () => {
    const service = new InventoryService();
    const listed = await service.listProducts();
    const productId = listed[0].id;

    const inTx = await service.changeStock(productId, 5, "IN", "restock");
    const outTx = await service.changeStock(productId, 3, "OUT", "use");

    expect(inTx.type).toBe("IN");
    expect(outTx.type).toBe("OUT");

    const allTx = await service.listTransactions();
    const filteredTx = await service.listTransactions(productId);
    expect(allTx.length).toBeGreaterThanOrEqual(2);
    expect(filteredTx.every((row) => row.productId === productId)).toBe(true);
  });

  it("wraps insufficient stock and missing product errors", async () => {
    const service = new InventoryService();
    const listed = await service.listProducts();
    const productId = listed[0].id;

    await expect(service.changeStock("missing-product", 1, "OUT")).rejects.toMatchObject({
      message: "Product not found",
      kind: "Unknown",
    });

    await expect(service.changeStock(productId, 999999, "OUT")).rejects.toMatchObject({
      message: "Insufficient stock",
      kind: "Unknown",
    });
  });
});

