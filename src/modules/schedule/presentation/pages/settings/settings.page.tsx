import React from "react";
import {
  Alert,
  Button,
  Form,
  InputNumber,
  Select,
  Space,
  Switch,
  Tabs,
  Typography,
  message,
} from "antd";
import {
  Calendar,
  ClipboardCheck,
  RotateCcw,
  Save,
  Settings2,
  Users,
} from "lucide-react";

import { applicationService } from "@core/application/application.service";
import { formatAppDateTime } from "@core/utils/date-time";
import { companyService } from "@modules/company/services/company.service";
import type { ScheduleWorkspaceSettings } from "@modules/schedule/interfaces/schedule-settings.model";
import {
  DEFAULT_SCHEDULE_SETTINGS,
  getScheduleSettings,
  upsertScheduleSettings,
} from "@modules/schedule/services/schedule-settings.service";
import { usersAuthService } from "@modules/users/services/auth.service";
import { BasePage } from "@shared/base/base.page";
import { BaseTemplate } from "@shared/base/base.template";
import { IconLabel } from "@shared/ui/components/settings/icon-label.component";
import { SettingsPageHeader } from "@shared/ui/components/settings/settings-page-header.component";
import type { SettingsSource } from "@shared/ui/components/settings/settings-source.helpers";
import { SettingsSourceTags } from "@shared/ui/components/settings/settings-source-tags.component";
import { SettingsSurfaceCard } from "@shared/ui/components/settings/settings-surface-card.component";

type SettingsFormValues = Omit<ScheduleWorkspaceSettings, "defaultCategoryId"> & {
  defaultCategoryId?: string;
};

function clampInteger(
  value: number | undefined,
  min: number,
  max: number,
  fallback: number
): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  const rounded = Math.round(parsed);
  if (rounded < min) return min;
  if (rounded > max) return max;
  return rounded;
}

function normalizeCategoryId(value: string | null | undefined): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeSettings(
  input?: Partial<ScheduleWorkspaceSettings>
): ScheduleWorkspaceSettings {
  const noShowPolicy =
    input?.noShowPolicy === "none" ||
    input?.noShowPolicy === "flag" ||
    input?.noShowPolicy === "charge"
      ? input.noShowPolicy
      : DEFAULT_SCHEDULE_SETTINGS.noShowPolicy;
  const noShowFeePercent = clampInteger(
    input?.noShowFeePercent,
    0,
    100,
    DEFAULT_SCHEDULE_SETTINGS.noShowFeePercent
  );

  return {
    defaultDurationMinutes: clampInteger(
      input?.defaultDurationMinutes,
      15,
      240,
      DEFAULT_SCHEDULE_SETTINGS.defaultDurationMinutes
    ),
    defaultDayPart:
      input?.defaultDayPart === "morning" ||
      input?.defaultDayPart === "afternoon" ||
      input?.defaultDayPart === "evening"
        ? input.defaultDayPart
        : DEFAULT_SCHEDULE_SETTINGS.defaultDayPart,
    defaultCategoryId: normalizeCategoryId(input?.defaultCategoryId),
    requireDescription:
      typeof input?.requireDescription === "boolean"
        ? input.requireDescription
        : DEFAULT_SCHEDULE_SETTINGS.requireDescription,
    requireService:
      typeof input?.requireService === "boolean"
        ? input.requireService
        : DEFAULT_SCHEDULE_SETTINGS.requireService,
    requireEmployee:
      typeof input?.requireEmployee === "boolean"
        ? input.requireEmployee
        : DEFAULT_SCHEDULE_SETTINGS.requireEmployee,
    autoSelectFirstService:
      typeof input?.autoSelectFirstService === "boolean"
        ? input.autoSelectFirstService
        : DEFAULT_SCHEDULE_SETTINGS.autoSelectFirstService,
    autoSelectFirstEmployee:
      typeof input?.autoSelectFirstEmployee === "boolean"
        ? input.autoSelectFirstEmployee
        : DEFAULT_SCHEDULE_SETTINGS.autoSelectFirstEmployee,
    enableInventoryTracking:
      typeof input?.enableInventoryTracking === "boolean"
        ? input.enableInventoryTracking
        : DEFAULT_SCHEDULE_SETTINGS.enableInventoryTracking,
    confirmationPolicy:
      input?.confirmationPolicy === "required" ||
      input?.confirmationPolicy === "optional"
        ? input.confirmationPolicy
        : DEFAULT_SCHEDULE_SETTINGS.confirmationPolicy,
    reminderEnabled:
      typeof input?.reminderEnabled === "boolean"
        ? input.reminderEnabled
        : DEFAULT_SCHEDULE_SETTINGS.reminderEnabled,
    reminderLeadMinutes: clampInteger(
      input?.reminderLeadMinutes,
      15,
      1440,
      DEFAULT_SCHEDULE_SETTINGS.reminderLeadMinutes
    ),
    noShowPolicy,
    noShowFeePercent: noShowPolicy === "charge" ? noShowFeePercent : 0,
  };
}

