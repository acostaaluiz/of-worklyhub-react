import React from "react";
import { Form, Input, InputNumber, Button, Switch } from "antd";
import type { CompanyServiceModel } from "@modules/company/interfaces/service.model";
import type { BaseProps } from "@shared/base/interfaces/base-props.interface";
import { BaseComponent } from "@shared/base/base.component";
import type { BaseState } from "@shared/base/interfaces/base-state.interface";
import { FormStack, FieldRow, FieldRow3, ContinueWrap } from "@modules/schedule/presentation/components/schedule-event-modal/schedule-calendar.component.styles";
import DurationTimeSelector from "@shared/ui/components/duration-time-selector/duration-time-selector.component";

type Props = BaseProps & {
  initial?: Partial<CompanyServiceModel>;
  onSubmit: (p: Omit<CompanyServiceModel, "id" | "createdAt">) => Promise<void> | void;
  submitting?: boolean;
};

export class ServiceFormComponent extends BaseComponent<Props, BaseState> {
  private formRef = React.createRef<any>();

  public override state: BaseState = { isLoading: false };

  protected override renderView(): React.ReactNode {
    const { initial, onSubmit, submitting } = this.props;
    return (
      <Form ref={this.formRef} layout="vertical" initialValues={{ durationMinutes: 30, active: true, ...initial }} onFinish={(v) => onSubmit(v as any)}>
        <FormStack>
          <Form.Item name="title" label="Title" rules={[{ required: true }]}> 
            <Input size="large" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea rows={4} />
          </Form.Item>

          <FieldRow3>
            <Form.Item name="durationMinutes" label="Duration">
              <DurationTimeSelector mode="duration" size="large" chipMinWidth={72} />
            </Form.Item>

            <Form.Item name="priceCents" label="Price (cents)">
              <InputNumber min={0} style={{ width: "100%" }} size="large" />
            </Form.Item>

            <Form.Item name="capacity" label="Capacity">
              <InputNumber min={1} style={{ width: "100%" }} size="large" />
            </Form.Item>
          </FieldRow3>

          <FieldRow>
            <Form.Item name="active" label="Active" valuePropName="checked">
              <Switch />
            </Form.Item>
          </FieldRow>

          <ContinueWrap>
            <Button type="primary" htmlType="submit" size="large" block loading={submitting}>
              Save
            </Button>
          </ContinueWrap>
        </FormStack>
      </Form>
    );
  }
}

export default ServiceFormComponent;
