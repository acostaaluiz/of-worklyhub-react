import React from "react";
import { Modal, Typography, message, Form, Input, InputNumber, Button, Select, Switch, Row, Col } from "antd";
import type { FormInstance } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { BaseComponent } from "@shared/base/base.component";
import type { BaseProps } from "@shared/base/interfaces/base-props.interface";
import { ModalOverrides } from "@modules/schedule/presentation/components/schedule-event-modal/schedule-calendar.component.styles";
import type { ProductModel } from "@modules/inventory/interfaces/product.model";

type Props = BaseProps & {
  open: boolean;
  onClose: () => void;
  onSaved?: (payload: Omit<ProductModel, "id" | "createdAt">, id?: string) => Promise<any> | void;
  initial?: Partial<ProductModel> | null;
  workspaceId?: string | undefined;
  categories?: Array<{ id: string; name: string }>;
};

type State = {
  isLoading: boolean;
  error?: unknown;
  submitting: boolean;
};

export class ProductModal extends BaseComponent<Props, State> {
  private formRef = React.createRef<FormInstance>();
  constructor(props: Props) {
    super(props);
    this.state = { isLoading: false, error: undefined, submitting: false };
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.open && !prevProps.open) {
      this.clearError();
    }
  }

  private handleSubmit = async (data: Omit<ProductModel, "id" | "createdAt">) => {
    const { initial, onSaved } = this.props;
    try {
      this.setSafeState({ submitting: true });

      const payload: any = {
        name: data.name,
        sku: data.sku ?? null,
        category: data.categoryId ?? null,
        quantity: data.stock ?? 0,
        minQuantity: data.minStock ?? 0,
        location: data.location ?? null,
        priceCents: data.priceCents ?? 0,
        isActive: data.active ?? true,
      };

      if (onSaved) await onSaved(payload, (initial as any)?.id);

      this.setSafeState({ submitting: false });
    } catch (err) {
      this.setSafeState({ submitting: false, error: err });

      // If backend returned a duplicate-name error, show specific feedback and mark the name field
      const details = (err as any)?.details ?? (err as any)?.response?.data ?? undefined;
      const status = (err as any)?.statusCode ?? (err as any)?.response?.status;
      const code = details?.error?.code ?? details?.code;
      const dupMessage = details?.error?.message ?? details?.message;

      if (status === 409 && code === "DUPLICATE_NAME") {
        const msg = dupMessage ?? "Já existe um produto com este nome. Por favor escolha outro nome.";
        message.error(msg);
        try {
          this.formRef.current?.setFields([{ name: "name", errors: [msg] }]);
        } catch {
          // ignore
        }
        return;
      }

      message.error((err as any)?.message ?? "Falha ao salvar item");
      throw err;
    }
  };

  protected renderView(): React.ReactNode {
    const { open, onClose, initial } = this.props;
    return (
      <ModalOverrides>
        <Modal
          open={open}
          onCancel={onClose}
          footer={null}
          centered
          width={720}
          closeIcon={<CloseOutlined />}
          className="wh-product-modal"
          title={<Typography.Title level={4} style={{ margin: 0 }}>{initial ? "Editar Produto" : "Novo Produto"}</Typography.Title>}
        >
          <div style={{ paddingTop: "var(--space-3)" }}>
            <Form
              ref={this.formRef}
              layout="vertical"
              initialValues={{ stock: 0, unit: "un", active: true, ...(initial as any) }}
              onFinish={(v) => this.handleSubmit(v as any)}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="name" label="Nome" rules={[{ required: true }]}>
                    <Input />
                  </Form.Item>

                  <Form.Item name="sku" label="SKU">
                    <Input />
                  </Form.Item>

                  <Form.Item name="description" label="Descrição">
                    <Input.TextArea rows={4} />
                  </Form.Item>

                  <Form.Item name="priceCents" label="Preço (centavos)">
                    <InputNumber style={{ width: "100%" }} min={0} />
                  </Form.Item>

                  <Form.Item name="categoryId" label="Categoria">
                    <Select allowClear placeholder="Selecione uma categoria">
                      {(this.props as any).categories?.map((c: any) => (
                        <Select.Option key={c.id} value={c.id}>
                          {c.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item name="stock" label="Estoque inicial">
                    <InputNumber style={{ width: "100%" }} min={0} />
                  </Form.Item>

                  <Form.Item name="barcode" label="Código de barras">
                    <Input />
                  </Form.Item>

                  <Form.Item name="costCents" label="Custo (centavos)">
                    <InputNumber style={{ width: "100%" }} min={0} />
                  </Form.Item>

                  <Form.Item name="minStock" label="Estoque mínimo">
                    <InputNumber style={{ width: "100%" }} min={0} />
                  </Form.Item>

                  <Form.Item name="location" label="Localização">
                    <Input />
                  </Form.Item>

                  <Form.Item name="active" label="Ativo" valuePropName="checked">
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <Button onClick={() => this.props.onClose()}>Cancelar</Button>
                <Button type="primary" htmlType="submit" loading={this.state.submitting}>
                  Salvar
                </Button>
              </div>
            </Form>
          </div>
        </Modal>
      </ModalOverrides>
    );
  }
}

export default ProductModal;
