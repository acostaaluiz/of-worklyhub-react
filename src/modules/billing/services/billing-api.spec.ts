import type { HttpClient } from "@core/http/interfaces/http-client.interface";
import { BillingApi } from "./billing-api";

function createApi(response: DataValue) {
  const request = jest.fn().mockResolvedValue({ data: response });
  const http = { request } as unknown as HttpClient;
  const api = new BillingApi(http);
  return { api, request };
}

describe("BillingApi", () => {
  it("gets billing plans with custom headers", async () => {
    const { api, request } = createApi({
      data: {
        plans: [{ id: "standard", dbId: 1 }],
        payment: { gateway: "mercadopago", configured: true },
      },
    });

    const result = await api.getPlans({ "x-workspace-id": "ws-1" });

    expect(result.data.plans[0].id).toBe("standard");
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "GET",
        url: "/billing/plans",
        headers: { "x-workspace-id": "ws-1" },
      })
    );
  });

  it("creates checkout payload", async () => {
    const { api, request } = createApi({
      data: {
        id: "chk-1",
        status: "pending",
        provider: "paypal",
      },
    });

    const result = await api.createCheckout(
      {
        planId: "standard",
        billingCycle: "yearly",
        gateway: "paypal",
        payer: { email: "owner@worklyhub.com" },
      },
      { "x-user-uid": "user-1" }
    );

    expect(result.data.id).toBe("chk-1");
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "POST",
        url: "/billing/checkout",
        headers: { "x-user-uid": "user-1" },
        body: expect.objectContaining({
          planId: "standard",
          gateway: "paypal",
        }),
      })
    );
  });
});

