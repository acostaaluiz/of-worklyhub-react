import type { HttpClient } from "@core/http/interfaces/http-client.interface";
import { UsersOverviewApi } from "./overview-api";

function createApi(response: DataValue) {
  const request = jest.fn().mockResolvedValue({ data: response });
  const http = { request } as unknown as HttpClient;
  const api = new UsersOverviewApi(http);
  return { api, request };
}

describe("UsersOverviewApi", () => {
  it("loads overview from me/overview endpoint", async () => {
    const payload = {
      profile: { email: "owner@worklyhub.com", name: "Owner" },
      modules: [{ uid: "work-order", name: "Work order" }],
    };
    const { api, request } = createApi(payload);

    const result = await api.getOverview();

    expect(result.profile.email).toBe("owner@worklyhub.com");
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "GET",
        url: "me/overview",
      })
    );
  });
});

