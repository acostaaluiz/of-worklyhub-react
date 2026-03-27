import React from "react";
import { Button, Form, Input, InputNumber, Switch } from "antd";
import {
  BriefcaseBusiness,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Gauge,
  Info,
  Save,
} from "lucide-react";

import { getMoneyMaskAdapter } from "@core/utils/mask";
import { i18n as appI18n } from "@core/i18n";
import { BaseComponent } from "@shared/base/base.component";
import type { BaseProps } from "@shared/base/interfaces/base-props.interface";
import type { BaseState } from "@shared/base/interfaces/base-state.interface";
import DurationTimeSelector from "@shared/ui/components/duration-time-selector/duration-time-selector.component";
import { IconLabel } from "@shared/ui/components/settings/icon-label.component";
import type { CompanyServiceModel } from "@modules/company/interfaces/service.model";

import {
  ContinueWrap,
  DurationFieldShell,
  FieldRow3,
  FormStack,
  SectionCard,
  ToggleRow,
} from "./service-manager.component.styles";

type Props = BaseProps & {
  initial?: Partial<CompanyServiceModel>;
  onSubmit: (p: Omit<CompanyServiceModel, "id" | "createdAt">) => Promise<void> | void;
  submitting?: boolean;
};

type ServiceFormValues = {
  title: string;
  description?: string;
  durationMinutes?: number | string;
  priceCents?: string;
  capacity?: number;
  active?: boolean;
};

const moneyMask = getMoneyMaskAdapter({ fromCents: true });

export class ServiceFormComponent extends BaseComponent<Props, BaseState> {
  public override state: BaseState = { isLoading: false };

  protected override renderView(): React.ReactNode {
    const { initial, onSubmit, submitting } = this.props;

    return (
      <Form
        layout="vertical"
        autoComplete="off"
        initialValues={{
          durationMinutes: 30,
          active: true,
          ...initial,
          priceCents:
            typeof initial?.priceCents === "number"
              ? moneyMask.format(initial.priceCents)
              : undefined,
        }}
        onFinish={(values: ServiceFormValues) => {
          const parsedDuration =
            typeof values.durationMinutes === "number"
              ? values.durationMinutes
              : Number(values.durationMinutes);

          const prepared: Omit<CompanyServiceModel, "id" | "createdAt"> = {
            title: values.title,
            description: values.description,
            durationMinutes: Number.isFinite(parsedDuration) ? parsedDuration : undefined,
            priceCents: undefined,
            capacity: values.capacity,
            active: values.active ?? true,
          };

          prepared.priceCents = moneyMask.parse(values.priceCents);

          onSubmit(prepared);
        }}
        data-cy="company-services-form"
      >
        <FormStack>
          <SectionCard>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              <Form.Item
                name="title"
                label={
                  <IconLabel
                    icon={<BriefcaseBusiness size={14} />}
                    text={appI18n.t("company.admin.form.fields.title.label")}
                  />
                }
                rules={[
                  {
                    required: true,
                    message: appI18n.t("company.admin.form.fields.title.required"),
                  },
                ]}
              >
                <Input size="large" data-cy="company-services-title-input" />
              </Form.Item>

              <Form.Item
                name="description"
                label={
                  <IconLabel
                    icon={<Info size={14} />}
                    text={appI18n.t("company.admin.form.fields.description.label")}
                  />
                }
              >
                <Input.TextArea rows={4} data-cy="company-services-description-input" />
              </Form.Item>
            </div>
          </SectionCard>

          <SectionCard>
            <FieldRow3>
              <Form.Item
                label={
                  <IconLabel
                    icon={<Clock3 size={14} />}
                    text={appI18n.t("company.admin.form.fields.duration.label")}
                  />
                }
              >
                <DurationFieldShell data-cy="company-services-duration-input">
                  <Form.Item name="durationMinutes" noStyle>
                    <DurationTimeSelector mode="duration" size="large" chipMinWidth={72} />
                  </Form.Item>
                </DurationFieldShell>
              </Form.Item>

              <Form.Item
                name="priceCents"
                label={
                  <IconLabel
                    icon={<CircleDollarSign size={14} />}
                    text={appI18n.t("company.admin.form.fields.price.label")}
                  />
                }
                normalize={(value) => moneyMask.normalize(value)}
              >
                <Input
                  style={{ width: "100%" }}
                  size="large"
                  inputMode="numeric"
                  data-cy="company-services-price-input"
                />
              </Form.Item>

              <Form.Item
                name="capacity"
                label={
                  <IconLabel
                    icon={<Gauge size={14} />}
                    text={appI18n.t("company.admin.form.fields.capacity.label")}
                  />
                }
              >
                <InputNumber
                  min={1}
                  style={{ width: "100%" }}
                  size="large"
                  data-cy="company-services-capacity-input"
                />
              </Form.Item>
            </FieldRow3>

            <ToggleRow>
              <Form.Item
                name="active"
                label={
                  <IconLabel
                    icon={<CheckCircle2 size={14} />}
                    text={appI18n.t("company.admin.form.fields.active.label")}
                  />
                }
                valuePropName="checked"
                style={{ marginBottom: 0 }}
              >
                <Switch data-cy="company-services-active-switch" />
              </Form.Item>
            </ToggleRow>
          </SectionCard>

          <ContinueWrap>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              icon={<Save size={16} />}
              block
              loading={submitting}
              data-cy="company-services-save-button"
            >
              {appI18n.t("company.admin.form.save")}
            </Button>
          </ContinueWrap>
        </FormStack>
      </Form>
    );
  }
}

export default ServiceFormComponent;
