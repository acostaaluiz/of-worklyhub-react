import React from "react";
import { message } from "antd";
import { i18n as appI18n } from "@core/i18n";
import { BasePage } from "@shared/base/base.page";
import { companyService } from "@modules/company/services/company.service";
import type { Client360Bundle } from "@modules/clients/interfaces/client-360.model";
import {
  clients360Service,
} from "@modules/clients/services/clients-360.service";
import Customer360Template from "@modules/clients/presentation/templates/customer-360/customer-360.template";
import PageSkeleton from "@shared/ui/components/page-skeleton/page-skeleton.component";

const EMPTY_BUNDLE: Client360Bundle = {
  generatedAt: new Date().toISOString(),
  source: "aggregated",
  profiles: [],
  timeline: [],
  pagination: {
    profiles: { limit: 20, offset: 0, total: 0, hasMore: false, nextOffset: null },
    timeline: { limit: 20, offset: 0, total: 0, hasMore: false, nextOffset: null },
  },
};

function resolveWorkspaceIdFromValue(value: DataValue): string | undefined {
  if (!value || typeof value !== "object") return undefined;
  const record = value as DataMap;
  const workspaceId = record.workspaceId;
  if (typeof workspaceId === "string" && workspaceId.trim().length > 0) return workspaceId;
  const id = record.id;
  if (typeof id === "string" && id.trim().length > 0) return id;
  if (typeof id === "number" && Number.isFinite(id)) return String(id);
  return undefined;
}

function Customer360PageContent() {
  const [workspaceId, setWorkspaceId] = React.useState<string | undefined>(() =>
    resolveWorkspaceIdFromValue(companyService.getWorkspaceValue())
  );
  const [bundle, setBundle] = React.useState<Client360Bundle>(EMPTY_BUNDLE);
  const [loading, setLoading] = React.useState(false);
  const [initialLoading, setInitialLoading] = React.useState(true);
  const [searchInput, setSearchInput] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [selectedClientId, setSelectedClientId] = React.useState<string | null>(null);
  const [profilesPage, setProfilesPage] = React.useState(1);
  const [profilesPageSize, setProfilesPageSize] = React.useState(20);
  const [timelinePage, setTimelinePage] = React.useState(1);
  const [timelinePageSize, setTimelinePageSize] = React.useState(20);

  React.useEffect(() => {
    const sub = companyService.getWorkspace$().subscribe((ws) => {
      setWorkspaceId(resolveWorkspaceIdFromValue(ws));
    });
    return () => sub.unsubscribe();
  }, []);

  React.useEffect(() => {
    const handle = setTimeout(() => {
      setSearch(searchInput.trim());
    }, 260);
    return () => clearTimeout(handle);
  }, [searchInput]);

  React.useEffect(() => {
    setProfilesPage(1);
    setTimelinePage(1);
    setSelectedClientId(null);
  }, [workspaceId, search]);

  const loadBundle = React.useCallback(async () => {
    if (!workspaceId) {
      setBundle(EMPTY_BUNDLE);
      setSelectedClientId(null);
      setInitialLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await clients360Service.fetchBundle({
        workspaceId,
        search,
        profilesLimit: profilesPageSize,
        profilesOffset: (profilesPage - 1) * profilesPageSize,
        timelineLimit: timelinePageSize,
        timelineOffset: (timelinePage - 1) * timelinePageSize,
        selectedClientId: selectedClientId ?? undefined,
      });
      setBundle(response);
      setSelectedClientId((prev) => {
        if (prev && response.profiles.some((profile) => profile.id === prev)) return prev;
        return response.profiles[0]?.id ?? null;
      });
    } catch (err) {
      message.error("Failed to load Client 360.");
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [
    workspaceId,
    search,
    profilesPage,
    profilesPageSize,
    timelinePage,
    timelinePageSize,
    selectedClientId,
  ]);

  React.useEffect(() => {
    void loadBundle();
  }, [loadBundle]);

  if (initialLoading) {
    return <PageSkeleton mainRows={3} sideRows={2} height="100%" />;
  }

  return (
    <Customer360Template
      bundle={bundle}
      search={searchInput}
      loading={loading}
      selectedClientId={selectedClientId}
      onSearchChange={setSearchInput}
      onSelectClient={(clientId) => {
        setSelectedClientId(clientId);
        setTimelinePage(1);
      }}
      onProfilesPageChange={(page, pageSize) => {
        setProfilesPage(page);
        setProfilesPageSize(pageSize);
        setTimelinePage(1);
        setSelectedClientId(null);
      }}
      onTimelinePageChange={(page, pageSize) => {
        setTimelinePage(page);
        setTimelinePageSize(pageSize);
      }}
      onRefresh={() => void loadBundle()}
    />
  );
}

export class Customer360Page extends BasePage {
  protected override options = {
    title: `${appI18n.t("clients.pageTitles.customer360")} | WorklyHub`,
    requiresAuth: true,
  };

  protected override renderPage(): React.ReactNode {
    return <Customer360PageContent />;
  }
}

export default Customer360Page;
