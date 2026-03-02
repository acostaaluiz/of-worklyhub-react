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
  onSaved?: (
    payload: Omit<ProductModel, "id" | "createdAt">,
    id?: string
  ) => Promise<void> | void;
  initial?: Partial<ProductModel> | null;
  workspaceId?: string | undefined;
  categories?: Array<{ id: string; name: string }>;
};

type ProductFormValues = {
  name?: string;
  sku?: string;
  description?: string;
  barcode?: string;
  unit?: string;
  categoryId?: string;
  costCents?: number;
  priceCents?: number;
  minStock?: number;
  location?: string;
  tags?: string[];
  active?: boolean;
  stock?: number;
};

type State = {
  isLoading: boolean;
  error?: DataValue;
  submitting: boolean;
};

function toDataMap(value: DataValue | undefined): DataMap | null {
  if (!value || typeof value !== "object" || Array.isArray(value) || value instanceof Date) {
    return null;
  }
  return value;
}

export class ProductModal extends BaseComponent<Props, State> {
  private formRef = React.createRef<FormInstance<ProductFormValues>>();
  constructor(props: Props) {
    super(props);
    this.state = { isLoading: false, error: undefined, submitting: false };
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.open && !prevProps.open) {
      this.clearError();
    }
  }

  private handleSubmit = async (values: ProductFormValues) => {
    const { initial, onSaved } = this.props;
    try {
      this.setSafeState({ submitting: true });

      const payload: Omit<ProductModel, "id" | "createdAt"> = {
        name: values.name?.trim() ?? "",
        sku: values.sku,
        description: values.description,
        barcode: values.barcode,
        unit: values.unit ?? "un",
        categoryId: values.categoryId,
        costCents:
          typeof values.costCents === "number"
            ? moneyToCents(values.costCents)
            : undefined,
        priceCents:
          typeof values.priceCents === "number"
            ? moneyToCents(values.priceCents)
            : undefined,
        minStock: typeof values.minStock === "number" ? values.minStock : 0,
        location: values.location,
        tags: values.tags,
        active: values.active ?? true,
        stock: typeof values.stock === "number" ? values.stock : 0,
      };

      if (onSaved) {
        await onSaved(payload, initial?.id);
      }

      this.setSafeState({ submitting: false });
    } catch (err) {
      const error = err as DataValue;
      this.setSafeState({ submitting: false, error });

      // If backend returned a duplicate-name error, show specific feedback and mark the name field
      const root = toDataMap(error);
      const response = toDataMap(root?.response);
      const details = toDataMap(root?.details) ?? toDataMap(response?.data);
      const detailsError = toDataMap(details?.error);
      const statusValue = root?.statusCode ?? response?.status;
      const status = typeof statusValue === "number" ? statusValue : undefined;
      const codeValue = detailsError?.code ?? details?.code;
      const code = typeof codeValue === "string" ? codeValue : undefined;
      const dupMessageValue = detailsError?.message ?? details?.message;
      const dupMessage = typeof dupMessageValue === "string" ? dupMessageValue : undefined;

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

      const fallbackMessage =
        typeof root?.message === "string" ? root.message : "Failed to save item";
      message.error(fallbackMessage);
      throw err;
    }
  };

  protected renderView(): React.ReactNode {
    const { open, onClose, initial, categories = [] } = this.props;
    const moneyInput = getMoneyInput();
    const initialValues: ProductFormValues = {
      stock: 0,
      unit: "un",
      active: true,
      ...(initial ?? {}),
      priceCents:
        typeof initial?.priceCents === "number"
          ? centsToMoney(initial.priceCents)
          : undefined,
      costCents:
        typeof initial?.costCents === "number"
          ? centsToMoney(initial.costCents)
          : undefined,
    };

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
            <Form<ProductFormValues>
              ref={this.formRef}
              preserve={false}
              layout="vertical"
              initialValues={initialValues}
              onFinish={(values) => this.handleSubmit(values)}
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
                      {categories.map((c) => (
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
                <Button onClick={onClose}>Cancel</Button>
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
