import { CompanyServicesService } from "./company-services.service";

describe("CompanyServicesService", () => {
  it("lists seeded services and can get by id", async () => {
    const service = new CompanyServicesService();

    const rows = await service.list();
    const found = await service.get(rows[0].id);
    const missing = await service.get("missing-id");

    expect(rows.length).toBeGreaterThan(0);
    expect(found?.id).toBe(rows[0].id);
    expect(missing).toBeNull();
  });

  it("creates, updates and deactivates service entries", async () => {
    const service = new CompanyServicesService();
    const created = await service.create({
      title: "Whitening",
      description: "Full whitening service",
      durationMinutes: 60,
      priceCents: 12000,
      active: true,
    });
    const updated = await service.update(created.id, {
      priceCents: 15000,
      tags: ["premium"],
    });
    await service.deactivate(created.id);
    const after = await service.get(created.id);

    expect(created.id).toContain("svc-");
    expect(updated.priceCents).toBe(15000);
    expect(after?.active).toBe(false);
  });

  it("wraps not-found flows in AppError", async () => {
    const service = new CompanyServicesService();

    await expect(service.update("missing-id", { title: "X" })).rejects.toMatchObject({
      message: "Service not found",
      kind: "Unknown",
    });
    await expect(service.deactivate("missing-id")).rejects.toMatchObject({
      message: "Service not found",
      kind: "Unknown",
    });
  });
});

