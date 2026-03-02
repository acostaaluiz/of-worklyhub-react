import { AuthApi } from './auth-api';

describe('AuthApi', () => {
  test('verifyToken sends Authorization header when token provided', async () => {
    const mockReq = jest.fn().mockResolvedValue({ data: { uid: 'u1', claims: {} } });
    const http = { request: mockReq } as any;

    const api = new AuthApi(http);
    const res = await api.verifyToken('tok-1');

    expect(res.uid).toBe('u1');
    expect(mockReq).toHaveBeenCalled();
    const callArg = mockReq.mock.calls[0][0];
    expect(callArg.method).toBe('POST');
    expect(callArg.url).toBe('internal/auth/verify-token');
    expect(callArg.headers.Authorization).toBe('Bearer tok-1');
  });

  test('register posts payload and returns data', async () => {
    const payload = { name: 'x', email: 'a@b.com', password: 'p' };
    const mockReq = jest.fn().mockResolvedValue({ data: { ok: true } });
    const http = { request: mockReq } as any;

    const api = new AuthApi(http);
    const res = await api.register(payload as any);

    expect(res).toEqual({ ok: true });
    const callArg = mockReq.mock.calls[0][0];
    expect(callArg.method).toBe('POST');
    expect(callArg.url).toBe('internal/auth/register');
    expect(callArg.body).toEqual(payload);
  });
});
