import React from "react";
import { i18n as appI18n } from "@core/i18n";
import {
  Alert,
  Button,
  Form,
  Input,
  InputNumber,
  Space,
  Switch,
  Tabs,
  Typography,
  message,
} from "antd";
import {
  BellRing,
  Boxes,
  ClipboardList,
  PackageCheck,
  RotateCcw,
  Save,
  Settings2,
} from "lucide-react";

import { formatAppDateTime } from "@core/utils/date-time";
import { companyService } from "@modules/company/services/company.service";
import type { InventoryWorkspaceSettings, InventoryWorkspaceSettingsBundle } from "@modules/inventory/services/inventory-api";
import {
  getInventorySettings,
  upsertInventorySettings,
} from "@modules/inventory/services/inventory.http.service";
import { usersAuthService } from "@modules/users/services/auth.service";
import { BasePage } from "@shared/base/base.page";
import { BaseTemplate } from "@shared/base/base.template";
import { IconLabel } from "@shared/ui/components/settings/icon-label.component";
import { SettingsPageHeader } from "@shared/ui/components/settings/settings-page-header.component";
import { type SettingsSource } from "@shared/ui/components/settings/settings-source.helpers";
import { SettingsSourceTags } from "@shared/ui/components/settings/settings-source-tags.component";
import { SettingsSurfaceCard } from "@shared/ui/components/settings/settings-surface-card.component";

const DEFAULT_SETTINGS: InventoryWorkspaceSettings = {
  defaultMinQuantity: 0,
  defaultLocation: null,
  defaultIsActive: true,
  requireSku: false,
  requireCategory: false,
  requireLocation: false,
  requireReasonOnManualMovement: false,
  suggestionCoverageDays: 7,
  highSeverityThresholdPercent: 50,
};

function clampInteger(value: number | undefined, min: number, max: number, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  const rounded = Math.round(parsed);
  if (rounded < min) return min;
  if (rounded > max) return max;
  return rounded;
}

function normalizeLocation(value: string | null | undefined): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, 160);
}

function normalizeSettings(
  input?: Partial<InventoryWorkspaceSettings>
): InventoryWorkspaceSettings {
  return {
    defaultMinQuantity: clampInteger(
      input?.defaultMinQuantity,
      0,
      100000,
      DEFAULT_SETTINGS.defaultMinQuantity
    ),
    defaultLocation: normalizeLocation(input?.defaultLocation),
    defaultIsActive:
      typeof input?.defaultIsActive === "boolean"
        ? input.defaultIsActive
        : DEFAULT_SETTINGS.defaultIsActive,
    requireSku:
      typeof input?.requireSku === "boolean"
        ? input.requireSku
        : DEFAULT_SETTINGS.requireSku,
    requireCategory:
      typeof input?.requireCategory === "boolean"
        ? input.requireCategory
        : DEFAULT_SETTINGS.requireCategory,
    requireLocation:
      typeof input?.requireLocation === "boolean"
        ? input.requireLocation
        : DEFAULT_SETTINGS.requireLocation,
    requireReasonOnManualMovement:
      typeof input?.requireReasonOnManualMovement === "boolean"
        ? input.requireReasonOnManualMovement
        : DEFAULT_SETTINGS.requireReasonOnManualMovement,
    suggestionCoverageDays: clampInteger(
      input?.suggestionCoverageDays,
      1,
      30,
      DEFAULT_SETTINGS.suggestionCoverageDays
    ),
    highSeverityThresholdPercent: clampInteger(
      input?.highSeverityThresholdPercent,
      10,
      100,
      DEFAULT_SETTINGS.highSeverityThresholdPercent
    ),
  };
}

