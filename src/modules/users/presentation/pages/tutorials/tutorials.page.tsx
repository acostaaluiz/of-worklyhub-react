import { BasePage } from "@shared/base/base.page";
import type { ReactNode } from "react";
import TutorialsTemplate from "@modules/users/presentation/templates/tutorials/tutorials.template";

export class TutorialsPage extends BasePage {
  protected override options = {
    title: "Product tutorials | WorklyHub",
    requiresAuth: true,
  };

  protected override renderPage(): ReactNode {
    return <TutorialsTemplate />;
  }
}

export default TutorialsPage;
