import React from "react";
import { i18n as appI18n } from "@core/i18n";
import { BasePage } from "@shared/base/base.page";
import { LoginTemplate } from "../../templates/login/login.template";
import { usersAuthService } from "@modules/users/services/auth.service";
import { message } from "antd";
import { AppError } from "@core/errors/app-error";
import { loadingService } from "@shared/ui/services/loading.service";
import { navigateTo } from "@core/navigation/navigation.service";

type LoginValues = { email: string; password: string };

export class LoginPage extends BasePage {
  protected override options = {
    title: `${appI18n.t("users.pageTitles.login")} | WorklyHub`,
    requiresAuth: false,
  };

  protected override renderPage(): React.ReactNode {
    const navigate = (path: string) => navigateTo(path);

    const handleLogin = async (values: LoginValues) => {
      loadingService.show();
      try {
        await this.runAsync(
          async () => {
            try {
              await usersAuthService.signIn(values.email, values.password);
              // navigation will be handled by the auth guard (RedirectIfAuthenticated)
            } catch (err) {
              const errObj = err as DataMap | null;
              const candidate = errObj?.code ?? errObj?.name ?? null;
              const code = typeof candidate === "string" ? candidate : null;

              if (code) {
                if (code.includes("wrong-password") || code.includes("INVALID_PASSWORD") || code.includes("invalid-password")) {
                  message.error(appI18n.t("users.auth.login.feedback.invalidCredentials"));
                  return;
                }
                if (code.includes("user-not-found") || code.includes("no-user")) {
                  message.error(appI18n.t("users.auth.login.feedback.userNotFound"));
                  return;
                }
                if (code.includes("too-many-requests")) {
                  message.error(appI18n.t("users.auth.login.feedback.tooManyAttempts"));
                  return;
                }
              }

              if (err instanceof AppError) {
                if (err.statusCode === 401) {
                  message.error(appI18n.t("users.auth.login.feedback.unauthorized"));
                  return;
                }
              }

              message.error(appI18n.t("users.auth.login.feedback.genericError"));
            }
          },
          { setLoading: false }
        );
      } finally {
        loadingService.hide();
      }
    };

    return (
      <LoginTemplate
        onSubmit={handleLogin}
        onRegister={() => navigate("/register")}
        onForgotPassword={() => navigate("/forgot-password")}
      />
    );
  }
}

export default LoginPage;

