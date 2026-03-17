import React from "react";

import { i18n as appI18n } from "@core/i18n";
import { BasePage } from "@shared/base/base.page";
import { ScheduleLandingTemplate } from "@modules/schedule/presentation/templates/landing/landing.template";

export class ScheduleLandingPage extends BasePage {
  protected override options = {
    title: `${appI18n.t("schedule.pageTitles.landing")} | WorklyHub`,
    requiresAuth: true,
  };

  protected override renderPage(): React.ReactNode {
    return <ScheduleLandingTemplate />;
  }
}

export default ScheduleLandingPage;
