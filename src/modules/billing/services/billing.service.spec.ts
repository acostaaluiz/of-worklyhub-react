jest.mock("./billing-api", () => ({
  BillingApi: jest.fn(),
}));

jest.mock("@modules/company/services/company.service", () => ({
  companyService: {
    getWorkspaceValue: jest.fn(),
  },
}));

import { BillingApi } from "./billing-api";
import { BillingService } from "./billing.service";
import { companyService } from "@modules/company/services/company.service";

type BillingApiMock = {
  getPlans: jest.Mock;
  createCheckout: jest.Mock;
};

function createApiMock(): BillingApiMock {
  return {
    getPlans: jest.fn().mockResolvedValue({
      data: {
        plans: [{ id: "standard", dbId: 1, name: "Standard" }],
        payment: { gateway: "mercadopago", configured: true, supportedMethods: ["card", "hosted"] },
      },
    }),
    createCheckout: jest.fn().mockResolvedValue({
      data: { id: "checkout-1", status: "pending", provider: "mercadopago" },
    }),
  };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe("BillingService", () => {
  const billingApiCtor = jest.mocked(BillingApi);
  const mockedCompanyService = jest.mocked(companyService);
  let apiMock: BillingApiMock;

  beforeEach(() => {
    jest.clearAllMocks();
    (globalThis as { __WORKLYHUB_RUNTIME_ENV__?: Record<string, string | undefined> }).__WORKLYHUB_RUNTIME_ENV__ = {};
    apiMock = createApiMock();
    billingApiCtor.mockImplementation(() => apiMock as unknown as BillingApi);
    mockedCompanyService.getWorkspaceValue.mockReturnValue({ workspaceId: "ws-1" } as never);
  });

  it("fetches plans and reuses cached value when force is false", async () => {
    const service = new BillingService();

    const first = await service.fetchPlans();
    const second = await service.fetchPlans();

    expect(first?.plans[0].id).toBe("standard");
    expect(second).toEqual(first);
    expect(apiMock.getPlans).toHaveBeenCalledTimes(1);
  });

  it("reuses in-flight fetch promise to avoid duplicate requests", async () => {
    const pending = deferred<{
      data: {
        plans: Array<{ id: string; dbId: number; name: string }>;
        payment: { gateway: "mercadopago"; configured: boolean };
      };
    }>();
    apiMock.getPlans.mockReturnValueOnce(pending.promise);
    const service = new BillingService();

    const first = service.fetchPlans(true);
    const second = service.fetchPlans(true);

    expect(apiMock.getPlans).toHaveBeenCalledTimes(1);

    pending.resolve({
      data: {
        plans: [{ id: "premium", dbId: 2, name: "Premium" }],
        payment: { gateway: "mercadopago", configured: false },
      },
    });

    await expect(first).resolves.toMatchObject({
      plans: [{ id: "premium" }],
    });
    await expect(second).resolves.toMatchObject({
      plans: [{ id: "premium" }],
    });
  });

  it("returns fallback payment config when plans payload is missing", async () => {
    apiMock.getPlans.mockResolvedValueOnce(undefined);
    (globalThis as { __WORKLYHUB_RUNTIME_ENV__?: Record<string, string | undefined> }).__WORKLYHUB_RUNTIME_ENV__ = {
      VITE_BILLING_ACTIVE_GATEWAY: "paypal",
    };
    const service = new BillingService();

    const result = await service.fetchPlans(true);

    expect(result).toEqual({
      plans: [],
      payment: {
        gateway: "paypal",
        configured: false,
        supportedMethods: ["hosted"],
      },
    });
  });

  it("creates checkout using defaults and resolved workspace", async () => {
    const service = new BillingService();

    await service.createCheckout({
      planId: "standard",
      payer: { email: "owner@worklyhub.com" },
    });

    expect(apiMock.createCheckout).toHaveBeenCalledWith(
      expect.objectContaining({
        planId: "standard",
        billingCycle: "monthly",
        paymentMethod: "hosted",
        workspaceId: "ws-1",
        gateway: "mercadopago",
      }),
      expect.objectContaining({
        "Content-Type": "application/json",
        "x-workspace-id": "ws-1",
      })
    );
  });

  it("applies gateway priority from payload over cached/env defaults", async () => {
    const service = new BillingService();
    await service.fetchPlans(true);

    await service.createCheckout({
      planId: "standard",
      gateway: "paypal",
      payer: { email: "owner@worklyhub.com" },
    });

    expect(apiMock.createCheckout).toHaveBeenCalledWith(
      expect.objectContaining({
        gateway: "paypal",
      }),
      expect.any(Object)
    );
  });

  it("creates checkout without workspace and wraps api failures into AppError", async () => {
    const service = new BillingService();

    mockedCompanyService.getWorkspaceValue.mockReturnValue(null as never);
    await service.createCheckout({
      planId: "standard",
      payer: { email: "owner@worklyhub.com" },
    });

    expect(apiMock.createCheckout).toHaveBeenCalledWith(
      expect.objectContaining({
        planId: "standard",
      }),
      expect.objectContaining({
        "Content-Type": "application/json",
      })
    );
    const callBody = apiMock.createCheckout.mock.calls[0]?.[0] as { workspaceId?: string } | undefined;
    expect(callBody?.workspaceId).toBeUndefined();

    mockedCompanyService.getWorkspaceValue.mockReturnValue({ workspaceId: "ws-1" } as never);
    apiMock.createCheckout.mockRejectedValueOnce(new Error("checkout-failure"));
    await expect(
      service.createCheckout({
        planId: "standard",
        payer: { email: "owner@worklyhub.com" },
      })
    ).rejects.toMatchObject({
      message: "checkout-failure",
      kind: "Unknown",
    });
  });
});
