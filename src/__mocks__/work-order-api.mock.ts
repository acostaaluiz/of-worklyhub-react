type WorkOrderStatusPayload = { label?: string; code?: string };
type WorkOrderPayload = Record<string, unknown>;

export default class WorkOrderApi {
  private readonly client: unknown;

  constructor(client: unknown) {
    this.client = client;
  }

  async getStatuses() {
    return [];
  }

  async createStatus(_workspaceId: string | undefined, payload: WorkOrderStatusPayload) {
    return { id: 's1', label: payload.label ?? 'status', code: payload.code ?? 'code' };
  }

  async listWorkOrders(_workspaceId: string | undefined, _filters: Record<string, unknown>) {
    return { data: [], total: 0 };
  }

  async getWorkOrderById(_workspaceId: string | undefined, _id: string) {
    return { id: _id };
  }

  async createWorkOrder(_workspaceId: string | undefined, payload: WorkOrderPayload) {
    return { ...payload, id: 'wo_1' };
  }

  async updateWorkOrder(_workspaceId: string | undefined, _id: string, payload: WorkOrderPayload) {
    return { ...payload, id: _id };
  }

  async deleteWorkOrder(_workspaceId: string | undefined, _id: string) {
    return;
  }

  async getOverview(_workspaceId: string | undefined, _options: Record<string, unknown>) {
    return {
      generatedAt: new Date().toISOString(),
      totals: { active: 0, terminal: 0, overdue: 0, dueSoon: 0, highPriorityOpen: 0, unscheduled: 0, checklistAtRisk: 0 },
      insights: [],
      performance: { completionRate: 0, avgResolutionHours: 0 },
    };
  }
}
