import { BasePage } from "@shared/base/base.page";
import type { ReactNode } from "react";
import { i18n as appI18n } from "@core/i18n";
import TutorialsTemplate from "@modules/users/presentation/templates/tutorials/tutorials.template";

export class TutorialsPage extends BasePage {
  protected override options = {
    title: `${appI18n.t("users.pageTitles.tutorials")} | WorklyHub`,
    requiresAuth: true,
  };

  protected override renderPage(): ReactNode {
    return <TutorialsTemplate />;
  }
}

export default TutorialsPage;
