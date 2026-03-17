import React from "react";
import { Form, Input, InputNumber, Button, Switch } from "antd";
import type { FormInstance } from "antd";
import { centsToMoney, getMoneyInput, moneyToCents } from "@core/utils/mask";
import { i18n as appI18n } from "@core/i18n";
import { BaseComponent } from "@shared/base/base.component";
import type { BaseProps } from "@shared/base/interfaces/base-props.interface";
import type { BaseState } from "@shared/base/interfaces/base-state.interface";
import DurationTimeSelector from "@shared/ui/components/duration-time-selector/duration-time-selector.component";
import type { CompanyServiceModel } from "@modules/company/interfaces/service.model";
import { FormStack, FieldRow, FieldRow3, ContinueWrap } from "@modules/schedule/presentation/components/schedule-event-modal/schedule-calendar.component.styles";

type Props = BaseProps & {
  initial?: Partial<CompanyServiceModel>;
  onSubmit: (p: Omit<CompanyServiceModel, "id" | "createdAt">) => Promise<void> | void;
  submitting?: boolean;
};

type ServiceFormValues = {
  title: string;
  description?: string;
  durationMinutes?: number;
  priceCents?: number;
  capacity?: number;
  active?: boolean;
};

export class ServiceFormComponent extends BaseComponent<Props, BaseState> {
  private formRef = React.createRef<FormInstance<ServiceFormValues>>();

  public override state: BaseState = { isLoading: false };

  protected override renderView(): React.ReactNode {
    const { initial, onSubmit, submitting } = this.props;
    const moneyInput = getMoneyInput();
    return (
      <Form
        ref={this.formRef}
        layout="vertical"
        initialValues={{ durationMinutes: 30, active: true, ...initial, priceCents: typeof initial?.priceCents === "number" ? centsToMoney(initial.priceCents) : undefined }}
        onFinish={(v: ServiceFormValues) => {
          const prepared: Omit<CompanyServiceModel, "id" | "createdAt"> = {
            title: v.title,
            description: v.description,
            durationMinutes: v.durationMinutes,
            priceCents: undefined,
            capacity: v.capacity,
            active: v.active ?? true,
          };
          if (typeof v.priceCents === "number" && Number.isFinite(v.priceCents)) {
            prepared.priceCents = moneyToCents(v.priceCents);
          } else {
            prepared.priceCents = undefined;
          }
          onSubmit(prepared);
        }}
        data-cy="company-services-form"
      >
        <FormStack>
          <Form.Item name="title" label={appI18n.t("company.admin.form.fields.title.label")} rules={[{ required: true, message: appI18n.t("company.admin.form.fields.title.required") }]}> 
            <Input size="large" data-cy="company-services-title-input" />
          </Form.Item>

          <Form.Item name="description" label={appI18n.t("company.admin.form.fields.description.label")}>
            <Input.TextArea rows={4} data-cy="company-services-description-input" />
          </Form.Item>

          <FieldRow3>
            <Form.Item name="durationMinutes" label={appI18n.t("company.admin.form.fields.duration.label")}>
              <div data-cy="company-services-duration-input">
                <DurationTimeSelector mode="duration" size="large" chipMinWidth={72} />
              </div>
            </Form.Item>

            <Form.Item name="priceCents" label={appI18n.t("company.admin.form.fields.price.label")}>
              <InputNumber min={0} style={{ width: "100%" }} size="large" step={moneyInput.step} formatter={moneyInput.formatter} parser={moneyInput.parser} precision={moneyInput.precision} data-cy="company-services-price-input" />
            </Form.Item>

            <Form.Item name="capacity" label={appI18n.t("company.admin.form.fields.capacity.label")}>
              <InputNumber min={1} style={{ width: "100%" }} size="large" data-cy="company-services-capacity-input" />
            </Form.Item>
          </FieldRow3>

          <FieldRow>
            <Form.Item name="active" label={appI18n.t("company.admin.form.fields.active.label")} valuePropName="checked">
              <Switch data-cy="company-services-active-switch" />
            </Form.Item>
          </FieldRow>

          <ContinueWrap>
            <Button type="primary" htmlType="submit" size="large" block loading={submitting} data-cy="company-services-save-button">
              {appI18n.t("company.admin.form.save")}
            </Button>
          </ContinueWrap>
        </FormStack>
      </Form>
    );
  }
}

export default ServiceFormComponent;
