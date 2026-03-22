import React from "react";
import { Button, Empty, Input, Pagination, Space, Tag, Timeline, Typography } from "antd";
import { RefreshCw, Search, Users } from "lucide-react";
import { BaseTemplate } from "@shared/base/base.template";
import type {
  Client360Bundle,
  ClientTimelineItem,
} from "@modules/clients/interfaces/client-360.model";
import { formatMoneyFromCents } from "@core/utils/mask";
import { formatAppDateTime } from "@core/utils/date-time";
import {
  CardHeader,
  CardFooter,
  CardShell,
  CardSubtitle,
  CardTitle,
  ContentGrid,
  Customer360Root,
  HeroActions,
  HeroCard,
  HeroStats,
  HeroSubtitle,
  HeroTitle,
  HeroTitleWrap,
  HeroTop,
  ProfileItem,
  ProfileMeta,
  ProfileName,
  ProfilesScrollBody,
  ScrollBody,
  TimelineItemDescription,
  TimelineItemHeader,
  TimelineItemMeta,
  TimelineItemTitle,
} from "./customer-360.template.styles";

type Props = {
  bundle: Client360Bundle;
  search: string;
  loading?: boolean;
  selectedClientId?: string | null;
  onSearchChange: (value: string) => void;
  onSelectClient: (clientId: string) => void;
  onProfilesPageChange: (page: number, pageSize: number) => void;
  onTimelinePageChange: (page: number, pageSize: number) => void;
  onRefresh: () => void;
};

const moduleTagColor: Record<ClientTimelineItem["module"], string> = {
  clients: "purple",
  schedule: "blue",
  "work-order": "gold",
  finance: "green",
};

function moduleLabel(module: ClientTimelineItem["module"]): string {
  if (module === "work-order") return "Work order";
  return module[0].toUpperCase() + module.slice(1);
}

