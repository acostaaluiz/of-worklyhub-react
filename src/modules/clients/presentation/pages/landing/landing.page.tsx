import React from "react";
import { BasePage } from "@shared/base/base.page";
import { ClientsLandingTemplate } from "@modules/clients/presentation/templates/landing/landing.template";

export class ClientsLandingPage extends BasePage {
  protected override options = {
    title: "Clients overview | WorklyHub",
    requiresAuth: true,
  };

  protected override renderPage(): React.ReactNode {
    return <ClientsLandingTemplate />;
  }
}

export default ClientsLandingPage;
