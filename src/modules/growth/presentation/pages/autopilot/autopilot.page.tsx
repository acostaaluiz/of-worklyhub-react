import React from "react";
import { message } from "antd";
import { useSearchParams } from "react-router-dom";

import { BasePage } from "@shared/base/base.page";
import { companyService } from "@modules/company/services/company.service";
import GrowthAutopilotTemplate from "@modules/growth/presentation/templates/autopilot/autopilot.template";
import {
  growthService,
} from "@modules/growth/services/growth.service";
import type {
  GrowthDashboardBundle,
  GrowthOpportunityStatus,
  GrowthPlaybook,
} from "@modules/growth/interfaces/growth.model";

type GrowthTabKey = "opportunities" | "playbooks" | "attribution";

const EMPTY_BUNDLE: GrowthDashboardBundle = {
  workspaceId: "",
  source: "fallback",
  generatedAt: new Date().toISOString(),
  opportunities: [],
  playbooks: [],
  summary: {
    workspaceId: "",
    windowStart: "",
    windowEnd: "",
    dispatchedCount: 0,
    convertedCount: 0,
    conversionRatePercent: 0,
    recoveredRevenueCents: 0,
    averageHoursToConvert: null,
  },
};

function resolveWorkspaceIdFromValue(value: DataValue): string | undefined {
  if (!value || typeof value !== "object") return undefined;
  const record = value as DataMap;
  const byWorkspaceId = record.workspaceId;
  if (typeof byWorkspaceId === "string" && byWorkspaceId.trim().length > 0) {
    return byWorkspaceId.trim();
  }
  const id = record.id;
  if (typeof id === "string" && id.trim().length > 0) return id.trim();
  if (typeof id === "number" && Number.isFinite(id)) return String(id);
  return undefined;
}

function normalizeTab(value: string | null): GrowthTabKey {
  if (value === "playbooks") return "playbooks";
  if (value === "attribution") return "attribution";
  return "opportunities";
}