function InventorySettingsPageContent(): React.ReactElement {
  const [workspaceId, setWorkspaceId] = React.useState<string | undefined>(() => {
    const ws = companyService.getWorkspaceValue() as { workspaceId?: string; id?: string } | null;
    return (ws?.workspaceId ?? ws?.id) as string | undefined;
  });
  const [source, setSource] = React.useState<SettingsSource>("defaults");
  const [updatedAt, setUpdatedAt] = React.useState<string | undefined>(undefined);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [form] = Form.useForm<InventoryWorkspaceSettings>();

  React.useEffect(() => {
    const sub = companyService.getWorkspace$().subscribe((ws) => {
      const nextId = (ws as DataMap)?.workspaceId ?? (ws as DataMap)?.id;
      setWorkspaceId(nextId as string | undefined);
    });
    return () => sub.unsubscribe();
  }, []);

  const applyBundle = React.useCallback(
    (bundle: InventoryWorkspaceSettingsBundle) => {
      const normalized = normalizeSettings(bundle.settings);
      setSource(bundle.source);
      setUpdatedAt(bundle.updatedAt);
      form.setFieldsValue({
        ...normalized,
        defaultLocation: normalized.defaultLocation ?? undefined,
      });
    },
    [form]
  );

  const loadSettings = React.useCallback(async () => {
    if (!workspaceId) {
      form.setFieldsValue(DEFAULT_SETTINGS);
      setSource("defaults");
      setUpdatedAt(undefined);
      return;
    }

    setLoading(true);
    try {
      const bundle = await getInventorySettings(workspaceId);
      applyBundle(bundle);
    } catch (_err) {
      message.error("Failed to load inventory settings.");
    } finally {
      setLoading(false);
    }
  }, [applyBundle, form, workspaceId]);

  React.useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  const handleSubmit = async (values: InventoryWorkspaceSettings) => {
    if (!workspaceId) {
      message.error("Workspace is required.");
      return;
    }

    setSaving(true);
    try {
      const userUid = usersAuthService.getSessionValue()?.uid ?? null;
      const normalized = normalizeSettings(values);
      const bundle = await upsertInventorySettings(workspaceId, normalized, userUid);
      applyBundle(bundle);
      message.success("Inventory settings saved.");
    } catch (_err) {
      message.error("Failed to save inventory settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleRestoreDefaults = () => {
    form.setFieldsValue(DEFAULT_SETTINGS);
  };

  return (
    <BaseTemplate
      content={
        <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: 16 }}>
          <SettingsPageHeader
            icon={<Settings2 size={20} />}
            title="Inventory settings"
            description="Configure defaults and operational rules by workspace."
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

            <Form<InventoryWorkspaceSettings>
              form={form}
              layout="vertical"
              initialValues={DEFAULT_SETTINGS}
              onFinish={handleSubmit}
            >
              <Tabs
                defaultActiveKey="catalog"
                items={[
                  {
                    key: "catalog",
                    label: <IconLabel icon={<Boxes size={14} />} text="Catalog" />,
                    children: (
                      <>
                        <Typography.Title level={5} style={{ marginTop: 0 }}>
                          Item defaults and required fields
                        </Typography.Title>
                        <Space size={16} style={{ width: "100%", display: "flex", flexWrap: "wrap" }}>
                          <Form.Item
                            name="defaultMinQuantity"
                            label={<IconLabel icon={<PackageCheck size={14} />} text="Default minimum stock" />}
                            style={{ minWidth: 240 }}
                          >
                            <InputNumber min={0} max={100000} step={1} style={{ width: "100%" }} />
                          </Form.Item>

                          <Form.Item
                            name="defaultLocation"
                            label={<IconLabel icon={<PackageCheck size={14} />} text="Default location" />}
                            style={{ minWidth: 280, flex: 1 }}
                          >
                            <Input maxLength={160} placeholder="Optional fallback location" />
                          </Form.Item>
                        </Space>

                        <Space size={16} style={{ width: "100%", display: "flex", flexWrap: "wrap" }}>
                          <Form.Item
                            name="defaultIsActive"
                            valuePropName="checked"
                            label={<IconLabel icon={<PackageCheck size={14} />} text="Create items as active" />}
                          >
                            <Switch />
                          </Form.Item>
                          <Form.Item
                            name="requireSku"
                            valuePropName="checked"
                            label={<IconLabel icon={<PackageCheck size={14} />} text="Require SKU" />}
                          >
                            <Switch />
                          </Form.Item>
                          <Form.Item
                            name="requireCategory"
                            valuePropName="checked"
                            label={<IconLabel icon={<PackageCheck size={14} />} text="Require category" />}
                          >
                            <Switch />
                          </Form.Item>
                          <Form.Item
                            name="requireLocation"
                            valuePropName="checked"
                            label={<IconLabel icon={<PackageCheck size={14} />} text="Require location" />}
                          >
                            <Switch />
                          </Form.Item>
                        </Space>
                      </>
                    ),
                  },
                  {
                    key: "movements",
                    label: <IconLabel icon={<ClipboardList size={14} />} text="Movements" />,
                    children: (
                      <>
                        <Typography.Title level={5} style={{ marginTop: 0 }}>
                          Movement policy
                        </Typography.Title>
                        <Form.Item
                          name="requireReasonOnManualMovement"
                          valuePropName="checked"
                          label={
                            <IconLabel
                              icon={<ClipboardList size={14} />}
                              text="Require reason on manual and adjustment movements"
                            />
                          }
                        >
                          <Switch />
                        </Form.Item>
                      </>
                    ),
                  },
                  {
                    key: "alerts",
                    label: <IconLabel icon={<BellRing size={14} />} text="Alerts" />,
                    children: (
                      <>
                        <Typography.Title level={5} style={{ marginTop: 0 }}>
                          Alert scoring and suggestions
                        </Typography.Title>
                        <Space size={16} style={{ width: "100%", display: "flex", flexWrap: "wrap" }}>
                          <Form.Item
                            name="suggestionCoverageDays"
                            label={<IconLabel icon={<BellRing size={14} />} text="Suggestion coverage days" />}
                            style={{ minWidth: 240 }}
                          >
                            <InputNumber min={1} max={30} step={1} style={{ width: "100%" }} />
                          </Form.Item>
                          <Form.Item
                            name="highSeverityThresholdPercent"
                            label={<IconLabel icon={<BellRing size={14} />} text="High-severity threshold (%)" />}
                            style={{ minWidth: 260 }}
                          >
                            <InputNumber min={10} max={100} step={5} style={{ width: "100%" }} />
                          </Form.Item>
                        </Space>
                      </>
                    ),
                  },
                ]}
              />

              <Space style={{ marginTop: 8 }}>
                <Button htmlType="button" onClick={handleRestoreDefaults} disabled={saving} icon={<RotateCcw size={15} />}>
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

export class InventorySettingsPage extends BasePage {
  protected override options = {
    title: `${appI18n.t("inventory.pageTitles.settings")} | WorklyHub`,
    requiresAuth: true,
  };

  protected override renderPage(): React.ReactNode {
    return <InventorySettingsPageContent />;
  }
}

export default InventorySettingsPage;
