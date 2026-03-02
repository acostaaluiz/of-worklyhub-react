jest.mock('./users-api', () => ({
  UsersApi: jest.fn().mockImplementation(() => ({
    getByEmail: jest.fn().mockResolvedValue({ name: 'User', email: 'u@d.com', planId: 1, phone: '123' }),
    setPlan: jest.fn().mockResolvedValue(undefined),
    updateProfile: jest.fn().mockResolvedValue({ user: { name: 'New', email: 'u@d.com' } }),
    requestProfilePhotoSignature: jest.fn().mockResolvedValue({ url: 'u', path: '/p', maxSize: 100 }),
  })),
}));

jest.mock('@core/storage/local-storage.provider', () => ({
  localStorageProvider: {
    get: jest.fn().mockReturnValue(null),
    set: jest.fn(),
    remove: jest.fn(),
  },
}));

import { UsersService } from './user.service';
import { localStorageProvider } from '@core/storage/local-storage.provider';

describe('UsersService', () => {
  beforeEach(() => jest.clearAllMocks());

  test('fetchByEmail updates profile and persists', async () => {
    const svc = new UsersService();
    const res = await svc.fetchByEmail('u@d.com');
    expect(res.email).toBe('u@d.com');
    expect(svc.getProfileValue()).toEqual(res);
    expect(localStorageProvider.set).toHaveBeenCalled();
  });

  test('setPlan updates cached profile when present', async () => {
    const svc = new UsersService();
    // prime profile
    (svc as any).subject.next({ name: 'User', email: 'u@d.com', planId: 1 } as any);
    await svc.setPlan('u@d.com', 2);
    const v = svc.getProfileValue();
    expect(v?.planId).toBe(2);
    expect(localStorageProvider.set).toHaveBeenCalled();
  });

  test('updateProfile returns merged profile and persists', async () => {
    const svc = new UsersService();
    (svc as any).subject.next({ name: 'Old', email: 'u@d.com', planId: 1 } as any);
    const out = await svc.updateProfile({ fullName: 'Full', email: 'u@d.com', phone: '123' } as any);
    expect(out.email).toBe('u@d.com');
    expect(localStorageProvider.set).toHaveBeenCalled();
  });

  test('clear removes storage and resets subject', () => {
    const svc = new UsersService();
    svc.clear();
    expect(localStorageProvider.remove).toHaveBeenCalled();
    expect(svc.getProfileValue()).toBeNull();
  });

  test('uploadProfilePhoto uploads via XHR and updates profile', async () => {
    const signature = { url: 'https://upload.test/put', path: '/p', maxSize: 1024 * 1024 };
    // mock UsersApi inside UsersService
    const mockReq = jest.fn().mockResolvedValue(signature);
    jest.spyOn(require('./users-api'), 'UsersApi').mockImplementation(() => ({ requestProfilePhotoSignature: mockReq }));

    // fake XHR
    class FakeXhr {
      upload: any = {};
      status = 200;
      onload: () => void = () => {};
      onerror: () => void = () => {};
      open() {}
      setRequestHeader() {}
      send(file: any) {
        // simulate progress
        if (this.upload && typeof this.upload.onprogress === 'function') {
          this.upload.onprogress({ lengthComputable: true, loaded: 50, total: 100 });
        }
        // call onload async
        setTimeout(() => this.onload(), 0);
      }
    }

    // replace global XMLHttpRequest
    // @ts-ignore
    const orig = (global as any).XMLHttpRequest;
    // @ts-ignore
    (global as any).XMLHttpRequest = FakeXhr as any;

    const svc = new UsersService();
    // prime current profile
    (svc as any).subject.next({ name: 'User', email: 'u@d.com', planId: 1, photoUrl: '/old' } as any);

    const file = new File(['x'], 'photo.jpg', { type: 'image/jpeg' });
    const path = await svc.uploadProfilePhoto(file, (p) => {
      // progress callback invoked
      expect(typeof p).toBe('number');
    });

    expect(path).toBe('/p');
    expect(localStorageProvider.set).toHaveBeenCalled();

    // restore
    // @ts-ignore
    (global as any).XMLHttpRequest = orig;
  });
});