function GrowthAutopilotPageContent(): React.ReactElement {
  const [searchParams, setSearchParams] = useSearchParams();
  const [workspaceId, setWorkspaceId] = React.useState<string | undefined>(() =>
    resolveWorkspaceIdFromValue(companyService.getWorkspaceValue())
  );
  const [bundle, setBundle] = React.useState<GrowthDashboardBundle>(EMPTY_BUNDLE);
  const [searchInput, setSearchInput] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState<GrowthOpportunityStatus | "all">("all");
  const [activeTab, setActiveTab] = React.useState<GrowthTabKey>(() =>
    normalizeTab(searchParams.get("tab"))
  );
  const [loading, setLoading] = React.useState(false);
  const [dispatching, setDispatching] = React.useState(false);
  const [savingPlaybooks, setSavingPlaybooks] = React.useState(false);
  const [selectedOpportunityIds, setSelectedOpportunityIds] = React.useState<string[]>([]);
  const [dispatchPlaybookId, setDispatchPlaybookId] = React.useState<string | undefined>(undefined);
  const [draftPlaybooks, setDraftPlaybooks] = React.useState<GrowthPlaybook[]>([]);

  React.useEffect(() => {
    const sub = companyService.getWorkspace$().subscribe((nextWorkspace) => {
      setWorkspaceId(resolveWorkspaceIdFromValue(nextWorkspace));
    });
    return () => sub.unsubscribe();
  }, []);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(searchInput.trim());
    }, 280);
    return () => clearTimeout(handler);
  }, [searchInput]);

  const loadDashboard = React.useCallback(async () => {
    if (!workspaceId) {
      setBundle(EMPTY_BUNDLE);
      setDraftPlaybooks([]);
      setSelectedOpportunityIds([]);
      setDispatchPlaybookId(undefined);
      return;
    }

    setLoading(true);
    try {
      const response = await growthService.fetchDashboard({
        workspaceId,
        search,
        status,
      });
      setBundle(response);
      setDraftPlaybooks(response.playbooks);
      setSelectedOpportunityIds((current) =>
        current.filter((id) => response.opportunities.some((item) => item.id === id))
      );
      setDispatchPlaybookId((current) => {
        if (current && response.playbooks.some((item) => item.id === current && item.enabled)) {
          return current;
        }
        return response.playbooks.find((item) => item.enabled)?.id;
      });
    } catch (_err) {
      message.error("Failed to load growth autopilot.");
    } finally {
      setLoading(false);
    }
  }, [workspaceId, search, status]);

  React.useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  React.useEffect(() => {
    const nextTab = normalizeTab(searchParams.get("tab"));
    setActiveTab(nextTab);
  }, [searchParams]);

  const handleTabChange = (tab: GrowthTabKey) => {
    setActiveTab(tab);
    const next = new URLSearchParams(searchParams);
    if (tab === "opportunities") next.delete("tab");
    else next.set("tab", tab);
    setSearchParams(next, { replace: true });
  };

  const handlePlaybookChange = (playbookId: string, patch: Partial<GrowthPlaybook>) => {
    setDraftPlaybooks((current) =>
      current.map((playbook) =>
        playbook.id === playbookId ? { ...playbook, ...patch } : playbook
      )
    );
  };

  const handleSavePlaybooks = async () => {
    if (!workspaceId) {
      message.error("Workspace is required.");
      return;
    }

    setSavingPlaybooks(true);
    try {
      const saved = await growthService.savePlaybooks(workspaceId, draftPlaybooks);
      setDraftPlaybooks(saved);
      setBundle((current) => ({ ...current, playbooks: saved }));
      setDispatchPlaybookId((current) => {
        if (current && saved.some((item) => item.id === current && item.enabled)) return current;
        return saved.find((item) => item.enabled)?.id;
      });
      message.success("Playbooks saved.");
    } catch (_err) {
      message.error("Failed to save playbooks.");
    } finally {
      setSavingPlaybooks(false);
    }
  };

  const handleDispatch = async () => {
    if (!workspaceId) {
      message.error("Workspace is required.");
      return;
    }

    if (selectedOpportunityIds.length <= 0) {
      message.warning("Select at least one opportunity.");
      return;
    }

    setDispatching(true);
    try {
      const response = await growthService.dispatch(
        workspaceId,
        selectedOpportunityIds,
        dispatchPlaybookId
      );
      message.success(
        response.source === "backend"
          ? `${response.dispatchedCount} opportunity(ies) dispatched.`
          : `${response.dispatchedCount} opportunity(ies) queued in fallback mode.`
      );
      setSelectedOpportunityIds([]);
      await loadDashboard();
    } catch (_err) {
      message.error("Failed to dispatch opportunities.");
    } finally {
      setDispatching(false);
    }
  };

  const templateBundle: GrowthDashboardBundle = {
    ...bundle,
    playbooks: draftPlaybooks,
  };

  return (
    <GrowthAutopilotTemplate
      bundle={templateBundle}
      loading={loading}
      dispatching={dispatching}
      savingPlaybooks={savingPlaybooks}
      activeTab={activeTab}
      search={searchInput}
      status={status}
      selectedOpportunityIds={selectedOpportunityIds}
      dispatchPlaybookId={dispatchPlaybookId}
      onSearchChange={setSearchInput}
      onStatusChange={setStatus}
      onRefresh={() => void loadDashboard()}
      onTabChange={handleTabChange}
      onSelectOpportunities={setSelectedOpportunityIds}
      onDispatchPlaybookChange={setDispatchPlaybookId}
      onDispatch={() => void handleDispatch()}
      onPlaybookChange={handlePlaybookChange}
      onSavePlaybooks={() => void handleSavePlaybooks()}
    />
  );
}

export class GrowthAutopilotPage extends BasePage {
  protected override options = {
    title: "Growth autopilot | WorklyHub",
    requiresAuth: true,
  };

  protected override renderPage(): React.ReactNode {
    return <GrowthAutopilotPageContent />;
  }
}

export default GrowthAutopilotPage;
