import React from "react";
import { BasePage } from "@shared/base/base.page";
import { ClientsHomeTemplate } from "../../templates/home/home.template";

export class ClientsHomePage extends BasePage {
  protected override options = {
    title: "Clients | WorklyHub",
    requiresAuth: true,
  };

  protected override renderPage(): React.ReactNode {
    return <ClientsHomeTemplate />;
  }
}

export default ClientsHomePage;
