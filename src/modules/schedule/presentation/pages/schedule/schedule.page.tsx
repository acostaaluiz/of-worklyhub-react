import React from "react";
import { BasePage } from "@shared/base/base.page";
import { ScheduleTemplate } from "../../templates/schedule/schedule.template";

export class SchedulePage extends BasePage {
  protected override options = {
    title: "Schedule | WorklyHub",
    requiresAuth: true,
  };

  protected override renderPage(): React.ReactNode {
    return <ScheduleTemplate />;
  }
}

export default SchedulePage;
