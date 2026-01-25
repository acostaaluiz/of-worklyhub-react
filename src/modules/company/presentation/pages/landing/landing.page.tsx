import React from "react";
import { BasePage } from "@shared/base/base.page";
import { CompanyLandingTemplate } from "@modules/company/presentation/templates/landing/landing.template";

export class CompanyLandingPage extends BasePage {
  protected override options = {
    title: "Company overview | WorklyHub",
    requiresAuth: true,
  };

  protected override renderPage(): React.ReactNode {
    return <CompanyLandingTemplate />;
  }
}

export default CompanyLandingPage;
