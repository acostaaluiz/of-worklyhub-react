import { Button, InputNumber, Select, Space } from "antd";
import {
  ClockCircleOutlined,
  DeleteOutlined,
  IdcardOutlined,
  PlusOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { WorkOrderWorkerInput } from "@modules/work-order/interfaces/work-order.model";
import { i18n as appI18n } from "@core/i18n";
import { LabeledField } from "./work-order-form-labeled-field.component";

type WorkerOption = {
  value: string;
  label: string;
};

type WorkOrderFormTeamTabProps = {
  isMobileViewport: boolean;
  workers: WorkOrderWorkerInput[];
  workerOptions: WorkerOption[];
  onAddWorker: () => void;
  onUpdateWorker: (index: number, patch: Partial<WorkOrderWorkerInput>) => void;
  onRemoveWorker: (index: number) => void;
};

export function WorkOrderFormTeamTab({
  isMobileViewport,
  workers,
  workerOptions,
  onAddWorker,
  onUpdateWorker,
  onRemoveWorker,
}: WorkOrderFormTeamTabProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontWeight: 600 }}>
          {appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k122")}
        </div>
        <Button icon={<PlusOutlined />} onClick={onAddWorker} data-cy="work-order-add-worker-button">
          {appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k123")}
        </Button>
      </div>

      {workers.length === 0 ? (
        <div style={{ color: "var(--color-text-muted)" }}>
          {appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k124")}
        </div>
      ) : null}

      {workers.map((line, idx) => (
        <Space
          key={`worker-${idx}`}
          wrap
          style={{ width: "100%" }}
          align="start"
          data-cy={`work-order-worker-row-${idx}`}
        >
          <LabeledField
            label={appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k125")}
            icon={<UserOutlined />}
            style={{ width: isMobileViewport ? "100%" : 260 }}
          >
            <Select
              placeholder={appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k126")}
              value={line.userUid || undefined}
              showSearch
              allowClear
              optionFilterProp="label"
              options={workerOptions}
              onChange={(value) => onUpdateWorker(idx, { userUid: value ?? "" })}
              filterOption={(input, option) =>
                String(option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              style={{ width: "100%" }}
              data-cy={`work-order-worker-select-${idx}`}
            />
          </LabeledField>
          <LabeledField
            label={appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k127")}
            icon={<IdcardOutlined />}
            style={{ width: isMobileViewport ? "100%" : 170 }}
          >
            <Select
              value={line.assignmentRole}
              style={{ width: "100%" }}
              options={[
                { value: "executor", label: appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k128") },
                { value: "assistant", label: appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k129") },
                { value: "reviewer", label: appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k130") },
              ]}
              onChange={(value) => onUpdateWorker(idx, { assignmentRole: value })}
              data-cy={`work-order-worker-role-select-${idx}`}
            />
          </LabeledField>
          <LabeledField
            label={appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k131")}
            icon={<ClockCircleOutlined />}
            style={{ width: isMobileViewport ? "100%" : 150 }}
          >
            <InputNumber
              min={0}
              placeholder={appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k132")}
              value={line.allocatedMinutes}
              onChange={(value) => onUpdateWorker(idx, { allocatedMinutes: value ?? undefined })}
              style={{ width: "100%" }}
              data-cy={`work-order-worker-minutes-input-${idx}`}
            />
          </LabeledField>
          <LabeledField
            label={appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k133")}
            style={{ width: isMobileViewport ? "100%" : 126 }}
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              style={{ width: "100%" }}
              onClick={() => onRemoveWorker(idx)}
              data-cy={`work-order-worker-remove-button-${idx}`}
            >
              {appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k134")}
            </Button>
          </LabeledField>
        </Space>
      ))}
    </div>
  );
}

export default WorkOrderFormTeamTab;
