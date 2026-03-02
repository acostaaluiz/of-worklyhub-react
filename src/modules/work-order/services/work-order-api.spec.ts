import { WorkOrderApi } from './work-order-api';

function makeHttp(mockImpl: any = {}) {
  const req = jest.fn();
  if (mockImpl.mockResolvedValue) req.mockResolvedValue(mockImpl.mockResolvedValue);
  if (mockImpl.impl) req.mockImplementation(mockImpl.impl);
  return { request: req } as any;
}

describe('WorkOrderApi', () => {
  test('buildHeaders includes workspace id when provided', async () => {
    const http = makeHttp({ mockResolvedValue: { data: { data: [] } } });
    const api = new WorkOrderApi(http);
    await api.getStatuses('ws-1');
    const call = (http.request as jest.Mock).mock.calls[0][0];
    expect(call.headers['x-workspace-id']).toBe('ws-1');
  });

  test('listWorkOrders handles array payload and computes pagination', async () => {
    const items = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
    const http = makeHttp({ mockResolvedValue: { data: items } });
    const api = new WorkOrderApi(http);
    const res = await api.listWorkOrders(undefined, { limit: 2 });
    expect(Array.isArray(res.data)).toBe(true);
    expect(res.pagination.limit).toBe(2);
    expect(res.pagination.offset).toBe(0);
    expect(res.pagination.nextOffset === null || typeof res.pagination.nextOffset === 'number').toBe(true);
  });

  test('listWorkOrders handles paged response with meta', async () => {
    const payload = { data: [{ id: 'x' }], pagination: { limit: 1, offset: 0, total: 10, hasMore: true, nextOffset: 1 } };
    const http = makeHttp({ mockResolvedValue: { data: payload } });
    const api = new WorkOrderApi(http);
    const res = await api.listWorkOrders('ws', {});
    expect(res.data.length).toBe(1);
    expect(res.pagination.total).toBeDefined();
    expect(res.pagination.hasMore).toBe(true);
  });

  test('getOverview returns data when present', async () => {
    const overview = { totals: { open: 1 } } as any;
    const http = makeHttp({ mockResolvedValue: { data: { data: overview } } });
    const api = new WorkOrderApi(http);
    const res = await api.getOverview('ws');
    expect(res.totals.open).toBe(1);
  });

  test('getWorkOrderById returns work order data', async () => {
    const wo = { id: 'wo' } as any;
    const http = makeHttp({ mockResolvedValue: { data: { data: wo } } });
    const api = new WorkOrderApi(http);
    const out = await api.getWorkOrderById('ws', 'wo');
    expect(out.id).toBe('wo');
  });

  test('updateWorkOrder and deleteWorkOrder call http methods', async () => {
    const http = makeHttp({ mockResolvedValue: { data: { data: { id: 'u' } } } });
    const api = new WorkOrderApi(http);
    const u = await api.updateWorkOrder('ws', 'id', { title: 'x' } as any);
    expect(u.id).toBe('u');
    await expect(api.deleteWorkOrder('ws', 'id')).resolves.toBeUndefined();
  });

  test('history/comments/checklist and checklist item operations', async () => {
    const http = makeHttp({ mockResolvedValue: { data: { data: [{ id: 'h' }] } } });
    const api = new WorkOrderApi(http);
    const h = await api.getHistory('ws', 'id');
    expect(Array.isArray(h)).toBe(true);
    const c = await api.getComments('ws', 'id');
    expect(Array.isArray(c)).toBe(true);
    const cl = await api.getChecklist('ws', 'id');
    expect(Array.isArray(cl)).toBe(true);

    const httpCreateComment = makeHttp({ mockResolvedValue: { data: { data: { id: 'cm' } } } });
    const apiCreate = new WorkOrderApi(httpCreateComment);
    const comment = await apiCreate.createComment('ws', 'id', { body: 'x' } as any);
    expect(comment.id).toBe('cm');

    const httpChecklist = makeHttp({ mockResolvedValue: { data: { data: { id: 'ci' } } } });
    const apiChecklist = new WorkOrderApi(httpChecklist);
    const item = await apiChecklist.createChecklistItem('ws', 'id', { title: 't' } as any);
    expect(item.id).toBe('ci');

    const httpUpdateChecklist = makeHttp({ mockResolvedValue: { data: { data: { id: 'ui' } } } });
    const apiUpdate = new WorkOrderApi(httpUpdateChecklist);
    const ui = await apiUpdate.updateChecklistItem('ws', 'id', 'it', { done: true } as any);
    expect(ui.id).toBe('ui');

    const httpDel = makeHttp({ mockResolvedValue: { data: undefined } });
    const apiDel = new WorkOrderApi(httpDel);
    await apiDel.deleteChecklistItem('ws', 'id', 'it');
    expect((httpDel.request as jest.Mock).mock.calls[0][0].method).toBe('DELETE');
  });
});
