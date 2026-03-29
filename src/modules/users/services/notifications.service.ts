import { BehaviorSubject } from "rxjs";

import { httpClient } from "@core/http/client.instance";
import { toAppError } from "@core/errors/to-app-error";
import { companyService } from "@modules/company/services/company.service";
import type {
  NotificationsListModel,
  NotificationSummaryModel,
  NotificationsSummaryResponseModel,
} from "@modules/users/interfaces/notification.model";
import { UsersNotificationsApi } from "@modules/users/services/notifications-api";

const EMPTY_SUMMARY: NotificationSummaryModel = {
  unreadCount: 0,
  highPriorityUnreadCount: 0,
  totalActive: 0,
  lastGeneratedAt: null,
};

function resolveWorkspaceId(explicitWorkspaceId?: string): string | undefined {
  if (explicitWorkspaceId?.trim()) return explicitWorkspaceId.trim();
  const current = companyService.getWorkspaceValue() as { workspaceId?: string; id?: string } | null;
  return (current?.workspaceId ?? current?.id ?? undefined) as string | undefined;
}

export class UsersNotificationsService {
  private readonly api = new UsersNotificationsApi(httpClient);
  private readonly summary$ = new BehaviorSubject<NotificationSummaryModel>(EMPTY_SUMMARY);
  private readonly pendingSummaryByWorkspace = new Map<
    string,
    Promise<NotificationsSummaryResponseModel>
  >();

  getSummary$() {
    return this.summary$.asObservable();
  }

  getSummaryValue(): NotificationSummaryModel {
    return this.summary$.getValue();
  }

  resetSummary(): void {
    this.summary$.next(EMPTY_SUMMARY);
    this.pendingSummaryByWorkspace.clear();
  }

  private publishSummary(summary?: NotificationSummaryModel | null): void {
    this.summary$.next(summary ?? EMPTY_SUMMARY);
  }

  async fetchSummary(opts?: { workspaceId?: string }): Promise<NotificationsSummaryResponseModel> {
    const workspaceId = resolveWorkspaceId(opts?.workspaceId);
    const key = workspaceId ?? "__default__";

    const inFlight = this.pendingSummaryByWorkspace.get(key);
    if (inFlight) return inFlight;

    const request = (async (): Promise<NotificationsSummaryResponseModel> => {
      try {
        const response = await this.api.getSummary(workspaceId);
        this.publishSummary(response.summary);
        return response;
      } catch (err) {
        throw toAppError(err);
      } finally {
        this.pendingSummaryByWorkspace.delete(key);
      }
    })();

    this.pendingSummaryByWorkspace.set(key, request);
    return request;
  }

  async list(opts?: {
    workspaceId?: string;
    limit?: number;
    offset?: number;
    unreadOnly?: boolean;
    includeInactive?: boolean;
  }): Promise<NotificationsListModel> {
    try {
      const workspaceId = resolveWorkspaceId(opts?.workspaceId);
      const response = await this.api.list({
        workspaceId,
        limit: opts?.limit,
        offset: opts?.offset,
        unreadOnly: opts?.unreadOnly,
        includeInactive: opts?.includeInactive,
      });
      this.publishSummary(response.summary);
      return response;
    } catch (err) {
      throw toAppError(err);
    }
  }

  async markRead(notificationId: string, read: boolean, opts?: { workspaceId?: string }) {
    try {
      const workspaceId = resolveWorkspaceId(opts?.workspaceId);
      const response = await this.api.markRead(notificationId, { read }, workspaceId);
      await this.fetchSummary({ workspaceId: response.workspaceId });
      return response.notification;
    } catch (err) {
      throw toAppError(err);
    }
  }

  async markAllRead(opts?: { workspaceId?: string }): Promise<number> {
    try {
      const workspaceId = resolveWorkspaceId(opts?.workspaceId);
      const response = await this.api.markAllRead(workspaceId);
      await this.fetchSummary({ workspaceId: response.workspaceId });
      return response.updatedCount;
    } catch (err) {
      throw toAppError(err);
    }
  }

  async archive(notificationId: string, opts?: { workspaceId?: string }) {
    try {
      const workspaceId = resolveWorkspaceId(opts?.workspaceId);
      const response = await this.api.archive(notificationId, workspaceId);
      await this.fetchSummary({ workspaceId: response.workspaceId });
      return response.notification;
    } catch (err) {
      throw toAppError(err);
    }
  }
}

export const usersNotificationsService = new UsersNotificationsService();

export default usersNotificationsService;
