import React from "react";
import { BasePage } from "@shared/base/base.page";
import { LoginTemplate } from "../../templates/login/login.template";

export class LoginPage extends BasePage {
  protected override options = {
    title: "Login | WorklyHub",
    requiresAuth: false,
  };

  protected override renderPage(): React.ReactNode {
    return <LoginTemplate />;
  }
}

export default LoginPage;
