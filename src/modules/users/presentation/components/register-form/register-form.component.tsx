import React from "react";
import { Divider, Form, Input, Space, Typography } from "antd";
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
import { ActionsRow, ButtonIcon, FieldIcon, HelperCenter, TitleBlock } from "@shared/styles/global";

type RegisterFormValues = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

import { BaseComponent } from "@shared/base/base.component";
import type { BaseProps } from "@shared/base/interfaces/base-props.interface";

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
              }}
              onFinish={handleSubmit}
              requiredMark={false}
              style={{ width: "100%" }}
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
                <HelperCenter>
                  <Typography.Text type="secondary">
                    By creating an account you agree to our terms.
                  </Typography.Text>
                </HelperCenter>
              </ActionsRow>

              <PrimaryButton type="primary" htmlType="submit" size="large" block>
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
                <Typography.Link onClick={() => this.props.onLogin?.()}>Sign in</Typography.Link>
              </BottomRow>
            </Form>
          </Space>
        </CardBody>
      </FormCard>
    );
  }
}

export default RegisterForm;