function toFormValues(settings: ScheduleWorkspaceSettings): SettingsFormValues {
  return {
    ...settings,
    defaultCategoryId: settings.defaultCategoryId ?? undefined,
  };
}

function ScheduleSettingsPageContent(): React.ReactElement {
  const [workspaceId, setWorkspaceId] = React.useState<string | undefined>(() => {
    const workspace = companyService.getWorkspaceValue() as
      | { workspaceId?: string; id?: string }
      | null;
    return (workspace?.workspaceId ?? workspace?.id) as string | undefined;
  });
  const [source, setSource] = React.useState<SettingsSource>("defaults");
  const [updatedAt, setUpdatedAt] = React.useState<string | undefined>(undefined);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [categories, setCategories] = React.useState<
    Array<{ id: string; label: string }>
  >([]);
  const [form] = Form.useForm<SettingsFormValues>();

  React.useEffect(() => {
    const sub = companyService.getWorkspace$().subscribe((workspace) => {
      const nextId = (workspace as DataMap)?.workspaceId ?? (workspace as DataMap)?.id;
      setWorkspaceId(nextId as string | undefined);
    });
    return () => sub.unsubscribe();
  }, []);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const raw = await applicationService.fetchEventCategories();
        if (!mounted) return;
        const next = (raw ?? [])
          .map((category) => ({
            id: String(category.id),
            label: category.label,
          }))
          .filter((category) => category.id.length > 0);
        setCategories(next);
      } catch {
        if (!mounted) return;
        setCategories([]);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const applySettings = React.useCallback(
    (
      bundle: {
        settings: ScheduleWorkspaceSettings;
        source: SettingsSource;
        updatedAt?: string;
      }
    ) => {
      const normalized = normalizeSettings(bundle.settings);
      setSource(bundle.source);
      setUpdatedAt(bundle.updatedAt);
      form.setFieldsValue(toFormValues(normalized));
    },
    [form]
  );

  const loadSettings = React.useCallback(async () => {
    if (!workspaceId) {
      applySettings({
        settings: DEFAULT_SCHEDULE_SETTINGS,
        source: "defaults",
      });
      return;
    }

    setLoading(true);
    try {
      const bundle = await getScheduleSettings(workspaceId);
      applySettings(bundle);
    } catch {
      message.error("Failed to load schedule settings.");
    } finally {
      setLoading(false);
    }
  }, [applySettings, workspaceId]);

  React.useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  const handleRestoreDefaults = () => {
    form.setFieldsValue(toFormValues(DEFAULT_SCHEDULE_SETTINGS));
  };

  const handleSubmit = async (values: SettingsFormValues) => {
    if (!workspaceId) {
      message.error("Workspace is required.");
      return;
    }

    setSaving(true);
    try {
      const updatedBy = usersAuthService.getSessionValue()?.uid ?? null;
      const normalized = normalizeSettings(values);
      const bundle = await upsertScheduleSettings(workspaceId, normalized, updatedBy);
      applySettings(bundle);
      message.success("Schedule settings saved.");
    } catch {
      message.error("Failed to save schedule settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <BaseTemplate
      content={
        <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: 16 }}>
          <SettingsPageHeader
            icon={<Settings2 size={20} />}
            title="Schedule settings"
            description="Configure booking defaults and validation rules by workspace."
            meta={
              <SettingsSourceTags
                source={source}
                updatedAt={updatedAt}
                formatUpdatedAt={(value) => formatAppDateTime(value, "--")}
              />
            }
          />

          <SettingsSurfaceCard loading={loading}>
            <Alert
              showIcon
              type="info"
              style={{ marginBottom: 16 }}
              message="These settings are applied to new appointments and event edits."
            />

            <Form<SettingsFormValues>
              form={form}
              layout="vertical"
              initialValues={toFormValues(DEFAULT_SCHEDULE_SETTINGS)}
              onFinish={handleSubmit}
            >
              <Tabs
                defaultActiveKey="booking"
                items={[
                  {
                    key: "booking",
                    label: <IconLabel icon={<Calendar size={14} />} text="Booking defaults" />,
                    children: (
                      <>
                        <Typography.Title level={5} style={{ marginTop: 0 }}>
                          Default values for new appointments
                        </Typography.Title>
                        <Space
                          size={16}
                          style={{ width: "100%", display: "flex", flexWrap: "wrap" }}
                        >
                          <Form.Item
                            name="defaultDurationMinutes"
                            label="Default duration (minutes)"
                            style={{ minWidth: 220 }}
                          >
                            <InputNumber min={15} max={240} step={5} style={{ width: "100%" }} />
                          </Form.Item>

                          <Form.Item
                            name="defaultDayPart"
                            label="Preferred day part"
                            style={{ minWidth: 220 }}
                          >
                            <Select
                              options={[
                                { value: "morning", label: "Morning" },
                                { value: "afternoon", label: "Afternoon" },
                                { value: "evening", label: "Evening" },
                              ]}
                            />
                          </Form.Item>

                          <Form.Item
                            name="defaultCategoryId"
                            label="Default category"
                            style={{ minWidth: 280, flex: 1 }}
                          >
                            <Select
                              allowClear
                              placeholder="Optional"
                              options={categories.map((category) => ({
                                value: category.id,
                                label: category.label,
                              }))}
                            />
                          </Form.Item>
                        </Space>
                      </>
                    ),
                  },
                  {
                    key: "validation",
                    label: <IconLabel icon={<ClipboardCheck size={14} />} text="Validation" />,
                    children: (
                      <>
                        <Typography.Title level={5} style={{ marginTop: 0 }}>
                          Required fields and constraints
                        </Typography.Title>
                        <Space
                          size={16}
                          style={{ width: "100%", display: "flex", flexWrap: "wrap" }}
                        >
                          <Form.Item
                            name="requireDescription"
                            valuePropName="checked"
                            label="Require description"
                          >
                            <Switch />
                          </Form.Item>

                          <Form.Item
                            name="requireService"
                            valuePropName="checked"
                            label="Require at least one service"
                          >
                            <Switch />
                          </Form.Item>

                          <Form.Item
                            name="requireEmployee"
                            valuePropName="checked"
                            label="Require assigned employee"
                          >
                            <Switch />
                          </Form.Item>

                          <Form.Item
                            name="enableInventoryTracking"
                            valuePropName="checked"
                            label="Enable inventory lines in events"
                          >
                            <Switch />
                          </Form.Item>
                        </Space>
                      </>
                    ),
                  },
                  {
                    key: "automation",
                    label: <IconLabel icon={<Users size={14} />} text="Automation" />,
                    children: (
                      <>
                        <Typography.Title level={5} style={{ marginTop: 0 }}>
                          Assisted assignment
                        </Typography.Title>
                        <Space
                          size={16}
                          style={{ width: "100%", display: "flex", flexWrap: "wrap" }}
                        >
                          <Form.Item
                            name="autoSelectFirstService"
                            valuePropName="checked"
                            label="Auto-select first service"
                          >
                            <Switch />
                          </Form.Item>

                          <Form.Item
                            name="autoSelectFirstEmployee"
                            valuePropName="checked"
                            label="Auto-select first employee"
                          >
                            <Switch />
                          </Form.Item>
                        </Space>
                        <Alert
                          showIcon
                          type="warning"
                          style={{ marginTop: 8 }}
                          message={
                            <span>
                              Auto-selection applies only when creating a new event.
                            </span>
                          }
                        />
                      </>
                    ),
                  },
                  {
                    key: "customer-policy",
                    label: (
                      <IconLabel
                        icon={<ClipboardCheck size={14} />}
                        text="Customer policy"
                      />
                    ),
                    children: (
                      <>
                        <Typography.Title level={5} style={{ marginTop: 0 }}>
                          Confirmation, reminder and no-show policy
                        </Typography.Title>
                        <Space
                          size={16}
                          style={{ width: "100%", display: "flex", flexWrap: "wrap" }}
                        >
                          <Form.Item
                            name="confirmationPolicy"
                            label="Confirmation policy"
                            style={{ minWidth: 280 }}
                          >
                            <Select
                              options={[
                                {
                                  value: "required",
                                  label: "Require confirmation (default pending)",
                                },
                                {
                                  value: "optional",
                                  label: "Optional confirmation (default confirmed)",
                                },
                              ]}
                            />
                          </Form.Item>

                          <Form.Item
                            name="reminderEnabled"
                            valuePropName="checked"
                            label="Enable automated reminder"
                          >
                            <Switch />
                          </Form.Item>

                          <Form.Item shouldUpdate noStyle>
                            {({ getFieldValue }) => (
                              <Form.Item
                                name="reminderLeadMinutes"
                                label="Reminder lead time (minutes)"
                                style={{ minWidth: 260 }}
                              >
                                <InputNumber
                                  min={15}
                                  max={1440}
                                  step={15}
                                  style={{ width: "100%" }}
                                  disabled={!getFieldValue("reminderEnabled")}
                                />
                              </Form.Item>
                            )}
                          </Form.Item>
                        </Space>

                        <Space
                          size={16}
                          style={{ width: "100%", display: "flex", flexWrap: "wrap" }}
                        >
                          <Form.Item
                            name="noShowPolicy"
                            label="No-show policy"
                            style={{ minWidth: 280 }}
                          >
                            <Select
                              options={[
                                { value: "none", label: "No automatic action" },
                                { value: "flag", label: "Flag event as no-show" },
                                { value: "charge", label: "Charge no-show fee" },
                              ]}
                            />
                          </Form.Item>

                          <Form.Item shouldUpdate noStyle>
                            {({ getFieldValue }) => (
                              <Form.Item
                                name="noShowFeePercent"
                                label="No-show fee (%)"
                                style={{ minWidth: 220 }}
                              >
                                <InputNumber
                                  min={0}
                                  max={100}
                                  step={5}
                                  style={{ width: "100%" }}
                                  disabled={getFieldValue("noShowPolicy") !== "charge"}
                                />
                              </Form.Item>
                            )}
                          </Form.Item>
                        </Space>
                        <Alert
                          showIcon
                          type="warning"
                          style={{ marginTop: 8 }}
                          message={
                            <span>
                              Charging no-show creates financial entries when the event
                              status is set to <strong>No Show</strong>.
                            </span>
                          }
                        />
                      </>
                    ),
                  },
                ]}
              />

              <Space style={{ marginTop: 8 }}>
                <Button
                  htmlType="button"
                  onClick={handleRestoreDefaults}
                  disabled={saving}
                  icon={<RotateCcw size={15} />}
                >
                  Restore defaults
                </Button>
                <Button type="primary" htmlType="submit" loading={saving} icon={<Save size={16} />}>
                  Save settings
                </Button>
              </Space>
            </Form>
          </SettingsSurfaceCard>
        </div>
      }
    />
  );
}

export class ScheduleSettingsPage extends BasePage {
  protected override options = {
    title: "Schedule settings | WorklyHub",
    requiresAuth: true,
  };

  protected override renderPage(): React.ReactNode {
    return <ScheduleSettingsPageContent />;
  }
}

export default ScheduleSettingsPage;
