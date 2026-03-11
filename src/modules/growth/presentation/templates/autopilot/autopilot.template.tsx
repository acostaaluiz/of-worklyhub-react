import { useEffect, useMemo, useState } from "react";
import { Button, Empty, Input, InputNumber, Progress, Select, Space, Statistic, Switch, Table, Tag, Typography } from "antd";
import type { ColumnsType, TableRowSelection } from "antd/es/table/interface";
import {
  BarChart3,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Megaphone,
  RefreshCw,
  Send,
  Sparkles,
  Target,
} from "lucide-react";

import { BaseTemplate } from "@shared/base/base.template";
import { formatMoneyFromCents } from "@core/utils/mask";
import { formatAppDateTime } from "@core/utils/date-time";
import type {
  GrowthChannel,
  GrowthDashboardBundle,
  GrowthOpportunity,
  GrowthOpportunitySourceModule,
  GrowthOpportunityStatus,
  GrowthPlaybook,
} from "@modules/growth/interfaces/growth.model";
import {
  AttributionCard,
  AttributionDetailGrid,
  AttributionGrid,
  AttributionList,
  AttributionListItem,
  AttributionMeta,
  AttributionScroll,
  BodyCard,
  FooterHint,
  GrowthRoot,
  GrowthTabs,
  HeroActions,
  HeroCard,
  HeroDispatchButton,
  HeroIconWrap,
  HeroRefreshButton,
  HeroSubtitle,
  HeroTitle,
  HeroTitleWrap,
  HeroTop,
  PaneShell,
  PlaybookCard,
  PlaybookCarouselControls,
  PlaybookCarouselShell,
  PlaybookDot,
  PlaybookDots,
  PlaybookDescription,
  PlaybookHead,
  PlaybookIndicator,
  PlaybookTitle,
  TableWrap,
  Toolbar,
  ToolbarSpacer,
} from "./autopilot.template.styles";

type GrowthTabKey = "opportunities" | "playbooks" | "attribution";

type Props = {
  bundle: GrowthDashboardBundle;
  loading?: boolean;
  dispatching?: boolean;
  savingPlaybooks?: boolean;
  activeTab: GrowthTabKey;
  search: string;
  status: GrowthOpportunityStatus | "all";
  selectedOpportunityIds: string[];
  dispatchPlaybookId?: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: GrowthOpportunityStatus | "all") => void;
  onRefresh: () => void;
  onTabChange: (key: GrowthTabKey) => void;
  onSelectOpportunities: (ids: string[]) => void;
  onDispatchPlaybookChange: (playbookId?: string) => void;
  onDispatch: () => void;
  onPlaybookChange: (playbookId: string, patch: Partial<GrowthPlaybook>) => void;
  onSavePlaybooks: () => void;
};

const moduleTagColor: Record<GrowthOpportunitySourceModule, string> = {
  clients: "purple",
  schedule: "blue",
  "work-order": "gold",
  finance: "green",
};

const statusTagColor: Record<GrowthOpportunityStatus, string> = {
  new: "blue",
  queued: "cyan",
  sent: "orange",
  converted: "green",
  archived: "default",
};

function statusLabel(status: GrowthOpportunityStatus): string {
  if (status === "new") return "New";
  if (status === "queued") return "Queued";
  if (status === "sent") return "Sent";
  if (status === "converted") return "Converted";
  return "Archived";
}

function moduleLabel(module: GrowthOpportunitySourceModule): string {
  if (module === "work-order") return "Work order";
  return module.charAt(0).toUpperCase() + module.slice(1);
}

const CHANNEL_OPTIONS: Array<{ value: GrowthChannel; label: string }> = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "email", label: "Email" },
  { value: "sms", label: "SMS" },
];

const GOAL_OPTIONS: Array<{ value: GrowthPlaybook["goal"]; label: string }> = [
  { value: "reactivation", label: "Reactivation" },
  { value: "upsell", label: "Upsell" },
  { value: "recovery", label: "Recovery" },
];

