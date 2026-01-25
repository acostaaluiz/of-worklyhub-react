import React from "react";
import { BasePage } from "@shared/base/base.page";
import { ScheduleLandingTemplate } from "@modules/schedule/presentation/templates/landing/landing.template";

export class ScheduleLandingPage extends BasePage {
  protected override options = {
    title: "Schedule overview | WorklyHub",
    requiresAuth: true,
  };

  protected override renderPage(): React.ReactNode {
    return <ScheduleLandingTemplate />;
  }
}

export default ScheduleLandingPage;
