import React from "react";
import { Modal, Typography, message, Form, Input, InputNumber, Button, Select, Switch, Row, Col } from "antd";
import type { FormInstance } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { centsToMoney, getMoneyInput, moneyToCents } from "@core/utils/mask";
import { BaseComponent } from "@shared/base/base.component";
import type { BaseProps } from "@shared/base/interfaces/base-props.interface";
import type { ProductModel } from "@modules/inventory/interfaces/product.model";
import { ModalOverrides } from "@modules/schedule/presentation/components/schedule-event-modal/schedule-calendar.component.styles";

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
        priceCents: typeof data.priceCents === "number" ? moneyToCents(data.priceCents) : 0,
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
        const msg = dupMessage ?? "A product with this name already exists. Please choose another name.";
        message.error(msg);
        try {
          this.formRef.current?.setFields([{ name: "name", errors: [msg] }]);
        } catch {
          // ignore
        }
        return;
      }

      message.error((err as any)?.message ?? "Failed to save item");
      throw err;
    }
  };

  protected renderView(): React.ReactNode {
    const { open, onClose, initial } = this.props;
    const moneyInput = getMoneyInput();
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
            title={<Typography.Title level={4} style={{ margin: 0 }}>{initial ? "Edit Product" : "New Product"}</Typography.Title>}
          >
          <div style={{ paddingTop: "var(--space-3)" }}>
            <Form
              ref={this.formRef}
              layout="vertical"
              initialValues={{
                stock: 0,
                unit: "un",
                active: true,
                ...(initial as any),
                priceCents: typeof (initial as any)?.priceCents === "number" ? centsToMoney((initial as any).priceCents) : undefined,
                costCents: typeof (initial as any)?.costCents === "number" ? centsToMoney((initial as any).costCents) : undefined,
              }}
              onFinish={(v) => this.handleSubmit(v as any)}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="name" label="Name" rules={[{ required: true }]}>
                    <Input />
                  </Form.Item>

                  <Form.Item name="sku" label="SKU">
                    <Input />
                  </Form.Item>

                  <Form.Item name="description" label="Description">
                    <Input.TextArea rows={4} />
                  </Form.Item>

                  <Form.Item name="priceCents" label="Price">
                    <InputNumber style={{ width: "100%" }} min={0} step={moneyInput.step} formatter={moneyInput.formatter} parser={moneyInput.parser} precision={moneyInput.precision} />
                  </Form.Item>

                  <Form.Item name="categoryId" label="Category">
                    <Select allowClear placeholder="Select a category">
                      {(this.props as any).categories?.map((c: any) => (
                        <Select.Option key={c.id} value={c.id}>
                          {c.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item name="stock" label="Initial stock">
                    <InputNumber style={{ width: "100%" }} min={0} />
                  </Form.Item>

                  <Form.Item name="barcode" label="Barcode">
                    <Input />
                  </Form.Item>

                  <Form.Item name="costCents" label="Cost">
                    <InputNumber style={{ width: "100%" }} min={0} step={moneyInput.step} formatter={moneyInput.formatter} parser={moneyInput.parser} precision={moneyInput.precision} />
                  </Form.Item>

                  <Form.Item name="minStock" label="Minimum stock">
                    <InputNumber style={{ width: "100%" }} min={0} />
                  </Form.Item>

                  <Form.Item name="location" label="Location">
                    <Input />
                  </Form.Item>

                  <Form.Item name="active" label="Active" valuePropName="checked">
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <Button onClick={() => this.props.onClose()}>Cancel</Button>
                <Button type="primary" htmlType="submit" loading={this.state.submitting}>
                  Save
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
