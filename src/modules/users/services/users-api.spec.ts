import type { HttpClient } from '@core/http/interfaces/http-client.interface';
import { UsersApi } from './users-api';

function createApi(response: DataValue) {
  const request = jest.fn().mockResolvedValue({ data: response });
  const http = { request } as unknown as HttpClient;
  const api = new UsersApi(http);

  return { api, request };
}

describe('UsersApi', () => {
  it('gets user profile by email', async () => {
    const { api, request } = createApi({ name: 'User', email: 'a@b.com' });

    const profile = await api.getByEmail('a@b.com');

    expect(profile.email).toBe('a@b.com');
    expect(request.mock.calls[0][0]).toMatchObject({
      method: 'GET',
      url: 'users/internal/users',
      query: { email: 'a@b.com' },
    });
  });

  it('updates user plan', async () => {
    const { api, request } = createApi(undefined);

    await expect(api.setPlan('a@b.com', 2)).resolves.toBeUndefined();
    expect(request.mock.calls[0][0]).toMatchObject({
      method: 'POST',
      url: 'users/internal/users/plan',
      body: { email: 'a@b.com', planId: 2 },
    });
  });

  it('updates user profile', async () => {
    const { api, request } = createApi({ user: { name: 'New', email: 'new@worklyhub.com' } });

    const updated = await api.updateProfile({
      fullName: 'New',
      email: 'new@worklyhub.com',
    });

    expect(updated.user.email).toBe('new@worklyhub.com');
    expect(request.mock.calls[0][0]).toMatchObject({
      method: 'PUT',
      url: 'users/internal/users/profile',
    });
  });

  it('requests profile photo upload signature', async () => {
    const signature = { url: 'https://upload', path: '/files/user.png', expiresAt: '2099', maxSize: 1000 };
    const { api, request } = createApi(signature);

    const response = await api.requestProfilePhotoSignature({
      contentType: 'image/png',
      filename: 'user.png',
    });

    expect(response.path).toBe('/files/user.png');
    expect(request.mock.calls[0][0]).toMatchObject({
      method: 'POST',
      url: 'users/internal/users/profile/photo/signature',
    });
  });
});
