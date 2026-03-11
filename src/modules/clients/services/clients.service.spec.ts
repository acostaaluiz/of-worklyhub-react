import { getAvailableServices } from "./clients.service";

describe("clients.service", () => {
  it("returns available services with core metadata", async () => {
    const rows = await getAvailableServices();

    expect(rows).toHaveLength(10);
    expect(rows.some((row) => row.featured)).toBe(true);
    expect(rows[0]).toMatchObject({
      id: "svc-01",
      title: "Mendes Barber",
      priceCents: 4500,
      priceFormatted: "R$ 45,00",
    });
  });
});

