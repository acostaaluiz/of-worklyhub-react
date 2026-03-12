import React from "react";
import { BellRing, RefreshCcw } from "lucide-react";
import { Button, Spin } from "antd";
import { useNavigate } from "react-router-dom";

import { BaseTemplate } from "@shared/base/base.template";
import { formatAppDateTime } from "@core/utils/date-time";
import { toSafeAppPath } from "@core/navigation/safe-navigation";
import type { NotificationSummaryModel, UserNotificationModel } from "@modules/users/interfaces/notification.model";
import {
  ActionsGroup,
  Chip,
  ControlsRow,
  EmptyState,
  FeedBody,
  FeedFooter,
  FeedHeader,
  FeedHint,
  FeedTitle,
  FeedWrap,
  FilterButton,
  FiltersGroup,
  HeroCard,
  HeroHeader,
  HeroIcon,
  HeroStat,
  HeroStats,
  HeroSubtitle,
  HeroTitle,
  HeroTitleGroup,
  MetaChips,
  MetaTime,
  NotificationActions,
  NotificationCard,
  NotificationMessage,
  NotificationMeta,
  NotificationTitle,
  NotificationsShell,
  NotificationsTemplateRoot,
} from "./notifications.template.styles";

type NotificationFilter = "all" | "unread";

type Props = {
  summary: NotificationSummaryModel;
  items: UserNotificationModel[];
  filter: NotificationFilter;
  hasMore: boolean;
  isLoading?: boolean;
  isLoadingMore?: boolean;
  isRefreshing?: boolean;
  isMarkingAll?: boolean;
  onFilterChange: (filter: NotificationFilter) => void;
  onRefresh: () => void;
  onLoadMore: () => void;
  onMarkAllRead: () => void;
  onToggleRead: (notification: UserNotificationModel, read: boolean) => void;
  onArchive: (notification: UserNotificationModel) => void;
};

function toModuleLabel(source: UserNotificationModel["sourceModule"]): string {
  switch (source) {
    case "work-order":
      return "Work order";
    default:
      return source;
  }
}

function NotificationsContent({
  summary,
  items,
  filter,
  hasMore,
  isLoading,
  isLoadingMore,
  isRefreshing,
  isMarkingAll,
  onFilterChange,
  onRefresh,
  onLoadMore,
  onMarkAllRead,
  onToggleRead,
  onArchive,
}: Props) {
  const navigate = useNavigate();
  const feedBodyRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const container = feedBodyRef.current;
    if (!container) return;

    const onScroll = () => {
      if (!hasMore || isLoadingMore || isLoading) return;
      const threshold = 72;
      const reachedBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - threshold;
      if (reachedBottom) onLoadMore();
    };

    container.addEventListener("scroll", onScroll, { passive: true });
    return () => container.removeEventListener("scroll", onScroll);
  }, [hasMore, isLoading, isLoadingMore, onLoadMore]);

  const visibleItems = filter === "unread" ? items.filter((item) => !item.isRead) : items;

  return (
    <NotificationsShell>
      <HeroCard
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        <HeroHeader>
          <HeroTitleGroup>
            <HeroIcon>
              <BellRing size={20} />
            </HeroIcon>

            <div>
              <HeroTitle>Notification center</HeroTitle>
              <HeroSubtitle>
                Stay on top of operations, due work and critical inventory updates.
              </HeroSubtitle>
            </div>
          </HeroTitleGroup>

          <HeroStats>
            <HeroStat>{summary.unreadCount} unread</HeroStat>
            <HeroStat>{summary.highPriorityUnreadCount} high priority</HeroStat>
            <HeroStat>{summary.totalActive} active</HeroStat>
          </HeroStats>
        </HeroHeader>
      </HeroCard>

      <ControlsRow>
        <FiltersGroup>
          <FilterButton $active={filter === "all"} onClick={() => onFilterChange("all")}>
            All
          </FilterButton>
          <FilterButton $active={filter === "unread"} onClick={() => onFilterChange("unread")}>
            Unread
          </FilterButton>
        </FiltersGroup>

        <ActionsGroup>
          <Button onClick={onRefresh} loading={isRefreshing} icon={<RefreshCcw size={14} />}>
            Refresh
          </Button>
          <Button type="primary" onClick={onMarkAllRead} loading={isMarkingAll}>
            Mark all as read
          </Button>
        </ActionsGroup>
      </ControlsRow>

      <FeedWrap>
        <FeedHeader>
          <FeedTitle>Notifications feed</FeedTitle>
          <FeedHint>
            Last sync: {summary.lastGeneratedAt ? formatAppDateTime(summary.lastGeneratedAt, "--") : "--"}
          </FeedHint>
        </FeedHeader>

        <FeedBody ref={feedBodyRef}>
          {isLoading ? (
            <EmptyState>
              <Spin />
            </EmptyState>
          ) : visibleItems.length <= 0 ? (
            <EmptyState>
              {filter === "unread"
                ? "No unread notifications right now."
                : "No notifications generated yet for this workspace."}
            </EmptyState>
          ) : (
            visibleItems.map((item, index) => {
              const safeActionPath = toSafeAppPath(item.actionPath);
              return (
                <NotificationCard
                  key={item.id}
                  $read={item.isRead}
                  $priority={item.priority}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.18) }}
                >
                  <NotificationMeta>
                    <MetaChips>
                      <Chip $variant="module">{toModuleLabel(item.sourceModule)}</Chip>
                      <Chip $variant="priority" $priority={item.priority}>
                        {item.priority}
                      </Chip>
                      {item.isRead ? <Chip $variant="read">read</Chip> : null}
                    </MetaChips>

                    <MetaTime>{formatAppDateTime(item.generatedAt, "--")}</MetaTime>
                  </NotificationMeta>

                  <NotificationTitle>{item.title}</NotificationTitle>
                  <NotificationMessage>{item.message}</NotificationMessage>

                  <NotificationActions>
                    {safeActionPath ? (
                      <Button size="small" onClick={() => navigate(safeActionPath)}>
                        Open
                      </Button>
                    ) : null}
                    <Button
                      size="small"
                      onClick={() => onToggleRead(item, !item.isRead)}
                    >
                      {item.isRead ? "Mark unread" : "Mark read"}
                    </Button>
                    <Button size="small" danger onClick={() => onArchive(item)}>
                      Archive
                    </Button>
                  </NotificationActions>
                </NotificationCard>
              );
            })
          )}
        </FeedBody>

        <FeedFooter>
          {isLoadingMore ? "Loading more notifications..." : hasMore ? "Scroll down to load more." : "End of notifications."}
        </FeedFooter>
      </FeedWrap>
    </NotificationsShell>
  );
}

export function NotificationsTemplate(props: Props) {
  return (
    <BaseTemplate
      content={
        <NotificationsTemplateRoot>
          <NotificationsContent {...props} />
        </NotificationsTemplateRoot>
      }
    />
  );
}

export default NotificationsTemplate;
