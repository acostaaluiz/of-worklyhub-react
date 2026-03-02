import WorkOrderApi from '@modules/work-order/services/work-order-api';
import { WorkOrderHttpService } from './work-order.http.service';

jest.mock('@modules/work-order/services/work-order-api', () => {
  function WorkOrderApiMock(this: any) {
    this.getStatuses = jest.fn().mockResolvedValue([]);
    this.createWorkOrder = jest.fn().mockResolvedValue({ id: 'wo-1' });
    this.listWorkOrders = jest.fn().mockResolvedValue({ data: [{ id: 'wo-1' }] });
    this.listWorkOrdersPage = jest.fn();
    this.getWorkOrderById = jest.fn();
    this.deleteWorkOrder = jest.fn();
    this.getOverview = jest.fn().mockResolvedValue({ totals: {} });
    this.getHistory = jest.fn().mockResolvedValue([]);
    this.getComments = jest.fn().mockResolvedValue([]);
    this.getChecklist = jest.fn().mockResolvedValue([]);
    this.createComment = jest.fn();
    this.createChecklistItem = jest.fn();
    this.updateChecklistItem = jest.fn();
    this.deleteChecklistItem = jest.fn();
  }
  return WorkOrderApiMock;
});

describe('WorkOrderHttpService', () => {
  test('createWorkOrder throws when workspaceId missing', async () => {
    const svc = new WorkOrderHttpService();
    await expect(svc.createWorkOrder(undefined, { workspaceId: undefined } as any)).rejects.toThrow();
  });

  test('createWorkOrder resolves when workspaceId provided', async () => {
    const svc = new WorkOrderHttpService();
    const res = await svc.createWorkOrder('ws-1', { workspaceId: 'ws-1' } as any);
    expect(res).toEqual({ id: 'wo-1' });
  });

  test('listWorkOrders returns data from page', async () => {
    const svc = new WorkOrderHttpService();
    const list = await svc.listWorkOrders('ws-1');
    expect(Array.isArray(list)).toBe(true);
  });

  test('getOverview requires workspaceId', async () => {
    const svc = new WorkOrderHttpService();
    await expect(svc.getOverview(undefined)).rejects.toThrow();
  });

  test('other methods throw when workspaceId missing and call api when present', async () => {
    const svc = new WorkOrderHttpService();
    await expect(svc.listHistory(undefined, 'id')).rejects.toThrow();
    await expect(svc.listComments(undefined, 'id')).rejects.toThrow();
    await expect(svc.createComment(undefined, 'id', {} as any)).rejects.toThrow();
    await expect(svc.listChecklist(undefined, 'id')).rejects.toThrow();
    await expect(svc.createChecklistItem(undefined, 'id', {} as any)).rejects.toThrow();
    await expect(svc.updateChecklistItem(undefined, 'id', 'it', {} as any)).rejects.toThrow();
    await expect(svc.deleteChecklistItem(undefined, 'id', 'it')).rejects.toThrow();

    // when workspaceId present, api methods are called. We mock WorkOrderApi at module level in this file.
    const s = new WorkOrderHttpService();
    await expect(s.listHistory('ws', 'id')).resolves.toBeDefined();
    await expect(s.listComments('ws', 'id')).resolves.toBeDefined();
    await expect(s.createComment('ws', 'id', { body: 'x' } as any)).resolves.toBeUndefined();
    await expect(s.listChecklist('ws', 'id')).resolves.toBeDefined();
    await expect(s.createChecklistItem('ws', 'id', { title: 't' } as any)).resolves.toBeUndefined();
    await expect(s.updateChecklistItem('ws', 'id', 'it', { done: true } as any)).resolves.toBeUndefined();
    await expect(s.deleteChecklistItem('ws', 'id', 'it')).resolves.toBeUndefined();
  });
});
