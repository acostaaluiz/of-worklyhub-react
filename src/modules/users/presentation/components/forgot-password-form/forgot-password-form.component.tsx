import React from "react";
import { Form, Input, Space, Typography } from "antd";
import type { FormInstance } from "antd";
import { Mail, Send } from "lucide-react";

import {
  BottomRow,
  CardBody,
  FormCard,
  PrimaryButton,
} from "../presentation.styles";

import { ActionsRow, ButtonIcon, FieldIcon, TitleBlock } from "@shared/styles/global";

import { BaseComponent } from "@shared/base/base.component";
import type { BaseProps } from "@shared/base/interfaces/base-props.interface";

type ForgotPasswordFormValues = {
  email: string;
};

type Props = BaseProps & {
  onSubmit?: (values: ForgotPasswordFormValues) => Promise<void>;
  onLogin?: () => void;
};

export class ForgotPasswordForm extends BaseComponent<Props> {
  private formRef = React.createRef<FormInstance<ForgotPasswordFormValues>>();

  protected override renderView(): React.ReactNode {
    const handleSubmit = (_values: ForgotPasswordFormValues) => {
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
                Reset your password
              </Typography.Title>
              <Typography.Text type="secondary">
                Enter your email and we will send a reset link.
              </Typography.Text>
            </TitleBlock>

            <Form<ForgotPasswordFormValues>
              ref={this.formRef}
              layout="vertical"
              initialValues={{ email: "" }}
              onFinish={handleSubmit}
              requiredMark={false}
              style={{ width: "100%" }}
            >
              <Form.Item<ForgotPasswordFormValues>
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

              <ActionsRow>
                <Typography.Link onClick={() => this.props.onLogin?.()}>
                  Back to sign in
                </Typography.Link>
              </ActionsRow>

              <PrimaryButton type="primary" htmlType="submit" size="large" block>
                <ButtonIcon aria-hidden>
                  <Send size={18} />
                </ButtonIcon>
                Send reset link
              </PrimaryButton>

              <BottomRow>
                <Typography.Text type="secondary">
                  Remembered your password?
                </Typography.Text>{" "}
                <Typography.Link onClick={() => this.props.onLogin?.()}>
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

export default ForgotPasswordForm;