export function Customer360Template({
  bundle,
  search,
  loading,
  selectedClientId,
  onSearchChange,
  onSelectClient,
  onProfilesPageChange,
  onTimelinePageChange,
  onRefresh,
}: Props) {
  const selectedProfile = React.useMemo(
    () => bundle.profiles.find((profile) => profile.id === selectedClientId) ?? null,
    [bundle.profiles, selectedClientId]
  );

  const visibleTimeline = React.useMemo(
    () =>
      selectedClientId
        ? bundle.timeline.filter((item) => item.clientId === selectedClientId)
        : bundle.timeline,
    [bundle.timeline, selectedClientId]
  );

  const profilesMeta = bundle.pagination?.profiles;
  const timelineMeta = bundle.pagination?.timeline;
  const totalClients = profilesMeta?.total ?? bundle.profiles.length;
  const totalTimelineEvents = timelineMeta?.total ?? bundle.timeline.length;
  const profilesCurrentPage =
    profilesMeta && profilesMeta.limit > 0 ? Math.floor(profilesMeta.offset / profilesMeta.limit) + 1 : 1;
  const timelineCurrentPage =
    timelineMeta && timelineMeta.limit > 0 ? Math.floor(timelineMeta.offset / timelineMeta.limit) + 1 : 1;
  const profilesPageSize = profilesMeta?.limit ?? 20;
  const timelinePageSize = timelineMeta?.limit ?? 20;

  return (
    <BaseTemplate
      content={
        <Customer360Root>
          <HeroCard>
            <HeroTop>
              <HeroTitleWrap>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid color-mix(in srgb, var(--color-primary) 24%, var(--color-border))",
                    background: "color-mix(in srgb, var(--color-surface-2) 80%, transparent)",
                    boxShadow: "var(--shadow-sm)",
                    flexShrink: 0,
                  }}
                >
                  <Users size={20} />
                </div>
                <div>
                  <HeroTitle>Client 360</HeroTitle>
                  <HeroSubtitle>
                    Unified profile and timeline across schedule, work orders, and finance.
                  </HeroSubtitle>
                </div>
              </HeroTitleWrap>

              <HeroStats>
                <Tag>{totalClients} clients</Tag>
                <Tag>{totalTimelineEvents} timeline events</Tag>
                <Tag>{bundle.source === "backend" ? "backend" : "aggregated"}</Tag>
              </HeroStats>
            </HeroTop>

            <HeroActions>
              <Input
                allowClear
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Search by phone or email"
                prefix={<Search size={14} />}
                style={{ width: 320, maxWidth: "100%" }}
              />
              <Button icon={<RefreshCw size={14} />} onClick={onRefresh} loading={loading}>
                Refresh
              </Button>
            </HeroActions>
          </HeroCard>

          <ContentGrid>
            <CardShell>
              <CardHeader>
                <div>
                  <CardTitle>Profiles</CardTitle>
                  <CardSubtitle>Single client register</CardSubtitle>
                </div>
              </CardHeader>
              <ProfilesScrollBody>
                {bundle.profiles.length <= 0 ? (
                  <Empty description="No clients found for this filter." />
                ) : (
                  <Space direction="vertical" size={8} style={{ width: "100%" }}>
                    {bundle.profiles.map((profile) => (
                      <ProfileItem
                        key={profile.id}
                        $active={profile.id === selectedClientId}
                        onClick={() => onSelectClient(profile.id)}
                      >
                        <ProfileName>{profile.displayName}</ProfileName>
                        <ProfileMeta>{profile.email || "No email"}</ProfileMeta>
                        <ProfileMeta>{profile.phone || "No phone"}</ProfileMeta>
                        <ProfileMeta>
                          Last interaction: {formatAppDateTime(profile.lastInteractionAt, "--")}
                        </ProfileMeta>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          <Tag>{profile.totalAppointments} appointments</Tag>
                          <Tag>{profile.totalWorkOrders} work orders</Tag>
                          <Tag>{profile.totalFinanceEntries} finance</Tag>
                        </div>
                      </ProfileItem>
                    ))}
                  </Space>
                )}
              </ProfilesScrollBody>
              <CardFooter>
                <Pagination
                  size="small"
                  current={profilesCurrentPage}
                  pageSize={profilesPageSize}
                  total={totalClients}
                  showSizeChanger
                  pageSizeOptions={[10, 20, 50, 100]}
                  onChange={onProfilesPageChange}
                  showTotal={(total, range) => `${range[0]}-${range[1]} of ${total}`}
                />
              </CardFooter>
            </CardShell>

            <CardShell>
              <CardHeader>
                <div>
                  <CardTitle>{selectedProfile?.displayName ?? "Timeline"}</CardTitle>
                  <CardSubtitle>
                    {selectedProfile
                      ? "Unified customer relationship history"
                      : "Select a profile to inspect events"}
                  </CardSubtitle>
                </div>
                {selectedProfile ? (
                  <Typography.Text strong>
                    {formatMoneyFromCents(selectedProfile.totalBilledCents ?? 0)}
                  </Typography.Text>
                ) : null}
              </CardHeader>
              <ScrollBody>
                {visibleTimeline.length <= 0 ? (
                  <Empty description="No timeline events available for this client." />
                ) : (
                  <Timeline
                    items={visibleTimeline.map((item) => ({
                      color: "var(--color-primary)",
                      children: (
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          <TimelineItemHeader>
                            <TimelineItemTitle>{item.title}</TimelineItemTitle>
                            <TimelineItemMeta>{formatAppDateTime(item.eventAt, "--")}</TimelineItemMeta>
                          </TimelineItemHeader>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            <Tag color={moduleTagColor[item.module]}>{moduleLabel(item.module)}</Tag>
                            {item.status ? <Tag>{item.status}</Tag> : null}
                            {typeof item.amountCents === "number" && item.amountCents > 0 ? (
                              <Tag color="green">{formatMoneyFromCents(item.amountCents)}</Tag>
                            ) : null}
                          </div>
                          {item.description ? (
                            <TimelineItemDescription>{item.description}</TimelineItemDescription>
                          ) : null}
                        </div>
                      ),
                    }))}
                  />
                )}
              </ScrollBody>
              <CardFooter>
                <Pagination
                  size="small"
                  current={timelineCurrentPage}
                  pageSize={timelinePageSize}
                  total={selectedClientId ? totalTimelineEvents : visibleTimeline.length}
                  showSizeChanger
                  pageSizeOptions={[10, 20, 50, 100]}
                  onChange={onTimelinePageChange}
                  showTotal={(total, range) => `${range[0]}-${range[1]} of ${total}`}
                />
              </CardFooter>
            </CardShell>
          </ContentGrid>
        </Customer360Root>
      }
    />
  );
}

export default Customer360Template;
