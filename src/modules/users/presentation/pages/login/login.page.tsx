import React from "react";
import { BasePage } from "@shared/base/base.page";
import { LoginTemplate } from "../../templates/login/login.template";
import { usersAuthService } from "@modules/users/services/auth.service";
import { message } from "antd";
import { AppError } from "@core/errors/app-error";

type LoginValues = { email: string; password: string };

export class LoginPage extends BasePage {
  protected override options = {
    title: "Login | WorklyHub",
    requiresAuth: false,
  };

  protected override renderPage(): React.ReactNode {
    const handleLogin = async (values: LoginValues) => {
      await this.runAsync(async () => {
        try {
          await usersAuthService.signIn(values.email, values.password);
          // redirect post-login to private home
          window.location.href = "/home";
        } catch (err: unknown) {
          const errObj = err as Record<string, unknown> | null;
          const candidate = errObj?.code ?? errObj?.name ?? null;
          const code = typeof candidate === "string" ? candidate : null;

          if (code) {
            if (code.includes("wrong-password") || code.includes("INVALID_PASSWORD") || code.includes("invalid-password")) {
              message.error("Email or password incorrect");
              return;
            }
            if (code.includes("user-not-found") || code.includes("no-user")) {
              message.error("User not found");
              return;
            }
            if (code.includes("too-many-requests")) {
              message.error("Too many attempts. Try again later.");
              return;
            }
          }

          if (err instanceof AppError) {
            if (err.statusCode === 401) {
              message.error("Authentication failed — please login again");
              return;
            }
          }

          message.error("Authentication failed");
        }
      });
    };

    return <LoginTemplate onSubmit={handleLogin} />;
  }
}

export default LoginPage;
