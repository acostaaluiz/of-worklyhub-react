import React from "react";
import { Divider, Form, Input, Space, Typography } from "antd";
import type { FormInstance } from "antd";
import { Eye, EyeOff, Lock, LogIn, Mail } from "lucide-react";

import {
  BottomRow,
  CardBody,
  FormCard,
  PrimaryButton,
  SocialWideButton,
  SocialRow,
} from "../presentation.styles";

import { GoogleIcon } from "@shared/ui/components/icon/brand/google.icon";
import { ActionsRow, ButtonIcon, FieldIcon, TitleBlock } from "@shared/styles/global";

import { BaseComponent } from "@shared/base/base.component";
import type { BaseProps } from "@shared/base/interfaces/base-props.interface";

type LoginFormValues = {
  email: string;
  password: string;
};

export type LoginFormCopy = {
  title: string;
  subtitle: string;
  emailLabel: string;
  emailRequired: string;
  emailInvalid: string;
  emailPlaceholder: string;
  passwordLabel: string;
  passwordRequired: string;
  passwordMin: string;
  passwordPlaceholder: string;
  forgotPassword: string;
  submit: string;
  continueWith: string;
  googleAriaLabel: string;
  notMember: string;
  registerNow: string;
};

type Props = BaseProps & {
  onSubmit?: (values: LoginFormValues) => Promise<void>;
  onGoogleSignIn?: () => Promise<void>;
  onRegister?: () => void;
  onForgotPassword?: () => void;
  copy: LoginFormCopy;
  languageControl?: React.ReactNode;
};

export class LoginForm extends BaseComponent<Props> {
  private formRef = React.createRef<FormInstance<LoginFormValues>>();

  protected override renderView(): React.ReactNode {
    const { copy } = this.props;
    const handleSubmit = (_values: LoginFormValues) => {
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

            <Form<LoginFormValues>
              ref={this.formRef}
              layout="vertical"
              initialValues={{ email: "", password: "" }}
              onFinish={handleSubmit}
              requiredMark={false}
              style={{ width: "100%" }}
              data-cy="login-form"
            >
              <Form.Item<LoginFormValues>
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
                  data-cy="login-email-input"
                  prefix={
                    <FieldIcon aria-hidden>
                      <Mail size={18} />
                    </FieldIcon>
                  }
                />
              </Form.Item>

              <Form.Item<LoginFormValues>
                label={copy.passwordLabel}
                name="password"
                rules={[
                  { required: true, message: copy.passwordRequired },
                  { min: 6, message: copy.passwordMin },
                ]}
              >
                <Input.Password
                  size="large"
                  placeholder={copy.passwordPlaceholder}
                  autoComplete="current-password"
                  data-cy="login-password-input"
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

              <ActionsRow>
                <Typography.Link onClick={() => this.props.onForgotPassword?.()}>
                  {copy.forgotPassword}
                </Typography.Link>
              </ActionsRow>

              <PrimaryButton type="primary" htmlType="submit" size="large" block data-cy="login-submit-button">
                <ButtonIcon aria-hidden>
                  <LogIn size={18} />
                </ButtonIcon>
                {copy.submit}
              </PrimaryButton>

              <Divider
                plain
                style={{ margin: "var(--space-6) 0 var(--space-5)" }}
              >
                {copy.continueWith}
              </Divider>

              <SocialRow style={{ margin: "var(--space-3) 0 var(--space-4)" }}>
                <SocialWideButton
                  size="large"
                  aria-label={copy.googleAriaLabel}
                  data-cy="login-google-button"
                  onClick={() =>
                    this.runAsync(async () => {
                      if (!this.props.onGoogleSignIn) return;
                      await this.props.onGoogleSignIn();
                    }, { setLoading: false })
                  }
                >
                  <GoogleIcon size={18} />
                  <span>{copy.googleAriaLabel}</span>
                </SocialWideButton>
              </SocialRow>

              <BottomRow>
                <Typography.Text type="secondary">{copy.notMember}</Typography.Text>{" "}
                  <Typography.Link onClick={() => this.props.onRegister?.()} data-cy="login-register-link">
                    {copy.registerNow}
                  </Typography.Link>
              </BottomRow>
            </Form>
          </Space>
        </CardBody>
      </FormCard>
    );
  }
}

export default LoginForm;
