import { LoginForm } from "./login-form.component";

describe("LoginForm", () => {
  it("creates element with LoginForm type", () => {
    const element = (
      <LoginForm
        copy={{
          title: "Login",
          subtitle: "Subtitle",
          emailLabel: "Email",
          emailRequired: "Required",
          emailInvalid: "Invalid",
          emailPlaceholder: "you@company.com",
          passwordLabel: "Password",
          passwordRequired: "Required",
          passwordMin: "Min",
          passwordPlaceholder: "Password",
          forgotPassword: "Forgot",
          submit: "Submit",
          continueWith: "Continue with",
          googleAriaLabel: "Google",
          notMember: "Not member",
          registerNow: "Register",
        }}
      />
    );

    expect(element.type).toBe(LoginForm);
  });
});
