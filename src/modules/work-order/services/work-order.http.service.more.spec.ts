describe('WorkOrderHttpService extra branches', () => {
  beforeEach(() => jest.resetModules());

  it('createWorkOrder and updateWorkOrder require workspaceId', async () => {
    jest.resetModules();
    // default mock: WorkOrderApi methods won't be called when workspaceId missing
    jest.mock('./work-order-api', () => ({ WorkOrderApi: jest.fn().mockImplementation(() => ({ createWorkOrder: jest.fn().mockResolvedValue({}), updateWorkOrder: jest.fn().mockResolvedValue({}) })) }));
    const { WorkOrderHttpService } = require('./work-order.http.service');
    const svc = new WorkOrderHttpService();

    await expect(svc.createWorkOrder(undefined, { title: 'x' } as any)).rejects.toBeDefined();
    await expect(svc.updateWorkOrder(undefined, 'id', { title: 'x' } as any)).rejects.toBeDefined();

    // when payload contains workspaceId it should proceed
    const created = await svc.createWorkOrder(undefined, { workspaceId: 'ws-1', title: 'ok' } as any);
    expect(created).toBeDefined();
  });

  it('getOverview throws when workspaceId missing', async () => {
    jest.resetModules();
    jest.mock('./work-order-api', () => ({ WorkOrderApi: jest.fn().mockImplementation(() => ({ getOverview: jest.fn().mockResolvedValue({}) })) }));
    const { WorkOrderHttpService } = require('./work-order.http.service');
    const svc = new WorkOrderHttpService();

    await expect(svc.getOverview(undefined, {} as any)).rejects.toBeDefined();
  });
});
