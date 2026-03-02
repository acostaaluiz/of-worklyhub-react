import { BaseHttpService } from "@core/http/base-http.service";
import type { HttpClient } from "@core/http/interfaces/http-client.interface";
import type {
  NotificationsListModel,
  NotificationsSummaryResponseModel,
  UserNotificationModel,
} from "@modules/users/interfaces/notification.model";

type NotificationsQuery = {
  workspaceId?: string;
  limit?: number;
  offset?: number;
  unreadOnly?: boolean;
  includeInactive?: boolean;
};

type ToggleReadPayload = {
  read: boolean;
};

type ToggleReadResponse = {
  workspaceId: string;
  notification: UserNotificationModel;
};

type MarkAllReadResponse = {
  workspaceId: string;
  updatedCount: number;
};

type ArchiveResponse = {
  workspaceId: string;
  notification: UserNotificationModel;
};

export class UsersNotificationsApi extends BaseHttpService {
  constructor(http: HttpClient) {
    super(http, { correlationNamespace: "users-notifications-api" });
  }

  private buildHeaders(workspaceId?: string): Record<string, string> {
    const headers: Record<string, string> = {
      Accept: "application/json",
    };
    if (workspaceId) headers["x-workspace-id"] = workspaceId;
    return headers;
  }

  async list(query: NotificationsQuery): Promise<NotificationsListModel> {
    return this.get<NotificationsListModel>(
      "users/internal/users/notifications",
      {
        workspaceId: query.workspaceId,
        limit: query.limit,
        offset: query.offset,
        unreadOnly: query.unreadOnly ? "true" : undefined,
        includeInactive: query.includeInactive ? "true" : undefined,
      },
      this.buildHeaders(query.workspaceId)
    );
  }

  async getSummary(workspaceId?: string): Promise<NotificationsSummaryResponseModel> {
    return this.get<NotificationsSummaryResponseModel>(
      "users/internal/users/notifications/summary",
      workspaceId ? { workspaceId } : undefined,
      this.buildHeaders(workspaceId)
    );
  }

  async markRead(notificationId: string, payload: ToggleReadPayload, workspaceId?: string): Promise<ToggleReadResponse> {
    return this.patch<ToggleReadResponse, ToggleReadPayload>(
      `users/internal/users/notifications/${notificationId}/read`,
      payload,
      this.buildHeaders(workspaceId)
    );
  }

  async markAllRead(workspaceId?: string): Promise<MarkAllReadResponse> {
    return this.post<MarkAllReadResponse, Record<string, never>>(
      "users/internal/users/notifications/read-all",
      {},
      this.buildHeaders(workspaceId)
    );
  }

  async archive(notificationId: string, workspaceId?: string): Promise<ArchiveResponse> {
    return this.patch<ArchiveResponse, Record<string, never>>(
      `users/internal/users/notifications/${notificationId}/archive`,
      {},
      this.buildHeaders(workspaceId)
    );
  }
}

export default UsersNotificationsApi;
