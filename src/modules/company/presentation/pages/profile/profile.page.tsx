import React from "react";
import { i18n as appI18n } from "@core/i18n";
import { BasePage } from "@shared/base/base.page";
import { CompanyProfileTemplate } from "@modules/company/presentation/templates/profile/company-profile.template";

export class CompanyProfilePage extends BasePage {
  protected override options = {
    title: `${appI18n.t("company.pageTitles.profile")} | WorklyHub`,
    requiresAuth: false,
  };

  protected override renderPage(): React.ReactNode {
    return <CompanyProfileTemplate />;
  }
}

export default CompanyProfilePage;
