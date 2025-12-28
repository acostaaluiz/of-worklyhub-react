import React from "react";
import { BasePage } from "@shared/base/base.page";
import { ScheduleTemplate } from "@modules/schedule/presentation/templates/schedule/schedule.template";

export class MyAppointmentsPage extends BasePage {
  protected override options = {
    title: "My Appointments | WorklyHub",
    requiresAuth: true,
  };

  protected override renderPage(): React.ReactNode {
    return <ScheduleTemplate />;
  }
}

export default MyAppointmentsPage;
