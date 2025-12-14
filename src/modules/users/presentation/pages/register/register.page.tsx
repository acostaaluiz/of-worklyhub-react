import React from "react";
import { BasePage } from "@shared/base/base.page";
import { RegisterTemplate } from "../../templates/register/register.template";

export class RegisterPage extends BasePage {
  protected override options = {
    title: "Register | WorklyHub",
    requiresAuth: false,
  };

  protected override renderPage(): React.ReactNode {
    return <RegisterTemplate />;
  }
}

export default RegisterPage;
