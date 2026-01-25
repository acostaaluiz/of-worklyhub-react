import { useEffect, useState } from "react";
import { Briefcase, Box, CheckSquare, User } from "lucide-react";
import { BaseTemplate } from "@shared/base/base.template";
import {
  ModuleLanding,
  type ModuleLandingItem,
} from "@shared/ui/components/module-landing/module-landing.component";
import { companyService, type Workspace } from "@modules/company/services/company.service";

const pickString = (...values: unknown[]): string | undefined => {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) return value;
  }
  return undefined;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const getWorkspaceId = (ws: Workspace): string | null => {
  if (!ws) return null;
  if (typeof ws.id === "string" && ws.id.trim().length > 0) return ws.id;

  const rawWorkspaceId = ws.workspaceId as unknown;
  if (typeof rawWorkspaceId === "string" && rawWorkspaceId.trim().length > 0)
    return rawWorkspaceId;
  if (typeof rawWorkspaceId === "number") return String(rawWorkspaceId);

  return null;
};

const getWorkspaceName = (ws: Workspace): string | undefined => {
  if (!ws) return undefined;
  const profile = isRecord(ws.company_profile) ? ws.company_profile : undefined;
  return pickString(
    ws.name,
    ws.tradeName,
    ws.trade_name,
    ws.fullName,
    profile?.trade_name,
    profile?.tradeName
  );
};

export function CompanyLandingTemplate() {
  const [companyId, setCompanyId] = useState<string | null>(() =>
    getWorkspaceId(companyService.getWorkspaceValue())
  );
  const [companyName, setCompanyName] = useState<string | undefined>(() =>
    getWorkspaceName(companyService.getWorkspaceValue())
  );

  useEffect(() => {
    const sub = companyService.getWorkspace$().subscribe((ws) => {
      setCompanyId(getWorkspaceId(ws));
      setCompanyName(getWorkspaceName(ws));
    });

    return () => sub.unsubscribe();
  }, []);

  const profilePath = companyId ? `/company/profile/${companyId}` : undefined;
  const profileMeta = companyId
    ? companyName
      ? `Preview: ${companyName}`
      : "View public profile"
    : "Complete setup to unlock";

  const items: ModuleLandingItem[] = [
    {
      id: "setup",
      title: "Company setup",
      description: "Configure company details and onboarding.",
      to: "/company/introduction",
      icon: <Briefcase size={18} />,
    },
    {
      id: "profile",
      title: "Profile",
      description: "Public company profile and details.",
      to: profilePath,
      icon: <User size={18} />,
      meta: profileMeta,
      disabled: !profilePath,
    },
    {
      id: "services",
      title: "Services",
      description: "Manage catalog and pricing.",
      to: "/company/services",
      icon: <Box size={18} />,
    },
    {
      id: "slas",
      title: "SLAs",
      description: "Review SLA performance by employee.",
      to: "/company/slas",
      icon: <CheckSquare size={18} />,
    },
  ];

  return (
    <BaseTemplate
      content={
        <ModuleLanding
          title="Company"
          headerIcon={<Briefcase size={18} />}
          description="Manage profile, services, and performance settings."
          items={items}
        />
      }
    />
  );
}

export default CompanyLandingTemplate;
