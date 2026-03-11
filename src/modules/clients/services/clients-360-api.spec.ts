import type { HttpClient } from "@core/http/interfaces/http-client.interface";
import { Clients360Api } from "./clients-360-api";

function createApi(response: DataValue) {
  const request = jest.fn().mockResolvedValue({ data: response });
  const http = { request } as unknown as HttpClient;
  const api = new Clients360Api(http);
  return { api, request };
}

describe("Clients360Api", () => {
  it("returns direct backend bundle payload", async () => {
    const payload = {
      generatedAt: "2026-03-01T10:00:00.000Z",
      source: "backend",
      profiles: [{ id: "c-1", workspaceId: "ws-1", displayName: "John", totalAppointments: 1, totalWorkOrders: 0, totalFinanceEntries: 0, totalBilledCents: 0 }],
      timeline: [],
    };
    const { api, request } = createApi(payload);

    const bundle = await api.getBundle("ws-1", "  john  ");

    expect(bundle.source).toBe("backend");
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "GET",
        url: "/clients/internal/customer-360",
        query: { workspaceId: "ws-1", search: "john" },
        headers: {
          Accept: "application/json",
          "x-workspace-id": "ws-1",
        },
      })
    );
  });

  it("unwraps data wrapper payload and omits empty search query", async () => {
    const payload = {
      data: {
        generatedAt: "2026-03-01T10:00:00.000Z",
        source: "aggregated",
        profiles: [],
        timeline: [],
      },
    };
    const { api, request } = createApi(payload);

    const bundle = await api.getBundle("ws-2", "   ");

    expect(bundle.source).toBe("aggregated");
    expect(request.mock.calls[0][0].query).toEqual({ workspaceId: "ws-2" });
  });
});

