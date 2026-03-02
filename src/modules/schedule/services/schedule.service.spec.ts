import { ScheduleService, getNextSchedulesForWorkspace, categoriesSeed } from './schedule.service';
import { SchedulesApi } from './schedules-api';

jest.mock('./schedules-api', () => ({
  SchedulesApi: jest.fn().mockImplementation(() => ({
    nextSchedules: jest.fn(),
    todaySchedules: jest.fn(),
    listSchedules: jest.fn(),
    getStatuses: jest.fn(),
  })),
}));

describe('ScheduleService', () => {
  test('getCategories returns seeded categories', async () => {
    const s = new ScheduleService();
    const cats = await s.getCategories();
    expect(cats).toEqual(expect.arrayContaining(categoriesSeed));
  });

  test('createEvent and removeEvent modify inMemory store', async () => {
    const s = new ScheduleService();
    const payload = { title: 'x', date: '2099-01-01', startTime: '10:00', endTime: '11:00', categoryId: 'work' };
    const created = await s.createEvent(payload as any);
    expect(created.id).toBeDefined();
    const removed = await s.removeEvent(created.id);
    expect(removed).toBe(true);
  });

  test('getNextSchedulesForWorkspace falls back to in-memory when api fails', async () => {
    (SchedulesApi as unknown as jest.Mock).mockImplementation(() => ({ nextSchedules: jest.fn().mockRejectedValue(new Error('fail')) }));
    const items = await getNextSchedulesForWorkspace(undefined);
    // when workspaceId not provided and fallback runs, returns array
    expect(Array.isArray(items)).toBe(true);
  });
});