export function GrowthAutopilotTemplate({
  bundle,
  loading,
  dispatching,
  savingPlaybooks,
  activeTab,
  search,
  status,
  selectedOpportunityIds,
  dispatchPlaybookId,
  onSearchChange,
  onStatusChange,
  onRefresh,
  onTabChange,
  onSelectOpportunities,
  onDispatchPlaybookChange,
  onDispatch,
  onPlaybookChange,
  onSavePlaybooks,
}: Props) {
  const [playbookIndex, setPlaybookIndex] = useState(0);

  const opportunityColumns: ColumnsType<GrowthOpportunity> = [
    {
      title: "Client",
      dataIndex: "clientName",
      key: "client",
      width: 220,
      render: (_value: string, row: GrowthOpportunity) => (
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography.Text strong>{row.clientName}</Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {row.clientEmail ?? row.clientPhone ?? "No contact linked"}
          </Typography.Text>
        </div>
      ),
    },
    {
      title: "Opportunity",
      key: "title",
      render: (_value: unknown, row: GrowthOpportunity) => (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <Typography.Text strong>{row.title}</Typography.Text>
          {row.summary ? (
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {row.summary}
            </Typography.Text>
          ) : null}
        </div>
      ),
    },
    {
      title: "Module",
      dataIndex: "sourceModule",
      key: "sourceModule",
      width: 130,
      render: (value: GrowthOpportunitySourceModule) => (
        <Tag color={moduleTagColor[value]}>{moduleLabel(value)}</Tag>
      ),
    },
    {
      title: "Expected",
      dataIndex: "expectedValueCents",
      key: "expectedValueCents",
      width: 120,
      align: "right",
      render: (value: number | null | undefined) => formatMoneyFromCents(value ?? 0),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (value: GrowthOpportunityStatus) => (
        <Tag color={statusTagColor[value]}>{statusLabel(value)}</Tag>
      ),
    },
    {
      title: "Last interaction",
      dataIndex: "lastInteractionAt",
      key: "lastInteractionAt",
      width: 150,
      render: (value: string | null | undefined) => formatAppDateTime(value ?? undefined, "--"),
    },
  ];

  const rowSelection: TableRowSelection<GrowthOpportunity> = {
    selectedRowKeys: selectedOpportunityIds,
    onChange: (selectedRowKeys) =>
      onSelectOpportunities(selectedRowKeys.map((key) => String(key))),
  };

  const enabledPlaybookOptions = bundle.playbooks
    .filter((playbook) => playbook.enabled)
    .map((playbook) => ({ label: playbook.title, value: playbook.id }));

  const totalPlaybooks = bundle.playbooks.length;
  const safePlaybookIndex = useMemo(() => {
    if (totalPlaybooks <= 0) return 0;
    if (playbookIndex < 0) return 0;
    if (playbookIndex >= totalPlaybooks) return totalPlaybooks - 1;
    return playbookIndex;
  }, [playbookIndex, totalPlaybooks]);

  useEffect(() => {
    if (safePlaybookIndex !== playbookIndex) {
      setPlaybookIndex(safePlaybookIndex);
    }
  }, [playbookIndex, safePlaybookIndex]);

  const currentPlaybook = bundle.playbooks[safePlaybookIndex] ?? null;

  const goToPreviousPlaybook = () => {
    if (totalPlaybooks <= 1) return;
    setPlaybookIndex((current) => (current - 1 + totalPlaybooks) % totalPlaybooks);
  };

  const goToNextPlaybook = () => {
    if (totalPlaybooks <= 1) return;
    setPlaybookIndex((current) => (current + 1) % totalPlaybooks);
  };

  const statusCounts = {
    new: bundle.opportunities.filter((item) => item.status === "new").length,
    queued: bundle.opportunities.filter((item) => item.status === "queued").length,
    sent: bundle.opportunities.filter((item) => item.status === "sent").length,
    converted: bundle.opportunities.filter((item) => item.status === "converted").length,
  };
  const statusTotal = Math.max(bundle.opportunities.length, 1);
  const topPending = bundle.opportunities
    .filter((item) => item.status === "new" || item.status === "queued")
    .slice(0, 4);

  const opportunitiesPane = (
    <PaneShell>
      <Toolbar>
        <Input.Search
          allowClear
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search by client, contact, or opportunity"
          style={{ width: 320, maxWidth: "100%" }}
        />

        <Select<GrowthOpportunityStatus | "all">
          value={status}
          onChange={onStatusChange}
          style={{ width: 180 }}
          options={[
            { value: "all", label: "All statuses" },
            { value: "new", label: "New" },
            { value: "queued", label: "Queued" },
            { value: "sent", label: "Sent" },
            { value: "converted", label: "Converted" },
            { value: "archived", label: "Archived" },
          ]}
        />

        <Select<string>
          allowClear
          value={dispatchPlaybookId}
          onChange={(value) => onDispatchPlaybookChange(value)}
          placeholder="Dispatch playbook"
          style={{ width: 220 }}
          options={enabledPlaybookOptions}
        />

        <ToolbarSpacer />

        <HeroRefreshButton icon={<RefreshCw size={14} />} onClick={onRefresh} loading={loading}>
          Refresh
        </HeroRefreshButton>
        <HeroDispatchButton
          type="primary"
          icon={<Send size={14} />}
          onClick={onDispatch}
          loading={dispatching}
          disabled={selectedOpportunityIds.length <= 0}
        >
          Dispatch ({selectedOpportunityIds.length})
        </HeroDispatchButton>
      </Toolbar>

      <TableWrap>
        <Table<GrowthOpportunity>
          rowKey="id"
          size="small"
          loading={loading}
          dataSource={bundle.opportunities}
          columns={opportunityColumns}
          rowSelection={rowSelection}
          pagination={{
            pageSize: 8,
            showSizeChanger: false,
            position: ["bottomRight"],
          }}
        />
      </TableWrap>

      <FooterHint>
        Opportunities are generated from workflow, scheduling, and billing signals. Dispatching
        keeps status aligned with automation progress.
      </FooterHint>
    </PaneShell>
  );

  const playbooksPane = (
    <PaneShell>
      <Toolbar>
        <Typography.Text type="secondary">
          Configure objective, channels, and cadence for automated dispatch.
        </Typography.Text>
        <ToolbarSpacer />
        <PlaybookCarouselControls>
          <Button
            icon={<ChevronLeft size={14} />}
            onClick={goToPreviousPlaybook}
            disabled={totalPlaybooks <= 1}
          >
            Previous
          </Button>
          <PlaybookIndicator>
            {totalPlaybooks <= 0 ? "0 / 0" : `${safePlaybookIndex + 1} / ${totalPlaybooks}`}
          </PlaybookIndicator>
          <Button
            icon={<ChevronRight size={14} />}
            onClick={goToNextPlaybook}
            disabled={totalPlaybooks <= 1}
          >
            Next
          </Button>
        </PlaybookCarouselControls>
        <Button type="primary" icon={<Megaphone size={14} />} onClick={onSavePlaybooks} loading={savingPlaybooks}>
          Save playbooks
        </Button>
      </Toolbar>

      <PlaybookCarouselShell>
        <PlaybookDots>
          {bundle.playbooks.map((playbook, index) => (
            <PlaybookDot
              key={playbook.id}
              $active={index === safePlaybookIndex}
              aria-label={`Go to playbook ${index + 1}`}
              onClick={() => setPlaybookIndex(index)}
            />
          ))}
        </PlaybookDots>

        {currentPlaybook ? (
          <PlaybookCard key={currentPlaybook.id}>
            <PlaybookHead>
              <div>
                <PlaybookTitle>{currentPlaybook.title}</PlaybookTitle>
                {currentPlaybook.description ? (
                  <PlaybookDescription>{currentPlaybook.description}</PlaybookDescription>
                ) : null}
              </div>
              <Switch
                checked={currentPlaybook.enabled}
                onChange={(checked) => onPlaybookChange(currentPlaybook.id, { enabled: checked })}
              />
            </PlaybookHead>

            <Space direction="vertical" size={12} style={{ width: "100%" }}>
              <div>
                <Typography.Text type="secondary">Goal</Typography.Text>
                <Select<GrowthPlaybook["goal"]>
                  value={currentPlaybook.goal}
                  onChange={(value) => onPlaybookChange(currentPlaybook.id, { goal: value })}
                  options={GOAL_OPTIONS}
                  style={{ width: "100%", marginTop: 8 }}
                />
              </div>

              <div>
                <Typography.Text type="secondary">Channels</Typography.Text>
                <Select
                  mode="multiple"
                  value={currentPlaybook.channels as string[]}
                  options={CHANNEL_OPTIONS}
                  onChange={(value) =>
                    onPlaybookChange(currentPlaybook.id, {
                      channels: (value as unknown as string[]) as GrowthChannel[],
                    })
                  }
                  style={{ width: "100%", marginTop: 8 }}
                />
              </div>

              <Space size={12} wrap>
                <div>
                  <Typography.Text type="secondary">Delay (hours)</Typography.Text>
                  <InputNumber
                    min={0}
                    max={168}
                    value={currentPlaybook.delayHours}
                    onChange={(value) =>
                      onPlaybookChange(currentPlaybook.id, { delayHours: Number(value ?? 0) })
                    }
                    style={{ width: 120, marginTop: 8 }}
                  />
                </div>

                <div>
                  <Typography.Text type="secondary">Max touches</Typography.Text>
                  <InputNumber
                    min={1}
                    max={12}
                    value={currentPlaybook.maxTouches}
                    onChange={(value) =>
                      onPlaybookChange(currentPlaybook.id, { maxTouches: Number(value ?? 1) })
                    }
                    style={{ width: 120, marginTop: 8 }}
                  />
                </div>
              </Space>
            </Space>
          </PlaybookCard>
        ) : (
          <PlaybookCard>
            <Empty description="No playbooks configured yet." />
          </PlaybookCard>
        )}
      </PlaybookCarouselShell>
    </PaneShell>
  );

  const attributionPane = (
    <PaneShell>
      <AttributionScroll>
        <AttributionGrid>
          <AttributionCard>
            <Statistic
              title="Dispatched opportunities"
              value={bundle.summary.dispatchedCount}
              prefix={<Megaphone size={14} />}
            />
          </AttributionCard>
          <AttributionCard>
            <Statistic
              title="Converted opportunities"
              value={bundle.summary.convertedCount}
              prefix={<Target size={14} />}
            />
          </AttributionCard>
          <AttributionCard>
            <Statistic
              title="Recovered revenue"
              value={formatMoneyFromCents(bundle.summary.recoveredRevenueCents)}
              prefix={<CircleDollarSign size={14} />}
            />
          </AttributionCard>
          <AttributionCard>
            <Statistic
              title="Avg hours to convert"
              value={bundle.summary.averageHoursToConvert ?? 0}
              suffix="h"
              prefix={<CalendarClock size={14} />}
            />
          </AttributionCard>
        </AttributionGrid>

        <AttributionCard>
          <Statistic
            title="Conversion rate"
            value={bundle.summary.conversionRatePercent}
            suffix="%"
            precision={2}
            prefix={<BarChart3 size={14} />}
          />
          <Progress
            percent={Math.min(100, Math.max(0, bundle.summary.conversionRatePercent))}
            showInfo={false}
            style={{ marginTop: 10 }}
          />
          <AttributionMeta>
            Window: {bundle.summary.windowStart} to {bundle.summary.windowEnd}
          </AttributionMeta>
          <AttributionMeta>
            Source: {bundle.source === "backend" ? "Backend consolidated" : "Fallback snapshot"}
          </AttributionMeta>
        </AttributionCard>

        <AttributionDetailGrid>
          <AttributionCard>
            <Typography.Text type="secondary">Pipeline status mix</Typography.Text>
            <Space direction="vertical" size={10} style={{ width: "100%", marginTop: 10 }}>
              <div>
                <Space style={{ width: "100%", justifyContent: "space-between" }}>
                  <Typography.Text>New</Typography.Text>
                  <Typography.Text type="secondary">{statusCounts.new}</Typography.Text>
                </Space>
                <Progress
                  percent={Math.round((statusCounts.new / statusTotal) * 100)}
                  showInfo={false}
                  strokeColor="var(--color-primary)"
                  size="small"
                />
              </div>

              <div>
                <Space style={{ width: "100%", justifyContent: "space-between" }}>
                  <Typography.Text>Queued</Typography.Text>
                  <Typography.Text type="secondary">{statusCounts.queued}</Typography.Text>
                </Space>
                <Progress
                  percent={Math.round((statusCounts.queued / statusTotal) * 100)}
                  showInfo={false}
                  strokeColor="var(--color-secondary)"
                  size="small"
                />
              </div>

              <div>
                <Space style={{ width: "100%", justifyContent: "space-between" }}>
                  <Typography.Text>Sent</Typography.Text>
                  <Typography.Text type="secondary">{statusCounts.sent}</Typography.Text>
                </Space>
                <Progress
                  percent={Math.round((statusCounts.sent / statusTotal) * 100)}
                  showInfo={false}
                  strokeColor="var(--color-warning)"
                  size="small"
                />
              </div>

              <div>
                <Space style={{ width: "100%", justifyContent: "space-between" }}>
                  <Typography.Text>Converted</Typography.Text>
                  <Typography.Text type="secondary">{statusCounts.converted}</Typography.Text>
                </Space>
                <Progress
                  percent={Math.round((statusCounts.converted / statusTotal) * 100)}
                  showInfo={false}
                  strokeColor="var(--color-success)"
                  size="small"
                />
              </div>
            </Space>
          </AttributionCard>

          <AttributionCard>
            <Typography.Text type="secondary">Next optimization actions</Typography.Text>
            <AttributionList style={{ marginTop: 10 }}>
              {topPending.length > 0 ? (
                topPending.map((item) => (
                  <AttributionListItem key={item.id}>
                    {item.title}
                    <span>
                      {item.clientName} • {formatMoneyFromCents(item.expectedValueCents ?? 0)}
                    </span>
                  </AttributionListItem>
                ))
              ) : (
                <AttributionListItem>
                  Pipeline is fully dispatched for now.
                  <span>Add new opportunities from the Opportunities tab.</span>
                </AttributionListItem>
              )}
            </AttributionList>
          </AttributionCard>
        </AttributionDetailGrid>
      </AttributionScroll>
    </PaneShell>
  );

  return (
    <BaseTemplate
      content={
        <GrowthRoot>
          <HeroCard>
            <HeroTop>
              <HeroTitleWrap>
                <HeroIconWrap>
                  <Sparkles size={20} />
                </HeroIconWrap>
                <div>
                  <HeroTitle>Growth Autopilot</HeroTitle>
                  <HeroSubtitle>
                    Convert execution signals into retention campaigns and faster revenue recovery.
                  </HeroSubtitle>
                </div>
              </HeroTitleWrap>

              <HeroActions size={8}>
                <Tag>{bundle.opportunities.length} opportunities</Tag>
                <Tag>{bundle.playbooks.length} playbooks</Tag>
                <Tag>{bundle.source === "backend" ? "backend" : "fallback"}</Tag>
              </HeroActions>
            </HeroTop>
          </HeroCard>

          <BodyCard>
            <GrowthTabs
              activeKey={activeTab}
              onChange={(key) => onTabChange(key as GrowthTabKey)}
              items={[
                {
                  key: "opportunities",
                  label: (
                    <Space size={6}>
                      <Target size={14} />
                      Opportunities
                    </Space>
                  ),
                  children: opportunitiesPane,
                },
                {
                  key: "playbooks",
                  label: (
                    <Space size={6}>
                      <Megaphone size={14} />
                      Playbooks
                    </Space>
                  ),
                  children: playbooksPane,
                },
                {
                  key: "attribution",
                  label: (
                    <Space size={6}>
                      <BarChart3 size={14} />
                      Attribution
                    </Space>
                  ),
                  children: attributionPane,
                },
              ]}
            />
          </BodyCard>
        </GrowthRoot>
      }
    />
  );
}

export default GrowthAutopilotTemplate;
