import React from "react";
import { i18n as appI18n } from "@core/i18n";
import { BasePage } from "@shared/base/base.page";
import { PeopleLandingTemplate } from "@modules/people/presentation/templates/landing/landing.template";

export class PeopleLandingPage extends BasePage {
  protected override options = {
    title: `${appI18n.t("people.pageTitles.landing")} | WorklyHub`,
    requiresAuth: true,
  };

  protected override renderPage(): React.ReactNode {
    return <PeopleLandingTemplate />;
  }
}

export default PeopleLandingPage;
