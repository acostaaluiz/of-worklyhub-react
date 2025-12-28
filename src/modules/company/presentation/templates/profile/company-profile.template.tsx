import { useEffect, useState } from "react";
import { BaseTemplate } from "@shared/base/base.template";
import { PrivateFrameLayout } from "@shared/ui/layout/private-frame/private-frame.component";

import { CompanyOverview } from "@modules/company/presentation/components/company-overview/company-overview.component";
import { CompanyServices } from "@modules/company/presentation/components/company-services/company-services.component";
import { CompanyReviews } from "@modules/company/presentation/components/company-reviews/company-reviews.component";
import { getCompanyProfile } from "@modules/company/services/company.service";
import type { CompanyProfileModel } from "@modules/company/interfaces/company.model";
import { useParams } from "react-router-dom";
import TemplateShell from "./company-profile.template.styles";

export function CompanyProfileTemplate() {
  const { id } = useParams();
  const [profile, setProfile] = useState<CompanyProfileModel | null>(null);

  useEffect(() => {
    (async () => {
      if (!id) return;
      const data = await getCompanyProfile(id as string);
      setProfile(data);
    })();
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
