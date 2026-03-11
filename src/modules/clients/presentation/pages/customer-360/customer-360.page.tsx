import React from "react";
import { message } from "antd";
import { BasePage } from "@shared/base/base.page";
import { companyService } from "@modules/company/services/company.service";
import type { Client360Bundle } from "@modules/clients/interfaces/client-360.model";
import {
  clients360Service,
} from "@modules/clients/services/clients-360.service";
import Customer360Template from "@modules/clients/presentation/templates/customer-360/customer-360.template";

const EMPTY_BUNDLE: Client360Bundle = {
  generatedAt: new Date().toISOString(),
  source: "aggregated",
  profiles: [],
  timeline: [],
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
  const [searchInput, setSearchInput] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [selectedClientId, setSelectedClientId] = React.useState<string | null>(null);

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

  const loadBundle = React.useCallback(async () => {
    if (!workspaceId) {
      setBundle(EMPTY_BUNDLE);
      setSelectedClientId(null);
      return;
    }

    setLoading(true);
    try {
      const response = await clients360Service.fetchBundle({
        workspaceId,
        search,
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
    }
  }, [workspaceId, search]);

  React.useEffect(() => {
    void loadBundle();
  }, [loadBundle]);

  return (
    <Customer360Template
      bundle={bundle}
      search={searchInput}
      loading={loading}
      selectedClientId={selectedClientId}
      onSearchChange={setSearchInput}
      onSelectClient={setSelectedClientId}
      onRefresh={() => void loadBundle()}
    />
  );
}

export class Customer360Page extends BasePage {
  protected override options = {
    title: "Client 360 | WorklyHub",
    requiresAuth: true,
  };

  protected override renderPage(): React.ReactNode {
    return <Customer360PageContent />;
  }
}

export default Customer360Page;

