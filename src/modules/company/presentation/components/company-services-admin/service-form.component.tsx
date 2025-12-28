import React from "react";
import { Form, Input, InputNumber, Button, Switch } from "antd";
import type { CompanyServiceModel } from "@modules/company/interfaces/service.model";
import { BaseComponent } from "@shared/base/base.component";

type Props = {
  initial?: Partial<CompanyServiceModel>;
  onSubmit: (p: Omit<CompanyServiceModel, "id" | "createdAt">) => Promise<void> | void;
  submitting?: boolean;
};

export class ServiceFormComponent extends BaseComponent<Props, {}> {
  private formRef = React.createRef<any>();

  protected override renderView(): React.ReactNode {
    const { initial, onSubmit, submitting } = this.props;
    return (
      <Form ref={this.formRef} layout="vertical" initialValues={{ durationMinutes: 30, active: true, ...initial }} onFinish={(v) => onSubmit(v as any)}>
        <Form.Item name="title" label="Título" rules={[{ required: true }]}> 
          <Input />
        </Form.Item>

        <Form.Item name="description" label="Descrição">
          <Input.TextArea rows={3} />
        </Form.Item>

        <Form.Item name="durationMinutes" label="Duração (min)">
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item name="priceCents" label="Preço (centavos)">
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item name="capacity" label="Capacidade">
          <InputNumber min={1} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item name="active" label="Ativo" valuePropName="checked">
          <Switch />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={submitting}>Salvar</Button>
        </Form.Item>
      </Form>
    );
  }
}

export default ServiceFormComponent;
