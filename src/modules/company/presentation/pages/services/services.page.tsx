import React, { type JSX } from "react";
import { BaseTemplate } from "@shared/base/base.template";
import { PrivateFrameLayout } from "@shared/ui/layout/private-frame/private-frame.component";
import ServiceManagerComponent from "@modules/company/presentation/components/company-services-admin/service-manager.component";
import { BasePage } from "@shared/base/base.page";

function CompanyServicesAdminPageContent(): JSX.Element {
  return (
    <BaseTemplate
      content={
        <PrivateFrameLayout>
          <div style={{ padding: 16 }}>
            <h2 style={{ margin: 0 }}>Serviços</h2>
            <div style={{ marginTop: 12 }}>
              <ServiceManagerComponent />
            </div>
          </div>
        </PrivateFrameLayout>
      }
    />
  );
}

export class CompanyServicesAdminPage extends BasePage {
  protected override options = {
    title: "Company Services | WorklyHub",
    requiresAuth: true,
  };

  protected override renderPage(): React.ReactNode {
    return <CompanyServicesAdminPageContent />;
  }
}

export default CompanyServicesAdminPage;
