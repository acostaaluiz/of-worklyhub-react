import type React from "react";
import { BasePage } from "@shared/base/base.page";
import { CompanyIntroductionTemplate } from "../templates/company-introduction/company-introduction.template";

export class CompanyIntroductionPage extends BasePage {
  protected override options = {
    title: "Company setup | WorklyHub",
    requiresAuth: true,
  };

  protected override renderPage(): React.ReactNode {
    return <CompanyIntroductionTemplate />;
  }
}

export default CompanyIntroductionPage;
