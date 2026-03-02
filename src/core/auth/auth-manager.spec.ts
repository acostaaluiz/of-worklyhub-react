import { AuthManager } from './auth-manager';

describe('AuthManager', () => {
  test('set/get tokens and signOut', () => {
    const mgr = new AuthManager();
    expect(mgr.getAccessToken()).toBeNull();
    mgr.setTokens('a', 'r');
    expect(mgr.getAccessToken()).toBe('a');
    expect(mgr.getRefreshToken()).toBe('r');
    mgr.signOut();
    expect(mgr.getAccessToken()).toBeNull();
    expect(mgr.getRefreshToken()).toBeNull();
  });

  test('refresh uses handler and updates tokens', async () => {
    let calledWith: any = null;
    const handler = jest.fn().mockImplementation(async (refreshToken) => {
      calledWith = refreshToken;
      return { accessToken: 'newA', refreshToken: 'newR' };
    });

    const mgr = new AuthManager({ refreshHandler: handler });
    mgr.setTokens('oldA', 'oldR');
    const res = await mgr.refresh();
    expect(res).toBe('newA');
    expect(calledWith).toBe('oldR');
    expect(mgr.getAccessToken()).toBe('newA');
    expect(mgr.getRefreshToken()).toBe('newR');
  });

  test('refresh returns null without handler or invalid result', async () => {
    const mgr = new AuthManager();
    mgr.setTokens('a', 'b');
    const r = await mgr.refresh();
    expect(r).toBeNull();

    const mgr2 = new AuthManager({ refreshHandler: jest.fn().mockResolvedValue({}) as any });
    mgr2.setTokens('a', 'b');
    const r2 = await mgr2.refresh();
    expect(r2).toBeNull();
  });
});
import { AuthManager } from '@core/auth/auth-manager';

describe('AuthManager', () => {
  test('set and get tokens', () => {
    const m = new AuthManager();
    expect(m.getAccessToken()).toBeNull();
    expect(m.getRefreshToken()).toBeNull();

    m.setTokens('a', 'r');
    expect(m.getAccessToken()).toBe('a');
    expect(m.getRefreshToken()).toBe('r');

    m.setTokens(null, null);
    expect(m.getAccessToken()).toBeNull();
  });

  test('refresh uses handler and updates tokens', async () => {
    const handler = jest.fn().mockResolvedValue({ accessToken: 'newA', refreshToken: 'newR' });
    const m = new AuthManager({ refreshHandler: handler });
    m.setTokens('oldA', 'oldR');

    const token = await m.refresh();
    expect(token).toBe('newA');
    expect(m.getAccessToken()).toBe('newA');
    expect(m.getRefreshToken()).toBe('newR');
    expect(handler).toHaveBeenCalledWith('oldR');
  });

  test('signOut clears tokens', () => {
    const m = new AuthManager();
    m.setTokens('a', 'b');
    m.signOut();
    expect(m.getAccessToken()).toBeNull();
    expect(m.getRefreshToken()).toBeNull();
  });
});
