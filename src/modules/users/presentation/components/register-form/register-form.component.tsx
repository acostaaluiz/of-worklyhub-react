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

export type RegisterFormCopy = {
  title: string;
  subtitle: string;
  fullNameLabel: string;
  fullNameRequired: string;
  fullNameMin: string;
  fullNamePlaceholder: string;
  emailLabel: string;
  emailRequired: string;
  emailInvalid: string;
  emailPlaceholder: string;
  passwordLabel: string;
  passwordRequired: string;
  passwordMin: string;
  passwordPlaceholder: string;
  confirmPasswordLabel: string;
  confirmPasswordRequired: string;
  confirmPasswordMismatch: string;
  confirmPasswordPlaceholder: string;
  acceptTermsError: string;
  acceptTermsPrefix: string;
  termsLink: string;
  and: string;
  privacyLink: string;
  submit: string;
  continueWith: string;
  googleAriaLabel: string;
  facebookAriaLabel: string;
  alreadyHaveAccount: string;
  signIn: string;
};

import { BaseComponent } from "@shared/base/base.component";
import type { BaseProps } from "@shared/base/interfaces/base-props.interface";
import { navigateTo } from "@core/navigation/navigation.service";

type Props = BaseProps & {
  onSubmit?: (values: RegisterFormValues) => Promise<void>;
  onLogin?: () => void;
  copy: RegisterFormCopy;
  languageControl?: React.ReactNode;
};

export class RegisterForm extends BaseComponent<Props> {
  private formRef = React.createRef<FormInstance<RegisterFormValues>>();

  protected override renderView(): React.ReactNode {
    const { copy } = this.props;
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
            {this.props.languageControl ? (
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                {this.props.languageControl}
              </div>
            ) : null}

            <TitleBlock>
              <Typography.Title level={2} style={{ margin: 0 }}>
                {copy.title}
              </Typography.Title>
              <Typography.Text type="secondary">
                {copy.subtitle}
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
                label={copy.fullNameLabel}
                name="name"
                rules={[
                  { required: true, message: copy.fullNameRequired },
                  { min: 2, message: copy.fullNameMin },
                ]}
              >
                <Input
                  size="large"
                  placeholder={copy.fullNamePlaceholder}
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
                label={copy.emailLabel}
                name="email"
                rules={[
                  { required: true, message: copy.emailRequired },
                  { type: "email", message: copy.emailInvalid },
                ]}
              >
                <Input
                  size="large"
                  placeholder={copy.emailPlaceholder}
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
                label={copy.passwordLabel}
                name="password"
                rules={[
                  { required: true, message: copy.passwordRequired },
                  { min: 6, message: copy.passwordMin },
                ]}
                hasFeedback
              >
                <Input.Password
                  size="large"
                  placeholder={copy.passwordPlaceholder}
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
                label={copy.confirmPasswordLabel}
                name="confirmPassword"
                dependencies={["password"]}
                hasFeedback
                rules={[
                  { required: true, message: copy.confirmPasswordRequired },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const password = getFieldValue("password");
                      if (!value || value === password) return Promise.resolve();
                      return Promise.reject(new Error(copy.confirmPasswordMismatch));
                    },
                  }),
                ]}
              >
                <Input.Password
                  size="large"
                  placeholder={copy.confirmPasswordPlaceholder}
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
                              copy.acceptTermsError
                            )
                          ),
                  },
                ]}
              >
                <Checkbox data-cy="register-accept-terms">
                  <Typography.Text type="secondary">
                    {copy.acceptTermsPrefix}{" "}
                    <Typography.Link
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        navigateTo("/terms");
                      }}
                    >
                      {copy.termsLink}
                    </Typography.Link>{" "}
                    {copy.and}{" "}
                    <Typography.Link
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        navigateTo("/privacy");
                      }}
                    >
                      {copy.privacyLink}
                    </Typography.Link>
                    .
                  </Typography.Text>
                </Checkbox>
              </Form.Item>

              <PrimaryButton type="primary" htmlType="submit" size="large" block data-cy="register-submit-button">
                <ButtonIcon aria-hidden>
                  <UserPlus size={18} />
                </ButtonIcon>
                {copy.submit}
              </PrimaryButton>

              <Divider
                plain
                style={{ margin: "var(--space-6) 0 var(--space-5)" }}
              >
                {copy.continueWith}
              </Divider>

              <SocialRow>
                <SocialButton size="large" aria-label={copy.googleAriaLabel}>
                  <GoogleIcon size={18} />
                </SocialButton>

                <SocialButton size="large" aria-label={copy.facebookAriaLabel}>
                  <FacebookIcon size={18} />
                </SocialButton>
              </SocialRow>

              <BottomRow>
                <Typography.Text type="secondary">
                  {copy.alreadyHaveAccount}
                </Typography.Text>{" "}
                <Typography.Link onClick={() => this.props.onLogin?.()} data-cy="register-signin-link">
                  {copy.signIn}
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
