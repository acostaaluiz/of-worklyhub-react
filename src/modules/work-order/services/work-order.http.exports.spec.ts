import * as mod from './work-order.http.service';

describe('work-order exported wrappers', () => {
  beforeEach(() => jest.clearAllMocks());

  test('listWorkOrderStatuses delegates to workOrderHttpService.listStatuses', async () => {
    jest.spyOn(mod.workOrderHttpService, 'listStatuses').mockResolvedValue([{ id: 's' } as any]);
    const out = await mod.listWorkOrderStatuses('ws');
    expect(out[0].id).toBe('s');
  });

  test('createWorkOrder delegates and exposes error when missing workspace', async () => {
    jest.spyOn(mod.workOrderHttpService, 'createWorkOrder').mockResolvedValue({ id: 'w' } as any);
    const out = await mod.createWorkOrder('ws', { workspaceId: 'ws' } as any);
    expect(out.id).toBe('w');
  });

  test('listWorkOrdersPage and getWorkOrderById delegate', async () => {
    jest.spyOn(mod.workOrderHttpService, 'listWorkOrdersPage').mockResolvedValue({ data: [] } as any);
    jest.spyOn(mod.workOrderHttpService, 'getWorkOrderById').mockResolvedValue({ id: 'x' } as any);
    const page = await mod.listWorkOrdersPage('ws');
    expect(page.data).toBeDefined();
    const wo = await mod.getWorkOrderById('ws', 'x');
    expect(wo.id).toBe('x');
  });
});
