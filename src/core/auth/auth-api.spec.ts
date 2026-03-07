/* eslint-disable @typescript-eslint/no-explicit-any */
import { AuthApi } from "./auth-api";

function createApi() {
  const request = jest.fn();
  const http = { request } as any;
  const api = new AuthApi(http);

  return { api, request };
}

describe("AuthApi", () => {
  it("sends Authorization header when token is provided", async () => {
    const { api, request } = createApi();
    request.mockResolvedValue({ data: { uid: "user-1", claims: {} } });

    const result = await api.verifyToken("token-123");

    expect(result.uid).toBe("user-1");
    expect(request).toHaveBeenCalledTimes(1);
    expect(request.mock.calls[0][0]).toMatchObject({
      method: "POST",
      url: "internal/auth/verify-token",
      headers: expect.objectContaining({
        Authorization: "Bearer token-123",
      }),
    });
  });

  it("does not send Authorization header when token is missing", async () => {
    const { api, request } = createApi();
    request.mockResolvedValue({ data: { uid: "user-1", claims: {} } });

    await api.verifyToken();

    expect(request).toHaveBeenCalledTimes(1);
    expect(request.mock.calls[0][0].headers.Authorization).toBeUndefined();
  });

  it("posts register payload and returns data", async () => {
    const { api, request } = createApi();
    const payload = { name: "Test", email: "test@worklyhub.com", password: "secret" };
    request.mockResolvedValue({ data: { ok: true } });

    const result = await api.register(payload);

    expect(result).toEqual({ ok: true });
    expect(request.mock.calls[0][0]).toMatchObject({
      method: "POST",
      url: "internal/auth/register",
      body: payload,
    });
  });
});


