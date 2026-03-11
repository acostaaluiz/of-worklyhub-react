import React from "react";
import { Alert, Button, Form, InputNumber, Select, Space, Switch, Tabs, Typography, message } from "antd";
import {
  CalendarClock,
  ExternalLink,
  Paperclip,
  ReceiptText,
  RotateCcw,
  Save,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";

import { formatAppDateTime } from "@core/utils/date-time";
import { companyService } from "@modules/company/services/company.service";
import {
  type WorkOrderWorkspaceSettings,
  type WorkOrderWorkspaceSettingsBundle,
} from "@modules/work-order/interfaces/work-order.model";
import {
  getWorkOrderSettings,
  upsertWorkOrderSettings,
} from "@modules/work-order/services/work-order.http.service";
import { usersAuthService } from "@modules/users/services/auth.service";
import { BasePage } from "@shared/base/base.page";
import { BaseTemplate } from "@shared/base/base.template";
import { PageStack } from "@modules/work-order/presentation/templates/work-orders/work-orders.template.styles";
import { IconLabel } from "@shared/ui/components/settings/icon-label.component";
import { SettingsPageHeader } from "@shared/ui/components/settings/settings-page-header.component";
import { type SettingsSource } from "@shared/ui/components/settings/settings-source.helpers";
import { SettingsSourceTags } from "@shared/ui/components/settings/settings-source-tags.component";
import { SettingsSurfaceCard } from "@shared/ui/components/settings/settings-surface-card.component";

const MIME_TYPE_OPTIONS: Array<{ label: string; value: string }> = [
  { label: "image/jpeg", value: "image/jpeg" },
  { label: "image/png", value: "image/png" },
  { label: "image/webp", value: "image/webp" },
  { label: "application/pdf", value: "application/pdf" },
];

const DEFAULT_SETTINGS: WorkOrderWorkspaceSettings = {
  defaultPriority: "medium",
  defaultEstimatedDurationMinutes: 60,
  autoFillDueAtOnCreate: true,
  defaultDueInHours: 24,
  dueSoonWindowHours: 24,
  requireWorkerOnCreate: false,
  requireChecklistToComplete: false,
  requireAttachmentToComplete: false,
  attachmentsEnabled: true,
  maxAttachmentsPerWorkOrder: 25,
  maxAttachmentSizeMb: 25,
  allowedAttachmentMimeTypes: MIME_TYPE_OPTIONS.map((item) => item.value),
};

function clampInteger(value: number | undefined, min: number, max: number, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  const rounded = Math.round(parsed);
  if (rounded < min) return min;
  if (rounded > max) return max;
  return rounded;
}

function normalizeMimeTypes(value: string[] | undefined): string[] {
  if (!Array.isArray(value) || value.length === 0) {
    return [...DEFAULT_SETTINGS.allowedAttachmentMimeTypes];
  }

  const normalized = Array.from(
    new Set(
      value
        .map((item) => item?.trim().toLowerCase())
        .filter((item): item is string => Boolean(item))
    )
  );
  return normalized.length > 0 ? normalized.slice(0, 25) : [...DEFAULT_SETTINGS.allowedAttachmentMimeTypes];
}

function normalizeSettings(input?: Partial<WorkOrderWorkspaceSettings>): WorkOrderWorkspaceSettings {
  return {
    defaultPriority:
      input?.defaultPriority === "low" ||
      input?.defaultPriority === "medium" ||
      input?.defaultPriority === "high" ||
      input?.defaultPriority === "urgent"
        ? input.defaultPriority
        : DEFAULT_SETTINGS.defaultPriority,
    defaultEstimatedDurationMinutes: clampInteger(
      input?.defaultEstimatedDurationMinutes,
      15,
      24 * 60,
      DEFAULT_SETTINGS.defaultEstimatedDurationMinutes
    ),
    autoFillDueAtOnCreate:
      typeof input?.autoFillDueAtOnCreate === "boolean"
        ? input.autoFillDueAtOnCreate
        : DEFAULT_SETTINGS.autoFillDueAtOnCreate,
    defaultDueInHours: clampInteger(input?.defaultDueInHours, 1, 30 * 24, DEFAULT_SETTINGS.defaultDueInHours),
    dueSoonWindowHours: clampInteger(input?.dueSoonWindowHours, 1, 7 * 24, DEFAULT_SETTINGS.dueSoonWindowHours),
    requireWorkerOnCreate:
      typeof input?.requireWorkerOnCreate === "boolean"
        ? input.requireWorkerOnCreate
        : DEFAULT_SETTINGS.requireWorkerOnCreate,
    requireChecklistToComplete:
      typeof input?.requireChecklistToComplete === "boolean"
        ? input.requireChecklistToComplete
        : DEFAULT_SETTINGS.requireChecklistToComplete,
    requireAttachmentToComplete:
      typeof input?.requireAttachmentToComplete === "boolean"
        ? input.requireAttachmentToComplete
        : DEFAULT_SETTINGS.requireAttachmentToComplete,
    attachmentsEnabled:
      typeof input?.attachmentsEnabled === "boolean"
        ? input.attachmentsEnabled
        : DEFAULT_SETTINGS.attachmentsEnabled,
    maxAttachmentsPerWorkOrder: clampInteger(
      input?.maxAttachmentsPerWorkOrder,
      1,
      200,
      DEFAULT_SETTINGS.maxAttachmentsPerWorkOrder
    ),
    maxAttachmentSizeMb: clampInteger(input?.maxAttachmentSizeMb, 1, 250, DEFAULT_SETTINGS.maxAttachmentSizeMb),
    allowedAttachmentMimeTypes: normalizeMimeTypes(input?.allowedAttachmentMimeTypes),
  };
}

function WorkOrderSettingsPageContent(): React.ReactElement {
  const [workspaceId, setWorkspaceId] = React.useState<string | undefined>(() => {
    const ws = companyService.getWorkspaceValue() as { workspaceId?: string; id?: string } | null;
    return (ws?.workspaceId ?? ws?.id) as string | undefined;
  });
  const [source, setSource] = React.useState<SettingsSource>("defaults");
  const [updatedAt, setUpdatedAt] = React.useState<string | undefined>(undefined);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [form] = Form.useForm<WorkOrderWorkspaceSettings>();
  const isDevEnvironment = import.meta.env.MODE !== "production";

  React.useEffect(() => {
    const sub = companyService.getWorkspace$().subscribe((ws) => {
      const nextId = (ws as DataMap)?.workspaceId ?? (ws as DataMap)?.id;
      setWorkspaceId(nextId as string | undefined);
    });
    return () => sub.unsubscribe();
  }, []);

  const applyBundle = React.useCallback((bundle: WorkOrderWorkspaceSettingsBundle) => {
    const normalized = normalizeSettings(bundle.settings);
    setSource(bundle.source);
    setUpdatedAt(bundle.updatedAt);
    form.setFieldsValue(normalized);
  }, [form]);

  const loadSettings = React.useCallback(async () => {
    if (!workspaceId) {
      form.setFieldsValue(DEFAULT_SETTINGS);
      setSource("defaults");
      setUpdatedAt(undefined);
      return;
    }

    setLoading(true);
    try {
      const bundle = await getWorkOrderSettings(workspaceId);
      applyBundle(bundle);
    } catch (_err) {
      message.error("Failed to load work-order settings.");
    } finally {
      setLoading(false);
    }
  }, [applyBundle, form, workspaceId]);

  React.useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  const handleSubmit = async (values: WorkOrderWorkspaceSettings) => {
    if (!workspaceId) {
      message.error("Workspace is required.");
      return;
    }

    setSaving(true);
    try {
      const userUid = usersAuthService.getSessionValue()?.uid ?? null;
      const normalizedValues = normalizeSettings(values);
      const bundle = await upsertWorkOrderSettings(workspaceId, normalizedValues, userUid);
      applyBundle(bundle);
      message.success("Work-order settings saved.");
    } catch (_err) {
      message.error("Failed to save work-order settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    form.setFieldsValue(DEFAULT_SETTINGS);
  };

  return (
    <div data-cy="work-order-settings-page">
      <BaseTemplate
        content={
          <PageStack>
            <SettingsPageHeader
              icon={<Settings2 size={22} />}
              title="Work-order settings"
              description="Configure default behavior and validation rules per workspace."
              meta={
                <SettingsSourceTags
                  source={source}
                  updatedAt={updatedAt}
                  formatUpdatedAt={(value) => formatAppDateTime(value, "--")}
                />
              }
            />

            <SettingsSurfaceCard
              loading={loading}
            >
              <Alert
                showIcon
                type="info"
                style={{ marginBottom: 16 }}
                message="These settings are workspace-specific and start with default values."
              />

              <Form<WorkOrderWorkspaceSettings>
                form={form}
                layout="vertical"
                initialValues={DEFAULT_SETTINGS}
                onFinish={handleSubmit}
                data-cy="work-order-settings-form"
              >
                <Tabs
                  defaultActiveKey="planning"
                  data-cy="work-order-settings-tabs"
                  items={[
                    {
                      key: "planning",
                      label: (
                        <span data-cy="work-order-settings-tab-planning">
                          <IconLabel icon={<CalendarClock size={14} />} text="Planning" />
                        </span>
                      ),
                      children: (
                      <>
                        <Typography.Title level={5} style={{ marginTop: 0 }}>
                          Planning defaults
                        </Typography.Title>
                        <Space size={16} style={{ width: "100%", display: "flex", flexWrap: "wrap" }}>
                          <Form.Item
                            name="defaultPriority"
                            label={<IconLabel icon={<SlidersHorizontal size={14} />} text="Default priority" />}
                            style={{ minWidth: 240 }}
                          >
                            <Select
                              options={[
                                { value: "low", label: "Low" },
                                { value: "medium", label: "Medium" },
                                { value: "high", label: "High" },
                                { value: "urgent", label: "Urgent" },
                              ]}
                              data-cy="work-order-settings-default-priority-select"
                            />
                          </Form.Item>

                          <Form.Item
                            name="defaultEstimatedDurationMinutes"
                            label={<IconLabel icon={<CalendarClock size={14} />} text="Default estimated duration (min)" />}
                            style={{ minWidth: 240 }}
                          >
                            <InputNumber
                              min={15}
                              max={24 * 60}
                              step={15}
                              style={{ width: "100%" }}
                              data-cy="work-order-settings-default-duration-input"
                            />
                          </Form.Item>

                          <Form.Item
                            name="defaultDueInHours"
                            label={<IconLabel icon={<CalendarClock size={14} />} text="Default due in (hours)" />}
                            style={{ minWidth: 240 }}
                          >
                            <InputNumber
                              min={1}
                              max={30 * 24}
                              step={1}
                              style={{ width: "100%" }}
                              data-cy="work-order-settings-default-due-hours-input"
                            />
                          </Form.Item>

                          <Form.Item
                            name="dueSoonWindowHours"
                            label={<IconLabel icon={<CalendarClock size={14} />} text="Due-soon window (hours)" />}
                            style={{ minWidth: 240 }}
                          >
                            <InputNumber
                              min={1}
                              max={7 * 24}
                              step={1}
                              style={{ width: "100%" }}
                              data-cy="work-order-settings-due-soon-window-input"
                            />
                          </Form.Item>
                        </Space>

                        <Form.Item
                          name="autoFillDueAtOnCreate"
                          valuePropName="checked"
                          label={<IconLabel icon={<CalendarClock size={14} />} text="Auto-fill due date on creation" />}
                        >
                          <Switch data-cy="work-order-settings-auto-fill-due-switch" />
                        </Form.Item>
                      </>
                    ),
                  },
                  {
                    key: "workflow",
                    label: (
                      <span data-cy="work-order-settings-tab-workflow">
                        <IconLabel icon={<ShieldCheck size={14} />} text="Workflow" />
                      </span>
                    ),
                    children: (
                      <>
                        <Typography.Title level={5} style={{ marginTop: 0 }}>
                          Workflow validations
                        </Typography.Title>
                        <Space size={16} style={{ width: "100%", display: "flex", flexWrap: "wrap" }}>
                          <Form.Item
                            name="requireWorkerOnCreate"
                            valuePropName="checked"
                            label={<IconLabel icon={<ShieldCheck size={14} />} text="Require worker on create" />}
                          >
                            <Switch data-cy="work-order-settings-require-worker-switch" />
                          </Form.Item>
                          <Form.Item
                            name="requireChecklistToComplete"
                            valuePropName="checked"
                            label={<IconLabel icon={<ShieldCheck size={14} />} text="Require full checklist to complete" />}
                          >
                            <Switch data-cy="work-order-settings-require-checklist-switch" />
                          </Form.Item>
                          <Form.Item
                            name="requireAttachmentToComplete"
                            valuePropName="checked"
                            label={<IconLabel icon={<ShieldCheck size={14} />} text="Require attachment to complete" />}
                          >
                            <Switch data-cy="work-order-settings-require-attachment-switch" />
                          </Form.Item>
                        </Space>
                      </>
                    ),
                  },
                  {
                    key: "attachments",
                    label: (
                      <span data-cy="work-order-settings-tab-attachments">
                        <IconLabel icon={<Paperclip size={14} />} text="Attachments" />
                      </span>
                    ),
                    children: (
                      <>
                        <Typography.Title level={5} style={{ marginTop: 0 }}>
                          Attachment rules
                        </Typography.Title>
                        <Space size={16} style={{ width: "100%", display: "flex", flexWrap: "wrap" }}>
                          <Form.Item
                            name="attachmentsEnabled"
                            valuePropName="checked"
                            label={<IconLabel icon={<Paperclip size={14} />} text="Enable attachments" />}
                          >
                            <Switch data-cy="work-order-settings-attachments-enabled-switch" />
                          </Form.Item>
                          <Form.Item
                            name="maxAttachmentsPerWorkOrder"
                            label={<IconLabel icon={<Paperclip size={14} />} text="Max files per work order" />}
                            style={{ minWidth: 240 }}
                          >
                            <InputNumber
                              min={1}
                              max={200}
                              step={1}
                              style={{ width: "100%" }}
                              data-cy="work-order-settings-max-attachments-input"
                            />
                          </Form.Item>
                          <Form.Item
                            name="maxAttachmentSizeMb"
                            label={<IconLabel icon={<Paperclip size={14} />} text="Max file size (MB)" />}
                            style={{ minWidth: 240 }}
                          >
                            <InputNumber
                              min={1}
                              max={250}
                              step={1}
                              style={{ width: "100%" }}
                              data-cy="work-order-settings-max-attachment-size-input"
                            />
                          </Form.Item>
                        </Space>

                        <Form.Item
                          name="allowedAttachmentMimeTypes"
                          label={<IconLabel icon={<Paperclip size={14} />} text="Allowed MIME types" />}
                        >
                          <Select
                            mode="tags"
                            options={MIME_TYPE_OPTIONS}
                            tokenSeparators={[",", " "]}
                            style={{ width: "100%" }}
                            data-cy="work-order-settings-allowed-mime-select"
                          />
                        </Form.Item>
                      </>
                    ),
                  },
                  {
                    key: "billing-automation",
                    label: (
                      <span data-cy="work-order-settings-tab-billing">
                        <IconLabel icon={<ReceiptText size={14} />} text="Billing automation" />
                      </span>
                    ),
                    children: (
                      <>
                        <Typography.Title level={5} style={{ marginTop: 0 }}>
                          Execution to billing flow
                        </Typography.Title>
                        <Typography.Paragraph type="secondary" style={{ marginBottom: 8 }}>
                          Final execution statuses can automatically create finance entries. NF-e
                          trigger is optional and depends on billing settings.
                        </Typography.Paragraph>
                        <Alert
                          showIcon
                          type="info"
                          style={{ marginBottom: 8 }}
                          message="Configure module billing + NF-e in global settings"
                          description="Open workspace billing settings to enable/disable automation for Work Order and Schedule."
                        />
                        {isDevEnvironment ? (
                          <Alert
                            showIcon
                            type="warning"
                            style={{ marginBottom: 8 }}
                            message="Development environment"
                            description="GOV endpoints may be unavailable in dev. Financial launch still works independently of NF-e emission."
                          />
                        ) : null}
                        <Button
                          icon={<ExternalLink size={14} />}
                          onClick={() => {
                            if (typeof window !== "undefined") window.location.assign("/settings");
                          }}
                          data-cy="work-order-settings-open-billing-button"
                        >
                          Open billing settings
                        </Button>
                      </>
                    ),
                  },
                ]}
              />

              <Space style={{ marginTop: 8 }}>
                <Button
                  htmlType="button"
                  onClick={handleResetDefaults}
                  disabled={saving}
                  icon={<RotateCcw size={15} />}
                  data-cy="work-order-settings-restore-defaults-button"
                >
                  Restore defaults
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={saving}
                  icon={<Save size={16} />}
                  data-cy="work-order-settings-save-button"
                >
                  Save settings
                </Button>
              </Space>
              </Form>
            </SettingsSurfaceCard>
          </PageStack>
        }
      />
    </div>
  );
}

export class WorkOrderSettingsPage extends BasePage {
  protected override options = {
    title: "Work-order settings | WorklyHub",
    requiresAuth: true,
  };

  protected override renderPage(): React.ReactNode {
    return <WorkOrderSettingsPageContent />;
  }
}

export default WorkOrderSettingsPage;
