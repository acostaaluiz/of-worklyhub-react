import { useEffect, useMemo, useState } from "react";
import { Button, Empty, Input, InputNumber, Progress, Select, Space, Statistic, Switch, Table, Tag, Typography } from "antd";
import type { ColumnsType, TableRowSelection } from "antd/es/table/interface";
import { useTranslation } from "react-i18next";
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

const CHANNEL_VALUES: GrowthChannel[] = ["whatsapp", "email", "sms"];
const GOAL_VALUES: GrowthPlaybook["goal"][] = ["reactivation", "upsell", "recovery"];

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
  const { t } = useTranslation();
  const [playbookIndex, setPlaybookIndex] = useState(0);

  const statusLabel = (value: GrowthOpportunityStatus): string =>
    t(`growth.autopilot.statusLabels.${value}`);

  const moduleLabel = (value: GrowthOpportunitySourceModule): string => {
    if (value === "work-order") return t("growth.autopilot.moduleLabels.workOrder");
    return t(`growth.autopilot.moduleLabels.${value}`);
  };

  const channelOptions = CHANNEL_VALUES.map((value) => ({
    value,
    label: t(`growth.autopilot.playbooks.channel${value.charAt(0).toUpperCase()}${value.slice(1)}`),
  }));

  const goalOptions = GOAL_VALUES.map((value) => ({
    value,
    label: t(`growth.autopilot.playbooks.goal${value.charAt(0).toUpperCase()}${value.slice(1)}`),
  }));

  const opportunityColumns: ColumnsType<GrowthOpportunity> = [
    {
      title: t("growth.autopilot.opportunities.table.client"),
      dataIndex: "clientName",
      key: "client",
      width: 220,
      render: (_value: string, row: GrowthOpportunity) => (
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography.Text strong>{row.clientName}</Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {row.clientEmail ?? row.clientPhone ?? t("growth.autopilot.opportunities.table.noContactLinked")}
          </Typography.Text>
        </div>
      ),
    },
    {
      title: t("growth.autopilot.opportunities.table.opportunity"),
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
      title: t("growth.autopilot.opportunities.table.module"),
      dataIndex: "sourceModule",
      key: "sourceModule",
      width: 130,
      render: (value: GrowthOpportunitySourceModule) => (
        <Tag color={moduleTagColor[value]}>{moduleLabel(value)}</Tag>
      ),
    },
    {
      title: t("growth.autopilot.opportunities.table.expected"),
      dataIndex: "expectedValueCents",
      key: "expectedValueCents",
      width: 120,
      align: "right",
      render: (value: number | null | undefined) => formatMoneyFromCents(value ?? 0),
    },
    {
      title: t("growth.autopilot.opportunities.table.status"),
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (value: GrowthOpportunityStatus) => (
        <Tag color={statusTagColor[value]}>{statusLabel(value)}</Tag>
      ),
    },
    {
      title: t("growth.autopilot.opportunities.table.lastInteraction"),
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
    <PaneShell data-cy="growth-opportunities-pane">
      <Toolbar>
        <Input.Search
          data-cy="growth-opportunities-search-input"
          allowClear
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={t("growth.autopilot.opportunities.searchPlaceholder")}
          style={{ width: 320, maxWidth: "100%" }}
        />

        <Select<GrowthOpportunityStatus | "all">
          data-cy="growth-opportunities-status-select"
          value={status}
          onChange={onStatusChange}
          style={{ width: 180 }}
          options={[
            { value: "all", label: t("growth.autopilot.opportunities.statusAll") },
            { value: "new", label: t("growth.autopilot.statusLabels.new") },
            { value: "queued", label: t("growth.autopilot.statusLabels.queued") },
            { value: "sent", label: t("growth.autopilot.statusLabels.sent") },
            { value: "converted", label: t("growth.autopilot.statusLabels.converted") },
            { value: "archived", label: t("growth.autopilot.statusLabels.archived") },
          ]}
        />

        <Select<string>
          data-cy="growth-opportunities-playbook-select"
          allowClear
          value={dispatchPlaybookId}
          onChange={(value) => onDispatchPlaybookChange(value)}
          placeholder={t("growth.autopilot.opportunities.dispatchPlaybookPlaceholder")}
          style={{ width: 220 }}
          options={enabledPlaybookOptions}
        />

        <ToolbarSpacer />

        <HeroRefreshButton
          data-cy="growth-opportunities-refresh-button"
          icon={<RefreshCw size={14} />}
          onClick={onRefresh}
          loading={loading}
        >
          {t("growth.autopilot.opportunities.refresh")}
        </HeroRefreshButton>
        <HeroDispatchButton
          data-cy="growth-opportunities-dispatch-button"
          type="primary"
          icon={<Send size={14} />}
          onClick={onDispatch}
          loading={dispatching}
          disabled={selectedOpportunityIds.length <= 0}
        >
          {t("growth.autopilot.opportunities.dispatchCta", { count: selectedOpportunityIds.length })}
        </HeroDispatchButton>
      </Toolbar>

      <TableWrap data-cy="growth-opportunities-table-wrap">
        <Table<GrowthOpportunity>
          data-cy="growth-opportunities-table"
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
        {t("growth.autopilot.opportunities.footerHint")}
      </FooterHint>
    </PaneShell>
  );

  const playbooksPane = (
    <PaneShell data-cy="growth-playbooks-pane">
      <Toolbar>
        <Typography.Text type="secondary">
          {t("growth.autopilot.playbooks.toolbarHint")}
        </Typography.Text>
        <ToolbarSpacer />
        <PlaybookCarouselControls>
          <Button
            data-cy="growth-playbooks-previous-button"
            icon={<ChevronLeft size={14} />}
            onClick={goToPreviousPlaybook}
            disabled={totalPlaybooks <= 1}
          >
            {t("growth.autopilot.playbooks.previous")}
          </Button>
          <PlaybookIndicator>
            {totalPlaybooks <= 0
              ? t("growth.autopilot.playbooks.indicator", { current: 0, total: 0 })
              : t("growth.autopilot.playbooks.indicator", {
                  current: safePlaybookIndex + 1,
                  total: totalPlaybooks,
                })}
          </PlaybookIndicator>
          <Button
            data-cy="growth-playbooks-next-button"
            icon={<ChevronRight size={14} />}
            onClick={goToNextPlaybook}
            disabled={totalPlaybooks <= 1}
          >
            {t("growth.autopilot.playbooks.next")}
          </Button>
        </PlaybookCarouselControls>
        <Button
          data-cy="growth-playbooks-save-button"
          type="primary"
          icon={<Megaphone size={14} />}
          onClick={onSavePlaybooks}
          loading={savingPlaybooks}
        >
          {t("growth.autopilot.playbooks.save")}
        </Button>
      </Toolbar>

      <PlaybookCarouselShell data-cy="growth-playbooks-carousel-shell">
        <PlaybookDots data-cy="growth-playbooks-dots">
          {bundle.playbooks.map((playbook, index) => (
            <PlaybookDot
              key={playbook.id}
              data-cy={`growth-playbook-dot-${playbook.id}`}
              $active={index === safePlaybookIndex}
              aria-label={t("growth.autopilot.playbooks.goToPlaybook", {
                index: index + 1,
              })}
              onClick={() => setPlaybookIndex(index)}
            />
          ))}
        </PlaybookDots>

        {currentPlaybook ? (
          <PlaybookCard key={currentPlaybook.id} data-cy={`growth-playbook-card-${currentPlaybook.id}`}>
            <PlaybookHead>
              <div>
                <PlaybookTitle>{currentPlaybook.title}</PlaybookTitle>
                {currentPlaybook.description ? (
                  <PlaybookDescription>{currentPlaybook.description}</PlaybookDescription>
                ) : null}
              </div>
              <Switch
                data-cy="growth-playbook-enabled-switch"
                checked={currentPlaybook.enabled}
                onChange={(checked) => onPlaybookChange(currentPlaybook.id, { enabled: checked })}
              />
            </PlaybookHead>

            <Space direction="vertical" size={12} style={{ width: "100%" }}>
              <div>
                <Typography.Text type="secondary">
                  {t("growth.autopilot.playbooks.goal")}
                </Typography.Text>
                <Select<GrowthPlaybook["goal"]>
                  data-cy="growth-playbook-goal-select"
                  value={currentPlaybook.goal}
                  onChange={(value) => onPlaybookChange(currentPlaybook.id, { goal: value })}
                  options={goalOptions}
                  style={{ width: "100%", marginTop: 8 }}
                />
              </div>

              <div>
                <Typography.Text type="secondary">
                  {t("growth.autopilot.playbooks.channels")}
                </Typography.Text>
                <Select
                  data-cy="growth-playbook-channels-select"
                  mode="multiple"
                  value={currentPlaybook.channels as string[]}
                  options={channelOptions}
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
                  <Typography.Text type="secondary">
                    {t("growth.autopilot.playbooks.delayHours")}
                  </Typography.Text>
                  <InputNumber
                    data-cy="growth-playbook-delay-input"
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
                  <Typography.Text type="secondary">
                    {t("growth.autopilot.playbooks.maxTouches")}
                  </Typography.Text>
                  <InputNumber
                    data-cy="growth-playbook-max-touches-input"
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
            <Empty description={t("growth.autopilot.playbooks.empty")} />
          </PlaybookCard>
        )}
      </PlaybookCarouselShell>
    </PaneShell>
  );

  const attributionPane = (
    <PaneShell data-cy="growth-attribution-pane">
      <AttributionScroll data-cy="growth-attribution-scroll">
        <AttributionGrid data-cy="growth-attribution-grid">
          <AttributionCard data-cy="growth-attribution-card-dispatched">
            <Statistic
              title={t("growth.autopilot.attribution.dispatched")}
              value={bundle.summary.dispatchedCount}
              prefix={<Megaphone size={14} />}
            />
          </AttributionCard>
          <AttributionCard data-cy="growth-attribution-card-converted">
            <Statistic
              title={t("growth.autopilot.attribution.converted")}
              value={bundle.summary.convertedCount}
              prefix={<Target size={14} />}
            />
          </AttributionCard>
          <AttributionCard data-cy="growth-attribution-card-recovered-revenue">
            <Statistic
              title={t("growth.autopilot.attribution.recoveredRevenue")}
              value={formatMoneyFromCents(bundle.summary.recoveredRevenueCents)}
              prefix={<CircleDollarSign size={14} />}
            />
          </AttributionCard>
          <AttributionCard data-cy="growth-attribution-card-average-hours">
            <Statistic
              title={t("growth.autopilot.attribution.avgHoursToConvert")}
              value={bundle.summary.averageHoursToConvert ?? 0}
              suffix="h"
              prefix={<CalendarClock size={14} />}
            />
          </AttributionCard>
        </AttributionGrid>

        <AttributionCard data-cy="growth-attribution-card-conversion-rate">
          <Statistic
            title={t("growth.autopilot.attribution.conversionRate")}
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
            {t("growth.autopilot.attribution.window", {
              start: bundle.summary.windowStart,
              end: bundle.summary.windowEnd,
            })}
          </AttributionMeta>
          <AttributionMeta>
            {t("growth.autopilot.attribution.source", {
              source:
                bundle.source === "backend"
                  ? t("growth.autopilot.attribution.sourceBackend")
                  : t("growth.autopilot.attribution.sourceFallback"),
            })}
          </AttributionMeta>
        </AttributionCard>

        <AttributionDetailGrid data-cy="growth-attribution-detail-grid">
          <AttributionCard data-cy="growth-attribution-pipeline-mix-card">
            <Typography.Text type="secondary">
              {t("growth.autopilot.attribution.pipelineMix")}
            </Typography.Text>
            <Space direction="vertical" size={10} style={{ width: "100%", marginTop: 10 }}>
              <div>
                <Space style={{ width: "100%", justifyContent: "space-between" }}>
                  <Typography.Text>{t("growth.autopilot.statusLabels.new")}</Typography.Text>
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
                  <Typography.Text>{t("growth.autopilot.statusLabels.queued")}</Typography.Text>
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
                  <Typography.Text>{t("growth.autopilot.statusLabels.sent")}</Typography.Text>
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
                  <Typography.Text>{t("growth.autopilot.statusLabels.converted")}</Typography.Text>
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

          <AttributionCard data-cy="growth-attribution-next-actions-card">
            <Typography.Text type="secondary">
              {t("growth.autopilot.attribution.nextActions")}
            </Typography.Text>
            <AttributionList style={{ marginTop: 10 }}>
              {topPending.length > 0 ? (
                topPending.map((item) => (
                  <AttributionListItem key={item.id}>
                    {item.title}
                    <span>
                      {item.clientName} - {formatMoneyFromCents(item.expectedValueCents ?? 0)}
                    </span>
                  </AttributionListItem>
                ))
              ) : (
                <AttributionListItem>
                  {t("growth.autopilot.attribution.pipelineFullyDispatched")}
                  <span>{t("growth.autopilot.attribution.pipelineHint")}</span>
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
        <GrowthRoot data-cy="growth-autopilot-page">
          <HeroCard data-cy="growth-autopilot-hero">
            <HeroTop>
              <HeroTitleWrap>
                <HeroIconWrap>
                  <Sparkles size={20} />
                </HeroIconWrap>
                <div>
                  <HeroTitle>{t("growth.autopilot.hero.title")}</HeroTitle>
                  <HeroSubtitle>
                    {t("growth.autopilot.hero.subtitle")}
                  </HeroSubtitle>
                </div>
              </HeroTitleWrap>

              <HeroActions size={8} data-cy="growth-autopilot-hero-actions">
                <Tag data-cy="growth-autopilot-opportunities-count">
                  {t("growth.autopilot.hero.opportunitiesCount", {
                    count: bundle.opportunities.length,
                  })}
                </Tag>
                <Tag data-cy="growth-autopilot-playbooks-count">
                  {t("growth.autopilot.hero.playbooksCount", {
                    count: bundle.playbooks.length,
                  })}
                </Tag>
                <Tag data-cy="growth-autopilot-source-tag">
                  {bundle.source === "backend"
                    ? t("growth.autopilot.hero.sourceBackend")
                    : t("growth.autopilot.hero.sourceFallback")}
                </Tag>
              </HeroActions>
            </HeroTop>
          </HeroCard>

          <BodyCard data-cy="growth-autopilot-body">
            <GrowthTabs
              data-cy="growth-autopilot-tabs"
              activeKey={activeTab}
              onChange={(key) => onTabChange(key as GrowthTabKey)}
              items={[
                {
                  key: "opportunities",
                  label: (
                    <Space size={6} data-cy="growth-tab-opportunities">
                      <Target size={14} />
                      {t("growth.autopilot.tabs.opportunities")}
                    </Space>
                  ),
                  children: opportunitiesPane,
                },
                {
                  key: "playbooks",
                  label: (
                    <Space size={6} data-cy="growth-tab-playbooks">
                      <Megaphone size={14} />
                      {t("growth.autopilot.tabs.playbooks")}
                    </Space>
                  ),
                  children: playbooksPane,
                },
                {
                  key: "attribution",
                  label: (
                    <Space size={6} data-cy="growth-tab-attribution">
                      <BarChart3 size={14} />
                      {t("growth.autopilot.tabs.attribution")}
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

