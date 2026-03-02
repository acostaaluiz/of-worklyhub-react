export default class WorkOrderApi {
  constructor(client: any) {
    this.client = client;
  }

  async getStatuses() {
    return [];
  }

  async createStatus(_workspaceId: string | undefined, payload: any) {
    return { id: 's1', label: payload.label ?? 'status', code: payload.code ?? 'code' };
  }

  async listWorkOrders(_workspaceId: string | undefined, _filters: any) {
    return { data: [], total: 0 };
  }

  async getWorkOrderById(_workspaceId: string | undefined, _id: string) {
    return { id: _id };
  }

  async createWorkOrder(_workspaceId: string | undefined, payload: any) {
    return { ...payload, id: 'wo_1' };
  }

  async updateWorkOrder(_workspaceId: string | undefined, _id: string, payload: any) {
    return { ...payload, id: _id };
  }

  async deleteWorkOrder(_workspaceId: string | undefined, _id: string) {
    return;
  }

  async getOverview(_workspaceId: string | undefined, _options: any) {
    return {
      generatedAt: new Date().toISOString(),
      totals: { active: 0, terminal: 0, overdue: 0, dueSoon: 0, highPriorityOpen: 0, unscheduled: 0, checklistAtRisk: 0 },
      insights: [],
      performance: { completionRate: 0, avgResolutionHours: 0 },
    };
  }
}
