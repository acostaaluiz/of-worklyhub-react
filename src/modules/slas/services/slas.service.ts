import { toAppError } from "@core/errors/to-app-error";
import { httpClient } from "@core/http/client.instance";
import type { SlaApiItem, SlaQuery, SlaRecord, SlaSummary } from "@modules/slas/interfaces/sla.model";
import { SlasApi } from "@modules/slas/services/slas-api";

const toTwoDecimals = (value: number): number => Math.round(value * 100) / 100;

export class SlasService {
  private api = new SlasApi(httpClient);

  async list(workspaceId: string, query?: SlaQuery): Promise<SlaRecord[]> {
    try {
      const res = await this.api.listWorkspaceSlas(workspaceId, query);
      const items = res.slas ?? [];
      return items.map(mapFromApi);
    } catch (err) {
      throw toAppError(err);
    }
  }

  async getSummary(workspaceId: string, query?: SlaQuery): Promise<SlaSummary[]> {
    try {
      const items = await this.list(workspaceId, query);
      return aggregateSlas(items);
    } catch (err) {
      throw toAppError(err);
    }
  }
}

function mapFromApi(item: SlaApiItem): SlaRecord {
  return {
    id: item.id,
    workspaceId: item.workspace_id,
    userUid: item.user_uid,
    eventId: item.event_id,
    workDate: item.work_date,
    durationMinutes: item.duration_minutes,
    createdAt: item.created_at,
  };
}

function aggregateSlas(items: SlaRecord[]): SlaSummary[] {
  const buckets = new Map<string, { userUid: string; workDate: string; totalMinutes: number }>();

  for (const item of items) {
    const key = `${item.userUid}::${item.workDate}`;
    const current = buckets.get(key) ?? {
      userUid: item.userUid,
      workDate: item.workDate,
      totalMinutes: 0,
    };
    current.totalMinutes += item.durationMinutes;
    buckets.set(key, current);
  }

  return Array.from(buckets.values())
    .map((row) => ({
      ...row,
      totalHours: toTwoDecimals(row.totalMinutes / 60),
    }))
    .sort((a, b) => {
      if (a.workDate === b.workDate) return a.userUid.localeCompare(b.userUid);
      return a.workDate < b.workDate ? 1 : -1;
    });
}

export default SlasService;
