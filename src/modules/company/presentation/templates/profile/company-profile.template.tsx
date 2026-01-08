import { useEffect, useState } from "react";
import { BaseTemplate } from "@shared/base/base.template";
import { PrivateFrameLayout } from "@shared/ui/layout/private-frame/private-frame.component";

import { CompanyOverview } from "@modules/company/presentation/components/company-overview/company-overview.component";
import { CompanyServices } from "@modules/company/presentation/components/company-services/company-services.component";
import { CompanyReviews } from "@modules/company/presentation/components/company-reviews/company-reviews.component";
import type { CompanyProfileModel } from "@modules/company/interfaces/company.model";
import { useParams } from "react-router-dom";
import TemplateShell from "./company-profile.template.styles";
import { companyService } from "@modules/company/services/company.service";
import type { ServiceModel } from "@modules/clients/interfaces/service.model";

export function CompanyProfileTemplate() {
  const { id } = useParams();
  const [profile, setProfile] = useState<CompanyProfileModel | null>(null);

  useEffect(() => {
    // subscribe to workspace/profile available in companyService
    console.debug("[CompanyProfileTemplate] effect start, route id=", id);
    const sub = companyService.getWorkspace$().subscribe((ws) => {
      console.debug("[CompanyProfileTemplate] workspace update:", ws);
      if (!ws) {
        setProfile(null);
        return;
      }

      const providerId = String((ws as any).id ?? "");
      const providerName =
        (ws as any).name ?? (ws as any).tradeName ?? (ws as any).trade_name ?? (ws as any).fullName ?? "";

      const companyProfile = (ws as any).company_profile ?? (ws as any).companyProfile ?? {};

      const profileFromWs: CompanyProfileModel = {
        id: providerId,
        name: providerName,
        description: companyProfile.description ?? (ws as any).description ?? undefined,
        address: (ws as any).address ?? (ws as any).location ?? undefined,
        imageUrl: (ws as any).imageUrl ?? undefined,
        phone: (ws as any).phone ?? undefined,
        rating: typeof (ws as any).rating === "number" ? (ws as any).rating : undefined,
        reviewsCount: typeof (ws as any).reviewsCount === "number" ? (ws as any).reviewsCount : undefined,
        services: Array.isArray((ws as any).services)
          ? ((ws as any).services as any[]).map((s) => {
              const priceCents = (s.price_cents as number) ?? (s.priceCents as number) ?? (s.price as number);
              return {
                id: String(s.id ?? s.serviceId ?? s.name ?? Math.random()),
                title: s.name ?? s.title ?? "",
                description: s.description ?? undefined,
                providerId,
                providerName,
                priceCents: typeof priceCents === "number" ? priceCents : undefined,
                priceFormatted:
                  typeof priceCents === "number"
                    ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(priceCents / 100)
                    : undefined,
                tags: Array.isArray(s.tags) ? s.tags.map((t: any) => String(t)) : undefined,
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
        <PrivateFrameLayout>
          <TemplateShell>
            {profile ? (
              <>
                <CompanyOverview profile={profile} />
                <CompanyServices services={profile.services} />
                <CompanyReviews />
              </>
            ) : null}
          </TemplateShell>
        </PrivateFrameLayout>
      }
    />
  );
}

export default CompanyProfileTemplate;
