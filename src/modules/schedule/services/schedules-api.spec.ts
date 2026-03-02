import { SchedulesApi } from './schedules-api';

function makeHttp(returnValue: any) {
  return { request: jest.fn().mockResolvedValue({ data: returnValue }) } as any;
}

describe('SchedulesApi', () => {
  test('listSchedulesWithMeta maps query params correctly', async () => {
    const resp = { data: [{ id: '1' }], meta: { monthViewHint: null } };
    const http = makeHttp(resp);
    const api = new SchedulesApi(http);
    const out = await api.listSchedulesWithMeta('ws-1', { from: '2020-01-01', calendarView: 'month', monthCellVisibleLimit: 3 });
    expect(out.data.length).toBe(1);
    expect((http.request as jest.Mock).mock.calls[0][0].query.from).toBe('2020-01-01');
    expect((http.request as jest.Mock).mock.calls[0][0].query.monthCellVisibleLimit).toBe(3);
  });

  test('nextSchedules sends limit when provided', async () => {
    const resp = { data: [{ id: 'n' }] };
    const http = makeHttp(resp);
    const api = new SchedulesApi(http);
    const out = await api.nextSchedules('ws-2', 5);
    expect(out.length).toBe(1);
    expect((http.request as jest.Mock).mock.calls[0][0].query.limit).toBe(5);
  });

  test('getStatuses returns empty array when none', async () => {
    const http = makeHttp({ data: [] });
    const api = new SchedulesApi(http);
    const sts = await api.getStatuses();
    expect(Array.isArray(sts)).toBe(true);
  });

  test('create/update/delete/todaySchedules basic calls', async () => {
    const httpCreate = makeHttp({ data: { id: 'c' } });
    const apiCreate = new SchedulesApi(httpCreate);
    const c = await apiCreate.createSchedule({ start: 'a', end: 'b' } as any);
    expect((httpCreate.request as jest.Mock).mock.calls[0][0].method).toBe('POST');

    const httpUpd = makeHttp({ data: { id: 'u' } });
    const apiUpd = new SchedulesApi(httpUpd);
    const u = await apiUpd.updateSchedule('id', { title: 'x' } as any);
    expect((httpUpd.request as jest.Mock).mock.calls[0][0].method).toBe('PATCH');

    const httpDel = makeHttp(undefined);
    const apiDel = new SchedulesApi(httpDel);
    await apiDel.deleteSchedule('id');
    expect((httpDel.request as jest.Mock).mock.calls[0][0].method).toBe('DELETE');

    const httpToday = makeHttp({ data: [{ id: 't' }] });
    const apiToday = new SchedulesApi(httpToday);
    const t = await apiToday.todaySchedules('ws');
    expect(t.length).toBe(1);
  });
});
