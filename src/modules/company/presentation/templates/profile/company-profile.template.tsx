import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { formatMoneyFromCents } from "@core/utils/mask";
import { BaseTemplate } from "@shared/base/base.template";
import type { ServiceModel } from "@modules/clients/interfaces/service.model";
import type { CompanyProfileModel } from "@modules/company/interfaces/company.model";
import { companyService } from "@modules/company/services/company.service";
import { CompanyOverview } from "@modules/company/presentation/components/company-overview/company-overview.component";
import { CompanyServices } from "@modules/company/presentation/components/company-services/company-services.component";
import { CompanyReviews } from "@modules/company/presentation/components/company-reviews/company-reviews.component";
import TemplateShell from "./company-profile.template.styles";

type WorkspaceServiceLike = {
  id?: string;
  serviceId?: string;
  name?: string;
  title?: string;
  description?: string;
  price_cents?: number;
  priceCents?: number;
  price?: number;
  tags?: Array<string | number | boolean>;
};

type WorkspaceProfileLike = {
  description?: string;
  wallpaperUrl?: string;
  wallpaper_url?: string;
};

type WorkspaceLike = {
  id?: string;
  name?: string;
  tradeName?: string;
  trade_name?: string;
  fullName?: string;
  company_profile?: WorkspaceProfileLike;
  companyProfile?: WorkspaceProfileLike;
  description?: string;
  address?: string;
  location?: string;
  imageUrl?: string;
  wallpaperUrl?: string;
  wallpaper_url?: string;
  phone?: string;
  rating?: number;
  reviewsCount?: number;
  services?: WorkspaceServiceLike[];
};

export function CompanyProfileTemplate() {
  const { id } = useParams();
  const [profile, setProfile] = useState<CompanyProfileModel | null>(null);

  useEffect(() => {
    // subscribe to workspace/profile available in companyService
    console.debug("[CompanyProfileTemplate] effect start, route id=", id);
    const sub = companyService.getWorkspace$().subscribe((ws) => {
      console.debug("[CompanyProfileTemplate] workspace update:", ws);
      const workspace = ws as WorkspaceLike | null;

      if (!workspace) {
        setProfile(null);
        return;
      }

      const providerId = String(workspace.id ?? "");
      const providerName =
        workspace.name ??
        workspace.tradeName ??
        workspace.trade_name ??
        workspace.fullName ??
        "";

      const companyProfile =
        workspace.company_profile ?? workspace.companyProfile ?? {};

      const profileFromWs: CompanyProfileModel = {
        id: providerId,
        name: providerName,
        description: companyProfile.description ?? workspace.description ?? undefined,
        address: workspace.address ?? workspace.location ?? undefined,
        imageUrl: workspace.imageUrl ?? undefined,
        wallpaperUrl:
          companyProfile.wallpaperUrl ??
          companyProfile.wallpaper_url ??
          workspace.wallpaperUrl ??
          workspace.wallpaper_url ??
          undefined,
        phone: workspace.phone ?? undefined,
        rating:
          typeof workspace.rating === "number" ? workspace.rating : undefined,
        reviewsCount:
          typeof workspace.reviewsCount === "number"
            ? workspace.reviewsCount
            : undefined,
        services: Array.isArray(workspace.services)
          ? workspace.services.map((s) => {
              const priceCents = s.price_cents ?? s.priceCents ?? s.price;
              return {
                id: String(s.id ?? s.serviceId ?? s.name ?? Math.random()),
                title: s.name ?? s.title ?? "",
                description: s.description ?? undefined,
                providerId,
                providerName,
                priceCents: typeof priceCents === "number" ? priceCents : undefined,
                priceFormatted:
                  typeof priceCents === "number"
                    ? formatMoneyFromCents(priceCents)
                    : undefined,
                tags: Array.isArray(s.tags)
                  ? s.tags.map((t) => String(t))
                  : undefined,
              } as ServiceModel;
            })
          : undefined,
      };

      console.debug("[CompanyProfileTemplate] mapped profile:", profileFromWs);

      // if route id provided, ensure it matches workspace id; otherwise use workspace directly
      if (!id) {
        console.debug("[CompanyProfileTemplate] setting profile (no route id)");
        setProfile(profileFromWs);
        return;
      }

      if (id === providerId) {
        console.debug("[CompanyProfileTemplate] setting profile (id match)", providerId);
        setProfile(profileFromWs);
      } else {
        console.debug("[CompanyProfileTemplate] route id does not match workspace id", { routeId: id, workspaceId: providerId });
      }
    });

    return () => {
      console.debug("[CompanyProfileTemplate] unsubscribing workspace listener");
      sub.unsubscribe();
    };
  }, [id]);

  return (
    <BaseTemplate
      content={
        <>
          <TemplateShell>
            {profile ? (
              <>
                <CompanyOverview profile={profile} />
                <CompanyServices services={profile.services} />
                <CompanyReviews />
              </>
            ) : null}
          </TemplateShell>
        </>
      }
    />
  );
}

export default CompanyProfileTemplate;
