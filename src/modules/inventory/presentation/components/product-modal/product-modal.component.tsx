import React from "react";
import { Modal, message, Form, Input, InputNumber, Button, Select, Switch } from "antd";
import type { FormInstance } from "antd";
import {
  Box,
  CheckCircle2,
  CircleDollarSign,
  Gauge,
  Info,
  PackageSearch,
  Save,
  Tag,
  X,
} from "lucide-react";
import { getMoneyMaskAdapter } from "@core/utils/mask";
import { BaseComponent } from "@shared/base/base.component";
import { IconLabel } from "@shared/ui/components/settings/icon-label.component";
import type { BaseProps } from "@shared/base/interfaces/base-props.interface";
import type { ProductModel } from "@modules/inventory/interfaces/product.model";
import {
  ContinueWrap,
  FieldRow,
  FieldRow3,
  FormStack,
  ModalOverrides,
  SectionCard,
  ToggleRow,
} from "./product-modal.component.styles";

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
  costCents?: string;
  priceCents?: string;
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
  private readonly moneyMask = getMoneyMaskAdapter({ fromCents: true });

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
      const { priceCents, costCents, ...rest } = values;

      const payload: Omit<ProductModel, "id" | "createdAt"> = {
        ...rest,
        name: values.name?.trim() ?? "",
        unit: values.unit ?? "un",
        costCents: this.moneyMask.parse(costCents),
        priceCents: this.moneyMask.parse(priceCents),
        minStock: typeof values.minStock === "number" ? values.minStock : 0,
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
    const initialValues: ProductFormValues = {
      stock: 0,
      unit: "un",
      active: true,
      ...(initial ?? {}),
      priceCents:
        typeof initial?.priceCents === "number"
          ? this.moneyMask.format(initial.priceCents)
          : undefined,
      costCents:
        typeof initial?.costCents === "number"
          ? this.moneyMask.format(initial.costCents)
          : undefined,
    };

    return (
      <ModalOverrides>
        <Modal
          open={open}
          onCancel={onClose}
          footer={null}
          centered
          width={880}
          closeIcon={<X size={18} />}
          className="wh-product-modal"
          title={
            <IconLabel
              icon={initial ? <PackageSearch size={16} /> : <Box size={16} />}
              text={initial ? "Edit product" : "New product"}
            />
          }
          data-cy="inventory-product-modal"
        >
          <Form<ProductFormValues>
            ref={this.formRef}
            preserve={false}
            layout="vertical"
            initialValues={initialValues}
            onFinish={(values) => this.handleSubmit(values)}
            data-cy="inventory-product-form"
          >
            <FormStack>
              <SectionCard>
                <Form.Item
                  name="name"
                  label={<IconLabel icon={<Box size={14} />} text="Name" />}
                  rules={[{ required: true }]}
                >
                  <Input size="large" data-cy="inventory-product-name-input" />
                </Form.Item>

                <Form.Item
                  name="description"
                  label={<IconLabel icon={<Info size={14} />} text="Description" />}
                >
                  <Input.TextArea rows={3} data-cy="inventory-product-description-input" />
                </Form.Item>
              </SectionCard>

              <SectionCard>
                <FieldRow3>
                  <Form.Item
                    name="sku"
                    label={<IconLabel icon={<Tag size={14} />} text="SKU" />}
                  >
                    <Input size="large" data-cy="inventory-product-sku-input" />
                  </Form.Item>

                  <Form.Item
                    name="categoryId"
                    label={<IconLabel icon={<Tag size={14} />} text="Category" />}
                  >
                    <Select allowClear placeholder="Select a category" size="large" data-cy="inventory-product-category-select">
                      {categories.map((c) => (
                        <Select.Option key={c.id} value={c.id}>
                          {c.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="barcode"
                    label={<IconLabel icon={<Tag size={14} />} text="Barcode" />}
                  >
                    <Input size="large" data-cy="inventory-product-barcode-input" />
                  </Form.Item>
                </FieldRow3>
              </SectionCard>

              <SectionCard>
                <FieldRow3>
                  <Form.Item
                    name="priceCents"
                    label={<IconLabel icon={<CircleDollarSign size={14} />} text="Price" />}
                    normalize={(value) => this.moneyMask.normalize(value)}
                  >
                    <Input
                      style={{ width: "100%" }}
                      size="large"
                      inputMode="numeric"
                      data-cy="inventory-product-price-input"
                    />
                  </Form.Item>

                  <Form.Item
                    name="costCents"
                    label={<IconLabel icon={<CircleDollarSign size={14} />} text="Cost" />}
                    normalize={(value) => this.moneyMask.normalize(value)}
                  >
                    <Input
                      style={{ width: "100%" }}
                      size="large"
                      inputMode="numeric"
                      data-cy="inventory-product-cost-input"
                    />
                  </Form.Item>

                  <Form.Item
                    name="location"
                    label={<IconLabel icon={<Info size={14} />} text="Location" />}
                  >
                    <Input size="large" data-cy="inventory-product-location-input" />
                  </Form.Item>
                </FieldRow3>

                <FieldRow>
                  <Form.Item
                    name="stock"
                    label={<IconLabel icon={<Gauge size={14} />} text="Initial stock" />}
                  >
                    <InputNumber
                      style={{ width: "100%" }}
                      min={0}
                      size="large"
                      data-cy="inventory-product-stock-input"
                    />
                  </Form.Item>

                  <Form.Item
                    name="minStock"
                    label={<IconLabel icon={<Gauge size={14} />} text="Minimum stock" />}
                  >
                    <InputNumber
                      style={{ width: "100%" }}
                      min={0}
                      size="large"
                      data-cy="inventory-product-min-stock-input"
                    />
                  </Form.Item>
                </FieldRow>

                <ToggleRow>
                  <Form.Item
                    name="active"
                    label={<IconLabel icon={<CheckCircle2 size={14} />} text="Active" />}
                    valuePropName="checked"
                    style={{ marginBottom: 0 }}
                  >
                    <Switch data-cy="inventory-product-active-switch" />
                  </Form.Item>
                </ToggleRow>
              </SectionCard>

              <ContinueWrap>
                <Button onClick={onClose} data-cy="inventory-product-cancel-button">
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<Save size={16} />}
                  loading={this.state.submitting}
                  data-cy="inventory-product-save-button"
                >
                  Save
                </Button>
              </ContinueWrap>
            </FormStack>
          </Form>
        </Modal>
      </ModalOverrides>
    );
  }
}

export default ProductModal;
