import React from "react";
import { message } from "antd";
import { i18n as appI18n } from "@core/i18n";

import { BasePage } from "@shared/base/base.page";
import type { NotificationSummaryModel, UserNotificationModel } from "@modules/users/interfaces/notification.model";
import NotificationsTemplate from "@modules/users/presentation/templates/notifications/notifications.template";
import { usersNotificationsService } from "@modules/users/services/notifications.service";

type FilterMode = "all" | "unread";

type State = {
  isLoading: boolean;
  initialized: boolean;
  error?: DataValue;
  summary: NotificationSummaryModel;
  notifications: UserNotificationModel[];
  filter: FilterMode;
  offset: number;
  hasMore: boolean;
  isLoadingMore: boolean;
  isRefreshing: boolean;
  isMarkingAll: boolean;
};

function dedupeById(items: UserNotificationModel[]): UserNotificationModel[] {
  const seen = new Set<string>();
  const output: UserNotificationModel[] = [];
  for (const item of items) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    output.push(item);
  }
  return output;
}

export class NotificationsPage extends BasePage<{}, State> {
  protected override options = { title: `${appI18n.t("users.pageTitles.notifications")} | WorklyHub`, requiresAuth: true };

  public state: State = {
    isLoading: false,
    initialized: false,
    error: undefined,
    summary: usersNotificationsService.getSummaryValue(),
    notifications: [],
    filter: "all",
    offset: 0,
    hasMore: false,
    isLoadingMore: false,
    isRefreshing: false,
    isMarkingAll: false,
  };

  protected override async onInit(): Promise<void> {
    await this.runAsync(async () => {
      await this.loadFirstPage();
    }, { swallowError: true });
  }

  private get unreadOnly(): boolean {
    return this.state.filter === "unread";
  }

  private async loadFirstPage(): Promise<void> {
    try {
      const response = await usersNotificationsService.list({
        limit: 18,
        offset: 0,
        unreadOnly: this.unreadOnly,
      });

      this.setSafeState({
        summary: response.summary,
        notifications: response.items,
        offset: response.page.nextOffset ?? response.items.length,
        hasMore: !!response.page.hasMore,
      });
    } catch (err) {
      message.error("Failed to load notifications");
      console.error("notifications.loadFirstPage", err);
      this.setSafeState({
        summary: usersNotificationsService.getSummaryValue(),
        notifications: [],
        offset: 0,
        hasMore: false,
      });
    }
  }

  private async loadMore(): Promise<void> {
    if (this.state.isLoadingMore || !this.state.hasMore) return;
    this.setSafeState({ isLoadingMore: true });
    try {
      const response = await usersNotificationsService.list({
        limit: 18,
        offset: this.state.offset,
        unreadOnly: this.unreadOnly,
      });

      this.setSafeState((prev) => ({
        summary: response.summary,
        notifications: dedupeById([...prev.notifications, ...response.items]),
        offset: response.page.nextOffset ?? prev.offset,
        hasMore: !!response.page.hasMore,
      }));
    } catch (err) {
      message.error("Failed to load more notifications");
      console.error("notifications.loadMore", err);
    } finally {
      this.setSafeState({ isLoadingMore: false });
    }
  }

  private async refreshFeed(): Promise<void> {
    this.setSafeState({ isRefreshing: true });
    try {
      await this.loadFirstPage();
    } catch (err) {
      message.error("Failed to refresh notifications");
      console.error("notifications.refresh", err);
    } finally {
      this.setSafeState({ isRefreshing: false });
    }
  }

  private async markAllRead(): Promise<void> {
    this.setSafeState({ isMarkingAll: true });
    try {
      await usersNotificationsService.markAllRead();
      this.setSafeState((prev) => ({
        summary: usersNotificationsService.getSummaryValue(),
        notifications: prev.notifications.map((item) =>
          item.isRead
            ? item
            : {
                ...item,
                isRead: true,
                readAt: new Date().toISOString(),
              }
        ),
      }));
      message.success("All notifications marked as read");
    } catch (err) {
      message.error("Failed to mark notifications as read");
      console.error("notifications.markAllRead", err);
    } finally {
      this.setSafeState({ isMarkingAll: false });
    }
  }

  private async toggleRead(notification: UserNotificationModel, read: boolean): Promise<void> {
    try {
      const updated = await usersNotificationsService.markRead(notification.id, read);
      this.setSafeState((prev) => ({
        summary: usersNotificationsService.getSummaryValue(),
        notifications: prev.notifications.map((item) => (item.id === updated.id ? updated : item)),
      }));
    } catch (err) {
      message.error("Failed to update notification status");
      console.error("notifications.toggleRead", err);
    }
  }

  private async archive(notification: UserNotificationModel): Promise<void> {
    try {
      await usersNotificationsService.archive(notification.id);
      this.setSafeState((prev) => ({
        summary: usersNotificationsService.getSummaryValue(),
        notifications: prev.notifications.filter((item) => item.id !== notification.id),
      }));
    } catch (err) {
      message.error("Failed to archive notification");
      console.error("notifications.archive", err);
    }
  }

  private async changeFilter(filter: FilterMode): Promise<void> {
    if (filter === this.state.filter) return;
    this.setSafeState({ filter });
    try {
      const response = await usersNotificationsService.list({
        limit: 18,
        offset: 0,
        unreadOnly: filter === "unread",
      });
      this.setSafeState({
        summary: response.summary,
        notifications: response.items,
        offset: response.page.nextOffset ?? response.items.length,
        hasMore: !!response.page.hasMore,
      });
    } catch (err) {
      message.error("Failed to change filter");
      console.error("notifications.filter", err);
    }
  }

  protected override renderPage(): React.ReactNode {
    return (
      <NotificationsTemplate
        summary={this.state.summary}
        items={this.state.notifications}
        filter={this.state.filter}
        hasMore={this.state.hasMore}
        isLoading={this.state.isLoading}
        isLoadingMore={this.state.isLoadingMore}
        isRefreshing={this.state.isRefreshing}
        isMarkingAll={this.state.isMarkingAll}
        onFilterChange={(next) => void this.changeFilter(next)}
        onRefresh={() => void this.refreshFeed()}
        onLoadMore={() => void this.loadMore()}
        onMarkAllRead={() => void this.markAllRead()}
        onToggleRead={(notification, read) => void this.toggleRead(notification, read)}
        onArchive={(notification) => void this.archive(notification)}
      />
    );
  }
}

export default NotificationsPage;
