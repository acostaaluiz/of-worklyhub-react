import type { ReactNode } from "react";

import { BasePage } from "@shared/base/base.page";
import GrowthLandingTemplate from "@modules/growth/presentation/templates/landing/landing.template";

export class GrowthLandingPage extends BasePage {
  protected override options = {
    title: "Growth | WorklyHub",
    requiresAuth: true,
  };

  protected override renderPage(): ReactNode {
    return <GrowthLandingTemplate />;
  }
}

export default GrowthLandingPage;
