import type { ReactNode } from "react";

import { i18n as appI18n } from "@core/i18n";
import { BasePage } from "@shared/base/base.page";
import GrowthLandingTemplate from "@modules/growth/presentation/templates/landing/landing.template";

export class GrowthLandingPage extends BasePage {
  protected override options = {
    title: `${appI18n.t("growth.pageTitles.landing")} | WorklyHub`,
    requiresAuth: true,
  };

  protected override renderPage(): ReactNode {
    return <GrowthLandingTemplate />;
  }
}

export default GrowthLandingPage;
