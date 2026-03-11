import type { HttpClient } from "@core/http/interfaces/http-client.interface";
import { InvoiceSettingsApi } from "./invoice-settings-api";

function createApi(response: DataValue) {
  const request = jest.fn().mockResolvedValue({ data: response });
  const http = { request } as unknown as HttpClient;
  const api = new InvoiceSettingsApi(http);
  return { api, request };
}

describe("InvoiceSettingsApi", () => {
  it("gets workspace invoice settings", async () => {
    const { api, request } = createApi({
      data: {
        workspaceId: "ws-1",
        settings: { enabled: true, modules: { "work-order": true } },
        source: "database",
      },
    });

    const response = await api.getWorkspaceInvoiceSettings("ws-1", {
      "x-workspace-id": "ws-1",
    });

    expect(response.data.workspaceId).toBe("ws-1");
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "GET",
        url: "/billing/nfe/workspace-settings",
        query: { workspaceId: "ws-1" },
      })
    );
  });

  it("upserts workspace invoice settings", async () => {
    const { api, request } = createApi({
      data: {
        workspaceId: "ws-1",
        settings: { enabled: false, modules: {} },
        source: "database",
      },
    });

    await api.upsertWorkspaceInvoiceSettings(
      {
        workspaceId: "ws-1",
        settings: {
          enabled: false,
          modules: {
            "work-order": true,
            schedule: true,
            finance: false,
            inventory: false,
            people: false,
            clients: false,
          },
        },
        updatedByUid: "user-1",
      },
      { "x-user-uid": "user-1" }
    );

    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "PUT",
        url: "/billing/nfe/workspace-settings",
        headers: { "x-user-uid": "user-1" },
      })
    );
  });

  it("gets and upserts service_sale nfe configuration", async () => {
    const getApi = createApi({
      data: {
        id: "cfg-1",
        workspaceId: "ws-1",
        configuration: { integration: { provider: "govbr", baseUrl: "", issuePath: "" }, issuer: { legalName: "", document: "" } },
      },
    });
    const putApi = createApi({
      data: {
        id: "cfg-1",
        workspaceId: "ws-1",
        configuration: { integration: { provider: "govbr", baseUrl: "", issuePath: "" }, issuer: { legalName: "", document: "" } },
      },
    });

    await getApi.api.getServiceSaleNfeConfiguration("ws-1", {
      "x-workspace-id": "ws-1",
    });
    await putApi.api.upsertServiceSaleNfeConfiguration(
      {
        workspaceId: "ws-1",
        configuration: {
          integration: { provider: "govbr", baseUrl: "https://gov", issuePath: "/issue" },
          issuer: { legalName: "Clinic", document: "123" },
        },
      },
      { "x-workspace-id": "ws-1" }
    );

    expect(getApi.request.mock.calls[0][0]).toMatchObject({
      method: "GET",
      url: "/billing/nfe/configurations/service_sale",
      query: { workspaceId: "ws-1" },
    });
    expect(putApi.request.mock.calls[0][0]).toMatchObject({
      method: "PUT",
      url: "/billing/nfe/configurations/service_sale",
    });
  });
});

