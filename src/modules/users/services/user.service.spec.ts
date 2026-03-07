import { localStorageProvider } from '@core/storage/local-storage.provider';
import { UsersApi } from './users-api';
import { UsersService } from './user.service';

jest.mock('./users-api', () => ({
  UsersApi: jest.fn(),
}));

jest.mock('@core/storage/local-storage.provider', () => ({
  localStorageProvider: {
    get: jest.fn().mockReturnValue(null),
    set: jest.fn(),
    remove: jest.fn(),
  },
}));

type UsersApiMock = {
  getByEmail: jest.Mock;
  setPlan: jest.Mock;
  updateProfile: jest.Mock;
  requestProfilePhotoSignature: jest.Mock;
};

function createApiMock(): UsersApiMock {
  return {
    getByEmail: jest
      .fn()
      .mockResolvedValue({ name: 'User', email: 'u@d.com', planId: 1, phone: '123' }),
    setPlan: jest.fn().mockResolvedValue(undefined),
    updateProfile: jest.fn().mockResolvedValue({ user: { name: 'New', email: 'u@d.com' } }),
    requestProfilePhotoSignature: jest
      .fn()
      .mockResolvedValue({ url: 'https://upload.test/put', path: '/p', maxSize: 1024 * 1024 }),
  };
}

describe('UsersService', () => {
  const mockedStorage = jest.mocked(localStorageProvider);
  const usersApiCtor = jest.mocked(UsersApi);
  let apiMock: UsersApiMock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockedStorage.get.mockReturnValue(null);
    apiMock = createApiMock();
    usersApiCtor.mockImplementation(() => apiMock as unknown as UsersApi);
  });

  it('fetchByEmail updates cache and persists profile', async () => {
    const service = new UsersService();

    const profile = await service.fetchByEmail('u@d.com');

    expect(profile?.email).toBe('u@d.com');
    expect(service.getProfileValue()).toEqual(profile);
    expect(mockedStorage.set).toHaveBeenCalledWith(
      'user.profile',
      JSON.stringify(profile)
    );
  });

  it('setPlan updates cached profile when it exists', async () => {
    mockedStorage.get.mockReturnValue(
      JSON.stringify({ name: 'User', email: 'u@d.com', planId: 1 })
    );
    const service = new UsersService();

    await service.setPlan('u@d.com', 2);

    expect(apiMock.setPlan).toHaveBeenCalledWith('u@d.com', 2);
    expect(service.getProfileValue()?.planId).toBe(2);
    expect(mockedStorage.set).toHaveBeenCalled();
  });

  it('updateProfile merges profile values and persists cache', async () => {
    mockedStorage.get.mockReturnValue(
      JSON.stringify({ name: 'Old', email: 'u@d.com', planId: 1, photoUrl: '/old' })
    );
    const service = new UsersService();

    const updated = await service.updateProfile({
      fullName: 'Full Name',
      email: 'u@d.com',
      phone: '123',
    });

    expect(updated).toMatchObject({
      email: 'u@d.com',
      planId: 1,
      photoUrl: '/old',
    });
    expect(mockedStorage.set).toHaveBeenCalledWith(
      'user.profile',
      JSON.stringify(updated)
    );
  });

  it('clear removes persisted profile and resets state', () => {
    const service = new UsersService();

    service.clear();

    expect(mockedStorage.remove).toHaveBeenCalledWith('user.profile');
    expect(service.getProfileValue()).toBeNull();
  });

  it('uploadProfilePhoto uploads with xhr and updates photoUrl', async () => {
    mockedStorage.get.mockReturnValue(
      JSON.stringify({ name: 'User', email: 'u@d.com', planId: 1, photoUrl: '/old' })
    );

    class FakeXmlHttpRequest {
      upload: { onprogress: ((event: ProgressEvent<EventTarget>) => void) | null } = {
        onprogress: null,
      };
      status = 200;
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;

      open(): void {}
      setRequestHeader(): void {}

      send(_body: Document | XMLHttpRequestBodyInit | null): void {
        if (this.upload.onprogress) {
          this.upload.onprogress({
            lengthComputable: true,
            loaded: 50,
            total: 100,
          } as ProgressEvent<EventTarget>);
        }

        setTimeout(() => this.onload?.(), 0);
      }
    }

    const originalXMLHttpRequest = globalThis.XMLHttpRequest;
    globalThis.XMLHttpRequest = FakeXmlHttpRequest as unknown as typeof XMLHttpRequest;

    try {
      const service = new UsersService();
      const file = new File(['x'], 'photo.jpg', { type: 'image/jpeg' });

      const uploadedPath = await service.uploadProfilePhoto(file, (percent) => {
        expect(typeof percent).toBe('number');
      });

      expect(uploadedPath).toBe('/p');
      expect(mockedStorage.set).toHaveBeenCalled();
    } finally {
      globalThis.XMLHttpRequest = originalXMLHttpRequest;
    }
  });
});
