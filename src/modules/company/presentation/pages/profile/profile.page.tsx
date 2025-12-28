import React from "react";
import { BasePage } from "@shared/base/base.page";
import { CompanyProfileTemplate } from "@modules/company/presentation/templates/profile/company-profile.template";

export class CompanyProfilePage extends BasePage {
  protected override options = {
    title: "Company profile | WorklyHub",
    requiresAuth: false,
  };

  protected override renderPage(): React.ReactNode {
    return <CompanyProfileTemplate />;
  }
}

export default CompanyProfilePage;
