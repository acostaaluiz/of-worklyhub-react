import React from "react";
import { BasePage } from "@shared/base/base.page";
import { PeopleLandingTemplate } from "@modules/people/presentation/templates/landing/landing.template";

export class PeopleLandingPage extends BasePage {
  protected override options = {
    title: "People overview | WorklyHub",
    requiresAuth: true,
  };

  protected override renderPage(): React.ReactNode {
    return <PeopleLandingTemplate />;
  }
}

export default PeopleLandingPage;
