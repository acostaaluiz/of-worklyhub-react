import React from 'react';
import { render, waitFor } from '@testing-library/react';
import MockStoreProvider from '@core/storage/mock-store.provider';
import { useScheduleApi } from './schedule.service';

jest.mock('./schedules-api', () => {
  return {
    SchedulesApi: jest.fn().mockImplementation(() => ({
      listSchedulesWithMeta: jest.fn().mockResolvedValue({ rows: [] }),
      todaySchedules: jest.fn().mockResolvedValue([]),
      createSchedule: jest.fn().mockResolvedValue({ id: 'new' }),
      updateSchedule: jest.fn().mockResolvedValue({ id: 'upd' }),
      removeSchedule: jest.fn().mockResolvedValue(true),
    })),
  };
});

function HookRenderer({ onReady }: { onReady: (api: any) => void }) {
  const api = useScheduleApi();
  React.useEffect(() => {
    if (api) onReady(api);
  }, [api, onReady]);
  return null;
}

describe('useScheduleApi (hook)', () => {
  it('exposes getEventsWithHint and CRUD methods', async () => {
    let hookApi: any = null;
    const handleReady = (api: any) => (hookApi = api);

    render(
      <MockStoreProvider>
        <HookRenderer onReady={handleReady} />
      </MockStoreProvider>
    );

    await waitFor(() => expect(hookApi).not.toBeNull());

    // getEvents should call into mocked todaySchedules when from===to
    const events = await hookApi.getEvents({ from: '2025-01-10', to: '2025-01-10', workspaceId: 'ws-1' } as any);
    expect(Array.isArray(events)).toBe(true);

    // createSchedule (provide event shape)
    const created = await hookApi.createSchedule({ event: { title: 'abc', date: '2025-01-10', startTime: '09:00', endTime: '09:30' }, workspaceId: 'ws-1' } as any);
    expect(created).toHaveProperty('id', 'new');

    // updateEvent (provide args)
    const updated = await hookApi.updateEvent({ id: '1', event: { title: 'x', date: '2025-01-10', startTime: '09:00', endTime: '09:30' }, workspaceId: 'ws-1' } as any);
    expect(updated).toHaveProperty('id', 'upd');

    // removeEvent
    const removed = await hookApi.removeEvent('1');
    expect(removed).toBe(true);
  });
});
