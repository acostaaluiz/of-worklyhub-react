import {
  AppstoreOutlined,
  DeleteOutlined,
  FileTextOutlined,
  InboxOutlined,
  NumberOutlined,
  PlusOutlined,
  ScheduleOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import { Button, Input, InputNumber, Segmented, Select, Space, Typography } from "antd";
import type {
  WorkOrderInventoryLineInput,
  WorkOrderServiceLineInput,
} from "@modules/work-order/interfaces/work-order.model";
import type { CompanyServiceModel } from "@modules/company/interfaces/service.model";
import type { InventoryItem } from "@modules/inventory/services/inventory-api";
import { i18n as appI18n } from "@core/i18n";
import { LabeledField } from "./work-order-form-labeled-field.component";

type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type MoneyMaskAdapter = {
  format: (value?: number | null) => string | undefined;
  parse: (value: string) => number | undefined;
};

type WorkOrderFormLinesTabProps = {
  isMobileViewport: boolean;
  lineMode: "services" | "inventory";
  onLineModeChange: (value: "services" | "inventory") => void;
  serviceLines: WorkOrderServiceLineInput[];
  inventoryLines: WorkOrderInventoryLineInput[];
  services?: CompanyServiceModel[];
  serviceOptions: SelectOption[];
  inventoryItemOptions: SelectOption[];
  inventoryById: Map<string, InventoryItem>;
  moneyMaskCents: MoneyMaskAdapter;
  onAddServiceLine: () => void;
  onRemoveServiceLine: (index: number) => void;
  onUpdateServiceLine: (index: number, patch: Partial<WorkOrderServiceLineInput>) => void;
  onAddInventoryLine: () => void;
  onRemoveInventoryLine: (index: number) => void;
  onUpdateInventoryLine: (index: number, patch: Partial<WorkOrderInventoryLineInput>) => void;
};

export function WorkOrderFormLinesTab({
  isMobileViewport,
  lineMode,
  onLineModeChange,
  serviceLines,
  inventoryLines,
  services,
  serviceOptions,
  inventoryItemOptions,
  inventoryById,
  moneyMaskCents,
  onAddServiceLine,
  onRemoveServiceLine,
  onUpdateServiceLine,
  onAddInventoryLine,
  onRemoveInventoryLine,
  onUpdateInventoryLine,
}: WorkOrderFormLinesTabProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <LabeledField label={appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k136")} icon={<AppstoreOutlined />}>
        <Segmented
          value={lineMode}
          options={[
            { label: appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k137"), value: "services" },
            { label: appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k138"), value: "inventory" },
          ]}
          onChange={(value) => onLineModeChange(value as "services" | "inventory")}
          data-cy="work-order-line-mode-segmented"
        />
      </LabeledField>

      {lineMode === "services" ? (
        <>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontWeight: 600 }}>
              {appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k139")}
            </div>
            <Button
              icon={<PlusOutlined />}
              onClick={onAddServiceLine}
              data-cy="work-order-add-service-line-button"
            >
              {appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k140")}
            </Button>
          </div>

          {serviceLines.length === 0 ? (
            <div style={{ color: "var(--color-text-muted)" }}>
              {appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k141")}
            </div>
          ) : null}

          {serviceLines.map((line, idx) => (
            <div
              key={`service-${idx}`}
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 8,
                paddingBottom: 10,
                borderBottom: "1px solid var(--color-border)",
              }}
              data-cy={`work-order-service-line-${idx}`}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobileViewport
                    ? "1fr"
                    : "minmax(0, 1fr) 90px",
                  gap: 10,
                }}
              >
                <LabeledField label={appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k142")} icon={<ToolOutlined />} style={{ minWidth: 0 }}>
                  <Select
                    placeholder={appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k143")}
                    value={line.serviceId || undefined}
                    showSearch
                    allowClear
                    optionFilterProp="label"
                    options={serviceOptions}
                    onChange={(value) => {
                      if (!value) {
                        onUpdateServiceLine(idx, { serviceId: "" });
                        return;
                      }

                      const selectedService = (services ?? []).find((service) => service.id === value);
                      onUpdateServiceLine(idx, {
                        serviceId: value,
                        unitPriceCents: line.unitPriceCents ?? selectedService?.priceCents ?? undefined,
                      });
                    }}
                    filterOption={(input, option) =>
                      String(option?.label ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    style={{ width: "100%" }}
                    data-cy={`work-order-service-select-${idx}`}
                  />
                </LabeledField>
                <LabeledField label={appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k144")} icon={<NumberOutlined />}>
                  <InputNumber
                    min={1}
                    placeholder={appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k145")}
                    value={line.quantity}
                    onChange={(value) => onUpdateServiceLine(idx, { quantity: value ?? undefined })}
                    style={{ width: "100%" }}
                    data-cy={`work-order-service-qty-input-${idx}`}
                  />
                </LabeledField>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobileViewport
                    ? "1fr"
                    : "140px minmax(0, 1fr) 128px",
                  gap: 10,
                  alignItems: "end",
                }}
              >
                <LabeledField label={appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k146")} icon={<NumberOutlined />}>
                  <Input
                    placeholder={appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k147")}
                    value={moneyMaskCents.format(line.unitPriceCents)}
                    onChange={(event) =>
                      onUpdateServiceLine(idx, {
                        unitPriceCents: moneyMaskCents.parse(event.target.value),
                      })
                    }
                    inputMode="numeric"
                    style={{ width: "100%" }}
                    data-cy={`work-order-service-unit-price-input-${idx}`}
                  />
                </LabeledField>
                <LabeledField label={appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k148")} icon={<FileTextOutlined />} style={{ minWidth: 0 }}>
                  <Input
                    placeholder={appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k149")}
                    value={line.notes ?? ""}
                    onChange={(e) => onUpdateServiceLine(idx, { notes: e.target.value })}
                    style={{ width: "100%" }}
                    data-cy={`work-order-service-notes-input-${idx}`}
                  />
                </LabeledField>
                <LabeledField label={appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k150")}>
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    style={{ width: "100%" }}
                    onClick={() => onRemoveServiceLine(idx)}
                    data-cy={`work-order-service-remove-button-${idx}`}
                  >
                    {appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k151")}
                  </Button>
                </LabeledField>
              </div>
            </div>
          ))}
        </>
      ) : (
        <>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontWeight: 600 }}>
              {appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k152")}
            </div>
            <Button
              icon={<PlusOutlined />}
              onClick={onAddInventoryLine}
              data-cy="work-order-add-inventory-line-button"
            >
              {appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k153")}
            </Button>
          </div>

          {inventoryLines.length === 0 ? (
            <div style={{ color: "var(--color-text-muted)" }}>
              {appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k154")}
            </div>
          ) : null}

          {inventoryLines.map((line, idx) => {
            const selectedInventoryItem = inventoryById.get(line.inventoryItemId);
            const availableQuantity = Math.max(
              0,
              Number(selectedInventoryItem?.quantity ?? 0)
            );
            const plannedQuantity = Math.max(0, Number(line.plannedQuantity ?? 0));
            const consumedQuantity = Math.max(0, Number(line.consumedQuantity ?? 0));
            const direction = line.direction ?? "output";
            const exceedsAvailable =
              direction === "output" &&
              Math.max(plannedQuantity, consumedQuantity) > availableQuantity;

            return (
              <Space
                key={`inventory-${idx}`}
                wrap
                style={{ width: "100%" }}
                align="start"
                data-cy={`work-order-inventory-line-${idx}`}
              >
                <LabeledField
                  label={appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k155")}
                  icon={<InboxOutlined />}
                  style={{ width: isMobileViewport ? "100%" : 220 }}
                >
                  <Select
                    placeholder={appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k156")}
                    value={line.inventoryItemId || undefined}
                    showSearch
                    allowClear
                    optionFilterProp="label"
                    options={inventoryItemOptions}
                    onChange={(value) => onUpdateInventoryLine(idx, { inventoryItemId: value ?? "" })}
                    filterOption={(input, option) =>
                      String(option?.label ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    style={{ width: "100%" }}
                    data-cy={`work-order-inventory-item-select-${idx}`}
                  />
                  {line.inventoryItemId ? (
                    <div style={{ marginTop: 4, fontSize: 12 }}>
                      <Typography.Text
                        type={exceedsAvailable ? "danger" : "secondary"}
                      >
                        {appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k157")}: {availableQuantity}
                        {exceedsAvailable
                          ? appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k158")
                          : ""}
                      </Typography.Text>
                    </div>
                  ) : null}
                </LabeledField>
                <LabeledField
                  label={appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k159")}
                  icon={<ScheduleOutlined />}
                  style={{ width: isMobileViewport ? "100%" : 130 }}
                >
                  <Select
                    value={line.direction}
                    style={{ width: "100%" }}
                    options={[
                      { value: "input", label: appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k160") },
                      { value: "output", label: appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k161") },
                    ]}
                    onChange={(value) => onUpdateInventoryLine(idx, { direction: value })}
                    data-cy={`work-order-inventory-direction-select-${idx}`}
                  />
                </LabeledField>
                <LabeledField
                  label={appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k162")}
                  icon={<NumberOutlined />}
                  style={{ width: isMobileViewport ? "100%" : 120 }}
                >
                  <InputNumber
                    min={0}
                    placeholder={appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k163")}
                    value={line.plannedQuantity}
                    onChange={(value) => onUpdateInventoryLine(idx, { plannedQuantity: value ?? undefined })}
                    style={{ width: "100%" }}
                    data-cy={`work-order-inventory-planned-input-${idx}`}
                  />
                </LabeledField>
                <LabeledField
                  label={appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k164")}
                  icon={<NumberOutlined />}
                  style={{ width: isMobileViewport ? "100%" : 120 }}
                >
                  <InputNumber
                    min={0}
                    placeholder={appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k165")}
                    value={line.consumedQuantity}
                    onChange={(value) => onUpdateInventoryLine(idx, { consumedQuantity: value ?? undefined })}
                    style={{ width: "100%" }}
                    data-cy={`work-order-inventory-consumed-input-${idx}`}
                  />
                </LabeledField>
                <LabeledField
                  label={appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k166")}
                  icon={<NumberOutlined />}
                  style={{ width: isMobileViewport ? "100%" : 170 }}
                >
                  <Input
                    placeholder={appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k167")}
                    value={moneyMaskCents.format(line.unitCostCents)}
                    onChange={(event) =>
                      onUpdateInventoryLine(idx, {
                        unitCostCents: moneyMaskCents.parse(event.target.value),
                      })
                    }
                    inputMode="numeric"
                    style={{ width: "100%" }}
                    data-cy={`work-order-inventory-unit-cost-input-${idx}`}
                  />
                </LabeledField>
                <LabeledField
                  label={appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k168")}
                  style={{ width: isMobileViewport ? "100%" : 126 }}
                >
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    style={{ width: "100%" }}
                    onClick={() => onRemoveInventoryLine(idx)}
                    data-cy={`work-order-inventory-remove-button-${idx}`}
                  >
                    {appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k169")}
                  </Button>
                </LabeledField>
              </Space>
            );
          })}
        </>
      )}
    </div>
  );
}

export default WorkOrderFormLinesTab;
