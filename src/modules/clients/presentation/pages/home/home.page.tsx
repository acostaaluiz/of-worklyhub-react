import React from "react";
import { i18n as appI18n } from "@core/i18n";
import { BasePage } from "@shared/base/base.page";
import { ClientsHomeTemplate } from "../../templates/home/home.template";

export class ClientsHomePage extends BasePage {
  protected override options = {
    title: `${appI18n.t("clients.pageTitles.home")} | WorklyHub`,
    requiresAuth: true,
  };

  protected override renderPage(): React.ReactNode {
    return <ClientsHomeTemplate />;
  }
}

export default ClientsHomePage;
