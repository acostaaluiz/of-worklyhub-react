import type { HttpClient } from "@core/http/interfaces/http-client.interface";
import { SlasApi } from "./slas-api";

function createApi(response: DataValue) {
  const request = jest.fn().mockResolvedValue({ data: response });
  const http = { request } as unknown as HttpClient;
  const api = new SlasApi(http);
  return { api, request };
}

describe("SlasApi", () => {
  it("lists workspace slas with query normalization", async () => {
    const { api, request } = createApi({
      slas: [{ id: "sla-1", user_uid: "user-1" }],
    });

    const rows = await api.listWorkspaceSlas("ws-1", {
      userUid: "user-1",
      eventId: "event-1",
      from: "2026-03-01",
      to: "2026-03-31",
    });

    expect(rows.slas).toHaveLength(1);
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "GET",
        url: "/company/internal/workspaces/ws-1/slas",
        query: {
          userUid: "user-1",
          eventId: "event-1",
          from: "2026-03-01",
          to: "2026-03-31",
        },
      })
    );
  });
});

