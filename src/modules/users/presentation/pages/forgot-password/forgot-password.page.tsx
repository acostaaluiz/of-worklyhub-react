import React from "react";
import { message } from "antd";

import { BasePage } from "@shared/base/base.page";
import { loadingService } from "@shared/ui/services/loading.service";
import { navigateTo } from "@core/navigation/navigation.service";
import { usersAuthService } from "@modules/users/services/auth.service";
import { AppError } from "@core/errors/app-error";

import { ForgotPasswordTemplate } from "../../templates/forgot-password/forgot-password.template";
import ResponseModal, { type ResponseVariant } from "@shared/ui/components/response-modal/response-modal.component";

type ResponseModalState =
  | {
      open: boolean;
      variant?: ResponseVariant;
      title: string;
      description?: string;
    }
  | undefined;

type PageState = {
  initialized: boolean;
  isLoading: boolean;
  error?: DataValue;
  responseModal?: ResponseModalState;
};

export class ForgotPasswordPage extends BasePage<{}, PageState> {
  protected override options = {
    title: "Forgot Password | WorklyHub",
    requiresAuth: false,
  };

  public state: PageState = {
    isLoading: false,
    initialized: false,
    error: undefined,
    responseModal: undefined,
  };

  protected async handleReset(values: { email: string }) {
    loadingService.show();
    try {
      await this.runAsync(
        async () => {
          try {
            await usersAuthService.requestPasswordReset(values.email);
            this.setSafeState({
              responseModal: {
                open: true,
                variant: "success",
                title: "Check your inbox",
                description: `If an account exists for ${values.email}, we sent a reset link.`,
              },
            });
          } catch (err) {
            const errObj = err as DataMap | null;
            const candidate = errObj?.code ?? errObj?.name ?? null;
            const code = typeof candidate === "string" ? candidate : null;

            if (code) {
              if (code.includes("invalid-email")) {
                message.error("Enter a valid email");
                return;
              }
              if (code.includes("user-not-found")) {
                this.setSafeState({
                  responseModal: {
                    open: true,
                    variant: "success",
                    title: "Check your inbox",
                    description: `If an account exists for ${values.email}, we sent a reset link.`,
                  },
                });
                return;
              }
              if (code.includes("too-many-requests")) {
                message.error("Too many attempts. Try again later.");
                return;
              }
            }

            if (err instanceof AppError) {
              if (err.statusCode === 400) {
                message.error(err.message || "Invalid email");
                return;
              }
            }

            message.error("Failed to send reset email");
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
      <>
        <ForgotPasswordTemplate
          onSubmit={(v) => this.handleReset(v)}
          onLogin={() => navigate("/login")}
        />

        {response ? (
          <ResponseModal
            open={response.open}
            variant={response.variant}
            title={response.title}
            description={response.description}
            primaryLabel="Go to Login"
            secondaryLabel="Close"
            onClose={this.closeResponse}
            onPrimary={this.confirmResponse}
          />
        ) : null}
      </>
    );
  }
}

export default ForgotPasswordPage;
