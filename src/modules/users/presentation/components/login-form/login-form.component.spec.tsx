import { LoginForm } from "./login-form.component";

describe("LoginForm", () => {
  it("creates element with LoginForm type", () => {
    const element = <LoginForm />;

    expect(element.type).toBe(LoginForm);
  });
});
