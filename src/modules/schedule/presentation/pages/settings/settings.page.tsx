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
import { i18n as appI18n } from "@core/i18n";
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
      message.error(appI18n.t("legacyInline.schedule.presentation_pages_settings_settings_page.k001"));
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
      message.error(appI18n.t("legacyInline.schedule.presentation_pages_settings_settings_page.k002"));
      return;
    }

    setSaving(true);
    try {
      const updatedBy = usersAuthService.getSessionValue()?.uid ?? null;
      const normalized = normalizeSettings(values);
      const bundle = await upsertScheduleSettings(workspaceId, normalized, updatedBy);
      applySettings(bundle);
      message.success(appI18n.t("legacyInline.schedule.presentation_pages_settings_settings_page.k003"));
    } catch {
      message.error(appI18n.t("legacyInline.schedule.presentation_pages_settings_settings_page.k004"));
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
            title={appI18n.t("legacyInline.schedule.presentation_pages_settings_settings_page.k005")}
            description={appI18n.t("legacyInline.schedule.presentation_pages_settings_settings_page.k006")}
            meta={
              <SettingsSourceTags
                source={source}
                updatedAt={updatedAt}
                formatUpdatedAt={(value) => formatAppDateTime(value, "--")}
                updatedPrefix={appI18n.t("legacyInline.schedule.presentation_pages_settings_settings_page.k007")}
                emptyLabel={appI18n.t("legacyInline.schedule.presentation_pages_settings_settings_page.k008")}
              />
            }
          />

          <SettingsSurfaceCard loading={loading}>
            <Alert
              showIcon
              type="info"
              style={{ marginBottom: 16 }}
              message={appI18n.t("legacyInline.schedule.presentation_pages_settings_settings_page.k009")}
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
                    label: <IconLabel icon={<Calendar size={14} />} text={appI18n.t("legacyInline.schedule.presentation_pages_settings_settings_page.k010")} />,
                    children: (
                      <>
                        <Typography.Title level={5} style={{ marginTop: 0 }}>
                          {appI18n.t("legacyInline.schedule.presentation_pages_settings_settings_page.k011")}
                        </Typography.Title>
                        <Space
                          size={16}
                          style={{ width: "100%", display: "flex", flexWrap: "wrap" }}
                        >
                          <Form.Item
                            name="defaultDurationMinutes"
                            label={appI18n.t("legacyInline.schedule.presentation_pages_settings_settings_page.k012")}
                            style={{ minWidth: 220 }}
                          >
                            <InputNumber min={15} max={240} step={5} style={{ width: "100%" }} />
                          </Form.Item>

                          <Form.Item
                            name="defaultDayPart"
                            label={appI18n.t("legacyInline.schedule.presentation_pages_settings_settings_page.k013")}
                            style={{ minWidth: 220 }}
                          >
                            <Select
                              options={[
                                { value: "morning", label: appI18n.t("legacyInline.schedule.presentation_pages_settings_settings_page.k014") },
                                { value: "afternoon", label: appI18n.t("legacyInline.schedule.presentation_pages_settings_settings_page.k015") },
                                { value: "evening", label: appI18n.t("legacyInline.schedule.presentation_pages_settings_settings_page.k016") },
                              ]}
                            />
                          </Form.Item>

                          <Form.Item
                            name="defaultCategoryId"
                            label={appI18n.t("legacyInline.schedule.presentation_pages_settings_settings_page.k017")}
                            style={{ minWidth: 280, flex: 1 }}
                          >
                            <Select
                              allowClear
                              placeholder={appI18n.t("legacyInline.schedule.presentation_pages_settings_settings_page.k018")}
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
                    label: <IconLabel icon={<ClipboardCheck size={14} />} text={appI18n.t("legacyInline.schedule.presentation_pages_settings_settings_page.k019")} />,
                    children: (
                      <>
                        <Typography.Title level={5} style={{ marginTop: 0 }}>
                          {appI18n.t("legacyInline.schedule.presentation_pages_settings_settings_page.k020")}
                        </Typography.Title>
                        <Space
                          size={16}
                          style={{ width: "100%", display: "flex", flexWrap: "wrap" }}
                        >
                          <Form.Item
                            name="requireDescription"
                            valuePropName="checked"
                            label={appI18n.t("legacyInline.schedule.presentation_pages_settings_settings_page.k021")}
                          >
                            <Switch />
                          </Form.Item>

                          <Form.Item
                            name="requireService"
                            valuePropName="checked"
                            label={appI18n.t("legacyInline.schedule.presentation_pages_settings_settings_page.k022")}
                          >
                            <Switch />
                          </Form.Item>

                          <Form.Item
                            name="requireEmployee"
                            valuePropName="checked"
                            label={appI18n.t("legacyInline.schedule.presentation_pages_settings_settings_page.k023")}
                          >
                            <Switch />
                          </Form.Item>

                          <Form.Item
                            name="enableInventoryTracking"
                            valuePropName="checked"
                            label={appI18n.t("legacyInline.schedule.presentation_pages_settings_settings_page.k024")}
                          >
                            <Switch />
                          </Form.Item>
                        </Space>
                      </>
                    ),
                  },
                  {
                    key: "automation",
                    label: <IconLabel icon={<Users size={14} />} text={appI18n.t("legacyInline.schedule.presentation_pages_settings_settings_page.k025")} />,
                    children: (
                      <>
                        <Typography.Title level={5} style={{ marginTop: 0 }}>
                          {appI18n.t("legacyInline.schedule.presentation_pages_settings_settings_page.k026")}
                        </Typography.Title>
                        <Space
                          size={16}
                          style={{ width: "100%", display: "flex", flexWrap: "wrap" }}
                        >
                          <Form.Item
                            name="autoSelectFirstService"
                            valuePropName="checked"
                            label={appI18n.t("legacyInline.schedule.presentation_pages_settings_settings_page.k027")}
                          >
                            <Switch />
                          </Form.Item>

                          <Form.Item
                            name="autoSelectFirstEmployee"
                            valuePropName="checked"
                            label={appI18n.t("legacyInline.schedule.presentation_pages_settings_settings_page.k028")}
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
                              {appI18n.t("legacyInline.schedule.presentation_pages_settings_settings_page.k029")}
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
                        text={appI18n.t("legacyInline.schedule.presentation_pages_settings_settings_page.k030")}
                      />
                    ),
                    children: (
                      <>
                        <Typography.Title level={5} style={{ marginTop: 0 }}>
                          {appI18n.t("legacyInline.schedule.presentation_pages_settings_settings_page.k031")}
                        </Typography.Title>
                        <Space
                          size={16}
                          style={{ width: "100%", display: "flex", flexWrap: "wrap" }}
                        >
                          <Form.Item
                            name="confirmationPolicy"
                            label={appI18n.t("legacyInline.schedule.presentation_pages_settings_settings_page.k032")}
                            style={{ minWidth: 280 }}
                          >
                            <Select
                              options={[
                                {
                                  value: "required",
                                  label: appI18n.t("legacyInline.schedule.presentation_pages_settings_settings_page.k033"),
                                },
                                {
                                  value: "optional",
                                  label: appI18n.t("legacyInline.schedule.presentation_pages_settings_settings_page.k034"),
                                },
                              ]}
                            />
                          </Form.Item>

                          <Form.Item
                            name="reminderEnabled"
                            valuePropName="checked"
                            label={appI18n.t("legacyInline.schedule.presentation_pages_settings_settings_page.k035")}
                          >
                            <Switch />
                          </Form.Item>

                          <Form.Item shouldUpdate noStyle>
                            {({ getFieldValue }) => (
                              <Form.Item
                                name="reminderLeadMinutes"
                                label={appI18n.t("legacyInline.schedule.presentation_pages_settings_settings_page.k036")}
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
                            label={appI18n.t("legacyInline.schedule.presentation_pages_settings_settings_page.k037")}
                            style={{ minWidth: 280 }}
                          >
                            <Select
                              options={[
                                { value: "none", label: appI18n.t("legacyInline.schedule.presentation_pages_settings_settings_page.k038") },
                                { value: "flag", label: appI18n.t("legacyInline.schedule.presentation_pages_settings_settings_page.k039") },
                                { value: "charge", label: appI18n.t("legacyInline.schedule.presentation_pages_settings_settings_page.k040") },
                              ]}
                            />
                          </Form.Item>

                          <Form.Item shouldUpdate noStyle>
                            {({ getFieldValue }) => (
                              <Form.Item
                                name="noShowFeePercent"
                                label={appI18n.t("legacyInline.schedule.presentation_pages_settings_settings_page.k041")}
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
                              {appI18n.t("legacyInline.schedule.presentation_pages_settings_settings_page.k042")}
                              <strong>{appI18n.t("legacyInline.schedule.presentation_pages_settings_settings_page.k043")}</strong>.
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
                  {appI18n.t("legacyInline.schedule.presentation_pages_settings_settings_page.k044")}
                </Button>
                <Button type="primary" htmlType="submit" loading={saving} icon={<Save size={16} />}>
                  {appI18n.t("legacyInline.schedule.presentation_pages_settings_settings_page.k045")}
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
    title: `${appI18n.t("schedule.pageTitles.settings")} | WorklyHub`,
    requiresAuth: true,
  };

  protected override renderPage(): React.ReactNode {
    return <ScheduleSettingsPageContent />;
  }
}

export default ScheduleSettingsPage;
