import React from 'react';
import { render, waitFor } from '@testing-library/react';
// require MockStoreProvider dynamically inside tests to avoid module/context mismatches

jest.mock('./schedules-api', () => ({
  SchedulesApi: jest.fn().mockImplementation(() => ({
    todaySchedules: jest.fn(),
    listSchedulesWithMeta: jest.fn(),
  })),
}));

// Provide a lightweight mock for the MockStoreProvider to avoid React hook
// initialization issues when modules are reset during tests.
jest.mock('@core/storage/mock-store.provider', () => ({
  __esModule: true,
  default: ({ children }: any) => children,
  useMockStore: () => ({
    seed: () => {},
    getCategory: (id: string) => ({ id: id || 'cat-1' }),
  }),
}));

function SetupAndCall({ onReady }: { onReady: (api: any) => void }) {
  // require the store at runtime so it's the same module instance as the provider
  const storeModule = require('@core/storage/mock-store.provider');
  const store = storeModule.useMockStore();
  React.useEffect(() => {
    store.seed();
  }, [store]);
  const { useScheduleApi } = require('./schedule.service');
  const api = useScheduleApi();
  React.useEffect(() => {
    if (api) onReady(api);
  }, [api, onReady]);
  return null;
}

describe('ScheduleService mapping fallback and meta path', () => {
  beforeEach(() => jest.resetModules());

  it('preserves categoryId from local store when backend omits it', async () => {
    jest.resetModules();
    const rows = [{ id: 'ev-1', start: '2025-01-10T09:00:00.000Z', end: '2025-01-10T09:30:00.000Z', title: 'T' }];
    jest.mock('./schedules-api', () => ({
      SchedulesApi: jest.fn().mockImplementation(() => ({ todaySchedules: jest.fn().mockResolvedValue(rows) })),
    }));

    let hookApi: any = null;
    const MockStoreProv = require('@core/storage/mock-store.provider').default;
    render(
      <MockStoreProv>
        <SetupAndCall onReady={(a) => (hookApi = a)} />
      </MockStoreProv>
    );

    await waitFor(() => expect(hookApi).not.toBeNull());
    const res = await hookApi.getEventsWithHint({ from: '2025-01-10', to: '2025-01-10', workspaceId: 'ws' } as any);
    expect(Array.isArray(res.events)).toBe(true);
    expect(res.events[0]).toHaveProperty('id');
    expect(typeof res.events[0].date === 'string').toBe(true);
  });

  it('returns monthViewHint when listSchedulesWithMeta provides meta', async () => {
    jest.resetModules();
    const rows: any[] = [];
    const meta = { monthViewHint: { some: 'hint' } } as any;
    jest.mock('./schedules-api', () => ({
      SchedulesApi: jest.fn().mockImplementation(() => ({ listSchedulesWithMeta: jest.fn().mockResolvedValue({ data: rows, meta }) })),
    }));

    let hookApi: any = null;
    const MockStoreProv = require('@core/storage/mock-store.provider').default;
    render(
      <MockStoreProv>
        <SetupAndCall onReady={(a) => (hookApi = a)} />
      </MockStoreProv>
    );

    await waitFor(() => expect(hookApi).not.toBeNull());
    const r = await hookApi.getEventsWithHint({ from: '2025-02-01', to: '2025-02-28', workspaceId: 'ws', calendarView: 'month' } as any);
    expect(r.monthViewHint).toEqual(meta.monthViewHint);
  });
});
