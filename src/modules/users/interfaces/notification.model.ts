export type NotificationPriority = "high" | "medium" | "low";
export type NotificationSourceModule = "schedule" | "work-order" | "inventory" | "finance" | "system";

export type UserNotificationModel = {
  id: string;
  workspaceId: string;
  userUid: string;
  sourceKey: string;
  sourceModule: NotificationSourceModule;
  sourceRecordId?: string | null;
  typeCode: string;
  priority: NotificationPriority;
  title: string;
  message: string;
  actionPath?: string | null;
  payload: DataMap;
  isRead: boolean;
  readAt?: string | null;
  isActive: boolean;
  generatedAt: string;
  createdAt: string;
  updatedAt: string;
};

export type NotificationSummaryModel = {
  unreadCount: number;
  highPriorityUnreadCount: number;
  totalActive: number;
  lastGeneratedAt?: string | null;
};

export type NotificationsPageModel = {
  limit: number;
  offset: number;
  total: number;
  hasMore: boolean;
  nextOffset?: number | null;
};

export type NotificationsListModel = {
  workspaceId: string;
  summary: NotificationSummaryModel;
  page: NotificationsPageModel;
  items: UserNotificationModel[];
};

export type NotificationsSummaryResponseModel = {
  workspaceId: string;
  summary: NotificationSummaryModel;
};
