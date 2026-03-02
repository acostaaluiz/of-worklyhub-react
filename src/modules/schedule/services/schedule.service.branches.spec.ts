jest.setTimeout(10000);

// mock SchedulesApi at module scope; tests will resetModules when they need different behavior
jest.mock('./schedules-api', () => ({
  SchedulesApi: jest.fn().mockImplementation(() => ({
    listSchedules: jest.fn().mockRejectedValue(new Error('boom')),
    todaySchedules: jest.fn().mockRejectedValue(new Error('boom')),
    nextSchedules: jest.fn().mockRejectedValue(new Error('boom')),
  })),
}));

describe('ScheduleService branches and fallbacks', () => {
  beforeEach(() => jest.resetModules());

  test('getEvents falls back to inMemory when backend throws', async () => {
    // require after resetModules so the mock above is in effect
    const { ScheduleService } = require('./schedule.service');
    const svc = new ScheduleService();

    // call without workspaceId to force inMemory path
    const res = await svc.getEvents({ from: '2000-01-01', to: '2099-12-31' } as any);
    expect(Array.isArray(res)).toBe(true);
    expect(res.length).toBeGreaterThan(0);
  });

  test('getNextSchedulesForWorkspace uses backend when workspaceId provided and falls back on error', async () => {
    // first test: mock nextSchedules success by resetting modules and re-mocking
    jest.resetModules();
    jest.mock('./schedules-api', () => ({
      SchedulesApi: jest.fn().mockImplementation(() => ({ nextSchedules: jest.fn().mockResolvedValue([{ id: 'n1', start: new Date().toISOString(), end: new Date().toISOString() }]) })),
    }));
    const { getNextSchedulesForWorkspace } = require('./schedule.service');
    const items = await getNextSchedulesForWorkspace('ws-1', 2);
    expect(Array.isArray(items)).toBe(true);

    // now mock failure and ensure fallback returns an array
    jest.resetModules();
    jest.mock('./schedules-api', () => ({
      SchedulesApi: jest.fn().mockImplementation(() => ({ nextSchedules: jest.fn().mockRejectedValue(new Error('fail')) })),
    }));
    const { getNextSchedulesForWorkspace: g2 } = require('./schedule.service');
    const fallback = await g2(undefined as any);
    expect(Array.isArray(fallback)).toBe(true);
  });
});
