jest.mock('./schedules-api', () => ({
  SchedulesApi: jest.fn().mockImplementation(() => ({
    listSchedules: jest.fn(),
    todaySchedules: jest.fn(),
    getStatuses: jest.fn(),
  })),
}));

import { ScheduleService, getStatuses } from './schedule.service';
import { SchedulesApi } from './schedules-api';

describe('ScheduleService - backend mapping', () => {
  beforeEach(() => jest.clearAllMocks());

  test('getEvents maps backend start/end ISO into date and times', async () => {
    const rows = [
      { id: '1', start: '2025-01-10T09:00:00.000Z', end: '2025-01-10T10:00:00.000Z', title: 'X', category: { id: 'work' } },
    ];

    // reset modules so we can inject a mock implementation that will be used
    // when schedule.service constructs its internal SchedulesApi instance
    jest.resetModules();
    const mockedSched = require('./schedules-api').SchedulesApi as jest.Mock;
    mockedSched.mockImplementation(() => ({ todaySchedules: jest.fn().mockResolvedValue(rows) }));

    const { ScheduleService: Svc } = require('./schedule.service');
    const svc = new Svc();
    const res = await svc.getEvents({ from: '2025-01-10', to: '2025-01-10', categoryIds: ['work'], workspaceId: 'ws-1' } as any);
    expect(Array.isArray(res)).toBe(true);
    expect(res[0].date).toBe('2025-01-10');
    expect(res[0].startTime).toMatch(/09:00/);
  });

  test('getStatuses returns empty array when api throws', async () => {
    jest.resetModules();
    const mockedSched2 = require('./schedules-api').SchedulesApi as jest.Mock;
    mockedSched2.mockImplementation(() => ({ getStatuses: jest.fn().mockRejectedValue(new Error('fail')) }));
    const { getStatuses: gs } = require('./schedule.service');
    const s = await gs();
    expect(Array.isArray(s)).toBe(true);
  });
});
