import { useEffect, useState } from "react";
import { Briefcase, Box, CheckSquare, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { BaseTemplate } from "@shared/base/base.template";
import {
  ModuleLanding,
  type ModuleLandingItem,
} from "@shared/ui/components/module-landing/module-landing.component";
import { companyService, type Workspace } from "@modules/company/services/company.service";

const pickString = (...values: DataValue[]): string | undefined => {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) return value;
  }
  return undefined;
};

const isRecord = (value: DataValue): value is DataMap =>
  typeof value === "object" && value !== null;

const getWorkspaceId = (ws: Workspace): string | null => {
  if (!ws) return null;
  if (typeof ws.id === "string" && ws.id.trim().length > 0) return ws.id;

  const rawWorkspaceId = ws.workspaceId as DataValue;
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
  const { t } = useTranslation();

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
      ? t("company.landing.items.profile.meta.preview", { companyName })
      : t("company.landing.items.profile.meta.viewPublic")
    : t("company.landing.items.profile.meta.completeSetup");

  const items: ModuleLandingItem[] = [
    {
      id: "setup",
      title: t("company.landing.items.setup.title"),
      description: t("company.landing.items.setup.description"),
      to: "/company/introduction",
      icon: <Briefcase size={18} />,
    },
    {
      id: "profile",
      title: t("company.landing.items.profile.title"),
      description: t("company.landing.items.profile.description"),
      to: profilePath,
      icon: <User size={18} />,
      meta: profileMeta,
      disabled: !profilePath,
    },
    {
      id: "services",
      title: t("company.landing.items.services.title"),
      description: t("company.landing.items.services.description"),
      to: "/company/services",
      icon: <Box size={18} />,
    },
    {
      id: "slas",
      title: t("company.landing.items.slas.title"),
      description: t("company.landing.items.slas.description"),
      to: "/company/slas",
      icon: <CheckSquare size={18} />,
    },
  ];

  return (
    <BaseTemplate
      content={
        <ModuleLanding
          title={t("company.landing.title")}
          headerIcon={<Briefcase size={18} />}
          description={t("company.landing.description")}
          items={items}
        />
      }
    />
  );
}

export default CompanyLandingTemplate;
