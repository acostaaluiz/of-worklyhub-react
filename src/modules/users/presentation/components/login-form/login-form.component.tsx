import React from "react";
import { Divider, Form, Input, Space, Typography, FormInstance } from "antd";
import { Eye, EyeOff, Lock, LogIn, Mail } from "lucide-react";

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
import { ActionsRow, ButtonIcon, FieldIcon, TitleBlock } from "@shared/styles/global";

import { BaseComponent } from "@shared/base/base.component";
import type { BaseProps } from "@shared/base/interfaces/base-props.interface";

type LoginFormValues = {
  email: string;
  password: string;
};

type Props = BaseProps & {
  onSubmit?: (values: LoginFormValues) => Promise<void>;
};

export class LoginForm extends BaseComponent<Props> {
  private formRef = React.createRef<FormInstance<LoginFormValues>>();

  protected override renderView(): React.ReactNode {
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
            <TitleBlock>
              <Typography.Title level={2} style={{ margin: 0 }}>
                Hello again
              </Typography.Title>
              <Typography.Text type="secondary">
                Welcome back. Please sign in to continue.
              </Typography.Text>
            </TitleBlock>

            <Form<LoginFormValues>
              ref={this.formRef}
              layout="vertical"
              initialValues={{ email: "", password: "" }}
              onFinish={handleSubmit}
              requiredMark={false}
              style={{ width: "100%" }}
            >
              <Form.Item<LoginFormValues>
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

              <Form.Item<LoginFormValues>
                label="Password"
                name="password"
                rules={[
                  { required: true, message: "Password is required" },
                  { min: 6, message: "Password must be at least 6 characters" },
                ]}
              >
                <Input.Password
                  size="large"
                  placeholder="Enter your password"
                  autoComplete="current-password"
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
                <Typography.Link>Recovery password</Typography.Link>
              </ActionsRow>

              <PrimaryButton type="primary" htmlType="submit" size="large" block>
                <ButtonIcon aria-hidden>
                  <LogIn size={18} />
                </ButtonIcon>
                Sign in
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
                   <FacebookIcon size={64} />
                </SocialButton>
              </SocialRow>

              <BottomRow>
                <Typography.Text type="secondary">Not a member?</Typography.Text>{" "}
                <Typography.Link>Register now</Typography.Link>
              </BottomRow>
            </Form>
          </Space>
        </CardBody>
      </FormCard>
    );
  }
}

export default LoginForm;
