import React from "react";
import { BasePage } from "@shared/base/base.page";
import { RegisterTemplate } from "../../templates/register/register.template";
import { usersAuthService } from "@modules/users/services/auth.service";
import { message } from "antd";
import { AppError } from "@core/errors/app-error";

export class RegisterPage extends BasePage {
  protected override options = {
    title: "Register | WorklyHub",
    requiresAuth: false,
  };

  protected override renderPage(): React.ReactNode {
    const handleRegister = async (values: { name: string; email: string; password: string }) => {
      await this.runAsync(async () => {
        try {
          await usersAuthService.register(values.name, values.email, values.password);
          message.success("Account created. You can now sign in.");
          window.location.href = "/login";
        } catch (err: unknown) {
          const errObj = err as Record<string, unknown> | null;
          const candidate = errObj?.code ?? errObj?.name ?? null;
          const code = typeof candidate === "string" ? candidate : null;

          if (code) {
            if (code.includes("email-already-in-use") || code.includes("EMAIL_EXISTS")) {
              message.error("Email already in use");
              return;
            }
          }

          if (err instanceof AppError) {
            if (err.statusCode === 400) {
              message.error(err.message || "Invalid data");
              return;
            }
          }

          message.error("Registration failed");
        }
      });
    };

    return <RegisterTemplate onSubmit={handleRegister} />;
  }
}

export default RegisterPage;
