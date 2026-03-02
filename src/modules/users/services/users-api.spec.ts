import { UsersApi } from './users-api';

describe('UsersApi', () => {
  test('getByEmail calls get with query param', async () => {
    const mockReq = jest.fn().mockResolvedValue({ data: { name: 'u', email: 'a@b.com' } });
    const http = { request: mockReq } as any;

    const api = new UsersApi(http);
    const res = await api.getByEmail('a@b.com');

    expect(res.email).toBe('a@b.com');
    expect(mockReq).toHaveBeenCalled();
    const callArg = mockReq.mock.calls[0][0];
    expect(callArg.method).toBe('GET');
    expect(callArg.url).toBe('users/internal/users');
    expect(callArg.query.email).toBe('a@b.com');
  });

  test('setPlan posts body to plan endpoint', async () => {
    const mockReq = jest.fn().mockResolvedValue({ data: undefined });
    const http = { request: mockReq } as any;

    const api = new UsersApi(http);
    await api.setPlan('a@b.com', 2);

    expect(mockReq).toHaveBeenCalled();
    const callArg = mockReq.mock.calls[0][0];
    expect(callArg.method).toBe('POST');
    expect(callArg.url).toBe('users/internal/users/plan');
    expect(callArg.body).toEqual({ email: 'a@b.com', planId: 2 });
  });

  test('updateProfile sends put and returns user', async () => {
    const user = { user: { name: 'N', email: 'n@d.com' } };
    const mockReq = jest.fn().mockResolvedValue({ data: user });
    const http = { request: mockReq } as any;
    const api = new UsersApi(http);
    const res = await api.updateProfile({ fullName: 'N', email: 'n@d.com' });
    expect(res.user.email).toBe('n@d.com');
    const call = mockReq.mock.calls[0][0];
    expect(call.method).toBe('PUT');
  });

  test('requestProfilePhotoSignature calls post and returns signature', async () => {
    const sig = { url: 'u', path: '/p', expiresAt: 't', maxSize: 100 };
    const mockReq = jest.fn().mockResolvedValue({ data: sig });
    const http = { request: mockReq } as any;
    const api = new UsersApi(http);
    const out = await api.requestProfilePhotoSignature({ contentType: 'i' });
    expect(out.path).toBe('/p');
  });
});
