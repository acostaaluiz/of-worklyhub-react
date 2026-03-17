import React from "react";
import { i18n as appI18n } from "@core/i18n";
import { BasePage } from "@shared/base/base.page";
import { RegisterTemplate } from "../../templates/register/register.template";
import { usersAuthService } from "@modules/users/services/auth.service";
import { message } from "antd";
import { AppError } from "@core/errors/app-error";
import { loadingService } from "@shared/ui/services/loading.service";
import { navigateTo } from "@core/navigation/navigation.service";

type ResponseModalState = { open: boolean; title: string; description?: string } | undefined;

export class RegisterPage extends BasePage<{}, { initialized: boolean; isLoading: boolean; error?: DataValue; responseModal?: ResponseModalState }> {
  protected override options = {
    title: `${appI18n.t("users.pageTitles.register")} | WorklyHub`,
    requiresAuth: false,
  };

  public state: { initialized: boolean; isLoading: boolean; error?: DataValue; responseModal?: ResponseModalState } = {
    isLoading: false,
    initialized: false,
    error: undefined,
    responseModal: undefined,
  };

  protected async handleRegister(values: {
    name: string;
    email: string;
    password: string;
    confirmPassword?: string;
    acceptTerms?: boolean;
  }) {
    loadingService.show();
    try {
      await this.runAsync(
        async () => {
          try {
            await usersAuthService.register(values.name, values.email, values.password);
            this.setSafeState({ responseModal: { open: true, title: appI18n.t("users.auth.register.modal.title"), description: appI18n.t("users.auth.register.modal.description") } });
          } catch (err) {
            const errObj = err as DataMap | null;
            const candidate = errObj?.code ?? errObj?.name ?? null;
            const code = typeof candidate === "string" ? candidate : null;

            if (code) {
              if (code.includes("email-already-in-use") || code.includes("EMAIL_EXISTS")) {
                message.error(appI18n.t("users.auth.register.feedback.emailInUse"));
                return;
              }
            }

            if (err instanceof AppError) {
              if (err.statusCode === 400) {
                message.error(err.message || appI18n.t("users.auth.register.feedback.invalidData"));
                return;
              }
            }

            message.error(appI18n.t("users.auth.register.feedback.genericError"));
          }
        },
        { setLoading: false }
      );
    } finally {
      loadingService.hide();
    }
  }

  protected closeResponse = () => {
    this.setSafeState({ responseModal: undefined });
  };

  protected confirmResponse = () => {
    this.setSafeState({ responseModal: undefined });
    navigateTo("/login");
  };

  protected override renderPage(): React.ReactNode {
    const response = this.state.responseModal;

    const navigate = (path: string) => navigateTo(path);

    return (
      <RegisterTemplate
        onSubmit={(v) => this.handleRegister(v)}
        onLogin={() => navigate("/login")}
        responseModal={
          response
            ? {
                open: response.open,
                variant: "success",
                title: response.title,
                description: response.description,
                primaryLabel: appI18n.t("users.auth.register.modal.goToLogin"),
                secondaryLabel: appI18n.t("users.auth.register.modal.close"),
                onClose: this.closeResponse,
                onPrimary: this.confirmResponse,
              }
            : undefined
        }
      />
    );
  }
}

export default RegisterPage;

