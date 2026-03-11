import React from "react";
import { Checkbox, Divider, Form, Input, Space, Typography } from "antd";
import type { FormInstance } from "antd";
import { Eye, EyeOff, Lock, Mail, UserPlus, User } from "lucide-react";

import {
  BottomRow,
  CardBody,
  FormCard,
  PrimaryButton,
  SocialButton,
  SocialRow,
} from "../presentation.styles";

import { GoogleIcon } from "@shared/ui/components/icon/brand/google.icon";
import { FacebookIcon } from "@shared/ui/components/icon/brand/facebook.icon";
import { ButtonIcon, FieldIcon, TitleBlock } from "@shared/styles/global";

type RegisterFormValues = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
};

import { BaseComponent } from "@shared/base/base.component";
import type { BaseProps } from "@shared/base/interfaces/base-props.interface";
import { navigateTo } from "@core/navigation/navigation.service";

type Props = BaseProps & {
  onSubmit?: (values: RegisterFormValues) => Promise<void>;
  onLogin?: () => void;
};

export class RegisterForm extends BaseComponent<Props> {
  private formRef = React.createRef<FormInstance<RegisterFormValues>>();

  protected override renderView(): React.ReactNode {
    const handleSubmit = (_values: RegisterFormValues) => {
      const { onSubmit } = this.props;
      if (!onSubmit) return;

      return this.runAsync(async () => {
        try {
          await onSubmit(_values);
        } catch (err) {
          this.setError(err);
        }
      });
    };

    return (
      <FormCard className="surface" styles={{ body: { padding: 0 } }}>
        <CardBody>
          <Space orientation="vertical" size={16} style={{ width: "100%" }}>
            <TitleBlock>
              <Typography.Title level={2} style={{ margin: 0 }}>
                Create account
              </Typography.Title>
              <Typography.Text type="secondary">
                Create your account in a few seconds.
              </Typography.Text>
            </TitleBlock>

            <Form<RegisterFormValues>
              ref={this.formRef}
              layout="vertical"
              initialValues={{
                name: "",
                email: "",
                password: "",
                confirmPassword: "",
                acceptTerms: false,
              }}
              onFinish={handleSubmit}
              requiredMark={false}
              style={{ width: "100%" }}
              data-cy="register-form"
            >
              <Form.Item<RegisterFormValues>
                label="Full name"
                name="name"
                rules={[
                  { required: true, message: "Name is required" },
                  { min: 2, message: "Name must be at least 2 characters" },
                ]}
              >
                <Input
                  size="large"
                  placeholder="Enter your full name"
                  autoComplete="name"
                  data-cy="register-name-input"
                  prefix={
                    <FieldIcon aria-hidden>
                      <User size={18} />
                    </FieldIcon>
                  }
                />
              </Form.Item>

              <Form.Item<RegisterFormValues>
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "Email is required" },
                  { type: "email", message: "Enter a valid email" },
                ]}
              >
                <Input
                  size="large"
                  placeholder="Enter your email"
                  autoComplete="email"
                  data-cy="register-email-input"
                  prefix={
                    <FieldIcon aria-hidden>
                      <Mail size={18} />
                    </FieldIcon>
                  }
                />
              </Form.Item>

              <Form.Item<RegisterFormValues>
                label="Password"
                name="password"
                rules={[
                  { required: true, message: "Password is required" },
                  { min: 6, message: "Password must be at least 6 characters" },
                ]}
                hasFeedback
              >
                <Input.Password
                  size="large"
                  placeholder="Create a password"
                  autoComplete="new-password"
                  data-cy="register-password-input"
                  prefix={
                    <FieldIcon aria-hidden>
                      <Lock size={18} />
                    </FieldIcon>
                  }
                  iconRender={(visible) =>
                    visible ? <Eye size={18} /> : <EyeOff size={18} />
                  }
                />
              </Form.Item>

              <Form.Item<RegisterFormValues>
                label="Confirm password"
                name="confirmPassword"
                dependencies={["password"]}
                hasFeedback
                rules={[
                  { required: true, message: "Please confirm your password" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const password = getFieldValue("password");
                      if (!value || value === password) return Promise.resolve();
                      return Promise.reject(new Error("Passwords do not match"));
                    },
                  }),
                ]}
              >
                <Input.Password
                  size="large"
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  data-cy="register-confirm-password-input"
                  prefix={
                    <FieldIcon aria-hidden>
                      <Lock size={18} />
                    </FieldIcon>
                  }
                  iconRender={(visible) =>
                    visible ? <Eye size={18} /> : <EyeOff size={18} />
                  }
                />
              </Form.Item>

              <Form.Item<RegisterFormValues>
                name="acceptTerms"
                valuePropName="checked"
                rules={[
                  {
                    validator: (_, value) =>
                      value
                        ? Promise.resolve()
                        : Promise.reject(
                            new Error(
                              "You must accept the Terms of Service and Privacy Policy"
                            )
                          ),
                  },
                ]}
              >
                <Checkbox data-cy="register-accept-terms">
                  <Typography.Text type="secondary">
                    I agree to the{" "}
                    <Typography.Link
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        navigateTo("/terms");
                      }}
                    >
                      Terms of Service
                    </Typography.Link>{" "}
                    and{" "}
                    <Typography.Link
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        navigateTo("/privacy");
                      }}
                    >
                      Privacy Policy
                    </Typography.Link>
                    .
                  </Typography.Text>
                </Checkbox>
              </Form.Item>

              <PrimaryButton type="primary" htmlType="submit" size="large" block data-cy="register-submit-button">
                <ButtonIcon aria-hidden>
                  <UserPlus size={18} />
                </ButtonIcon>
                Create account
              </PrimaryButton>

              <Divider
                plain
                style={{ margin: "var(--space-6) 0 var(--space-5)" }}
              >
                Or continue with
              </Divider>

              <SocialRow>
                <SocialButton size="large" aria-label="Continue with Google">
                  <GoogleIcon size={18} />
                </SocialButton>

                <SocialButton size="large" aria-label="Continue with Facebook">
                  <FacebookIcon size={18} />
                </SocialButton>
              </SocialRow>

              <BottomRow>
                <Typography.Text type="secondary">
                  Already have an account?
                </Typography.Text>{" "}
                <Typography.Link onClick={() => this.props.onLogin?.()} data-cy="register-signin-link">
                  Sign in
                </Typography.Link>
              </BottomRow>
            </Form>
          </Space>
        </CardBody>
      </FormCard>
    );
  }
}

export default RegisterForm;
