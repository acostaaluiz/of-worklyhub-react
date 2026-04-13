import React from "react";
import { i18n as appI18n } from "@core/i18n";
import {
  Alert,
  Button,
  Form,
  Input,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Tabs,
  Typography,
  message,
} from "antd";
import {
  CircleDollarSign,
  ClipboardCheck,
  Plus,
  RotateCcw,
  Save,
  Settings2,
  ShieldCheck,
  Trash2,
  Users,
} from "lucide-react";

import { getMoneyMaskAdapter } from "@core/utils/mask";
import { formatAppDateTime } from "@core/utils/date-time";
import { formatMoney } from "@core/utils/currency";
import type {
  WorkspaceEmployeeAddonContract,
  WorkspaceEmployeeCapacity,
} from "@modules/billing/services/billing-api";
import { billingService } from "@modules/billing/services/billing.service";
import { companyService } from "@modules/company/services/company.service";
import type {
  EmployeeAccessProfile,
  PeopleWorkspaceSettings,
} from "@modules/people/interfaces/people-settings.model";
import {
  DEFAULT_PEOPLE_SETTINGS,
  getPeopleSettings,
  upsertPeopleSettings,
} from "@modules/people/services/people-settings.service";
import { usersAuthService } from "@modules/users/services/auth.service";
import { BasePage } from "@shared/base/base.page";
import { BaseTemplate } from "@shared/base/base.template";
import PageSkeleton from "@shared/ui/components/page-skeleton/page-skeleton.component";
import { IconLabel } from "@shared/ui/components/settings/icon-label.component";
import { SettingsPageHeader } from "@shared/ui/components/settings/settings-page-header.component";
import type { SettingsSource } from "@shared/ui/components/settings/settings-source.helpers";
import { SettingsSourceTags } from "@shared/ui/components/settings/settings-source-tags.component";
import { SettingsSurfaceCard } from "@shared/ui/components/settings/settings-surface-card.component";

const MODULE_OPTIONS = [
  { value: "clients", label: "Clients" },
  { value: "company", label: "Company" },
  { value: "dashboard", label: "Dashboard" },
  { value: "finance", label: "Finance" },
  { value: "growth", label: "Growth" },
  { value: "inventory", label: "Inventory" },
  { value: "people", label: "People" },
  { value: "schedule", label: "Schedule" },
  { value: "services", label: "Services" },
  { value: "sla", label: "SLA" },
  { value: "work-order", label: "Work Order" },
];

type AccessProfileFormValue = {
  uid?: string;
  name?: string;
  description?: string | null;
  allowedModules?: string[];
  isSystem?: boolean;
};

type SettingsFormValues = Omit<PeopleWorkspaceSettings, "defaultSalaryCents" | "employeeAccess"> & {
  defaultSalaryCents?: string | null;
  employeeAccessEnabled?: boolean;
  defaultProfileUid?: string | null;
  accessProfiles?: AccessProfileFormValue[];
};

const moneyMask = getMoneyMaskAdapter({ fromCents: true });
type SettingsNormalizationInput = Partial<Omit<SettingsFormValues, "defaultSalaryCents"> & { defaultSalaryCents?: string | number | null }>;

function normalizeOptionalText(value: string | null | undefined): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, 120);
}

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function normalizeProfileItem(
  item: AccessProfileFormValue,
  index: number
): EmployeeAccessProfile | null {
  const uid = toSlug(String(item.uid ?? item.name ?? ""));
  const fallbackUid = `profile-${index + 1}`;
  const resolvedUid = uid || fallbackUid;
  const name = String(item.name ?? "").trim() || `Profile ${index + 1}`;
  const allowedModules = Array.isArray(item.allowedModules)
    ? [...new Set(item.allowedModules.filter((entry) => Boolean(entry)))]
    : [];
  if (allowedModules.length <= 0) return null;

  return {
    uid: resolvedUid,
    name: name.slice(0, 80),
    description:
      typeof item.description === "string" && item.description.trim().length > 0
        ? item.description.trim().slice(0, 240)
        : null,
    allowedModules,
    isSystem: Boolean(item.isSystem),
  };
}

function normalizeProfiles(values: AccessProfileFormValue[] | undefined): EmployeeAccessProfile[] {
  const source = Array.isArray(values) ? values : [];
  const byUid = new Map<string, EmployeeAccessProfile>();
  source.forEach((item, index) => {
    const normalized = normalizeProfileItem(item, index);
    if (!normalized) return;
    if (byUid.has(normalized.uid)) return;
    byUid.set(normalized.uid, normalized);
  });

  const normalized = [...byUid.values()];
  return normalized.length > 0 ? normalized : DEFAULT_PEOPLE_SETTINGS.employeeAccess.profiles;
}

function normalizeSettings(
  input?: SettingsNormalizationInput
): PeopleWorkspaceSettings {
  const profiles = normalizeProfiles(input?.accessProfiles);
  const requestedDefault = toSlug(String(input?.defaultProfileUid ?? ""));
  const fallbackDefault = profiles[0]?.uid ?? DEFAULT_PEOPLE_SETTINGS.employeeAccess.defaultProfileUid;
  const defaultProfileUid = profiles.some((profile) => profile.uid === requestedDefault)
    ? requestedDefault
    : fallbackDefault;

  return {
    defaultRole: normalizeOptionalText(input?.defaultRole),
    defaultDepartment: normalizeOptionalText(input?.defaultDepartment),
    defaultSalaryCents:
      moneyMask.parse(input?.defaultSalaryCents) ?? null,
    requireEmail:
      typeof input?.requireEmail === "boolean"
        ? input.requireEmail
        : DEFAULT_PEOPLE_SETTINGS.requireEmail,
    requirePhone:
      typeof input?.requirePhone === "boolean"
        ? input.requirePhone
        : DEFAULT_PEOPLE_SETTINGS.requirePhone,
    requireDepartment:
      typeof input?.requireDepartment === "boolean"
        ? input.requireDepartment
        : DEFAULT_PEOPLE_SETTINGS.requireDepartment,
    requireSalary:
      typeof input?.requireSalary === "boolean"
        ? input.requireSalary
        : DEFAULT_PEOPLE_SETTINGS.requireSalary,
    defaultLandingTab:
      input?.defaultLandingTab === "capacity" ? "capacity" : "employees",
    employeeAccess: {
      enabled:
        typeof input?.employeeAccessEnabled === "boolean"
          ? input.employeeAccessEnabled
          : DEFAULT_PEOPLE_SETTINGS.employeeAccess.enabled,
      defaultProfileUid,
      profiles,
    },
  };
}

function toFormValues(settings: PeopleWorkspaceSettings): SettingsFormValues {
  return {
    ...settings,
    defaultRole: settings.defaultRole ?? undefined,
    defaultDepartment: settings.defaultDepartment ?? undefined,
    defaultSalaryCents:
      typeof settings.defaultSalaryCents === "number"
        ? moneyMask.format(settings.defaultSalaryCents)
        : undefined,
    employeeAccessEnabled: settings.employeeAccess.enabled,
    defaultProfileUid: settings.employeeAccess.defaultProfileUid ?? undefined,
    accessProfiles: settings.employeeAccess.profiles.map((profile) => ({
      uid: profile.uid,
      name: profile.name,
      description: profile.description ?? undefined,
      allowedModules: profile.allowedModules,
      isSystem: Boolean(profile.isSystem),
    })),
  };
}

function PeopleSettingsPageContent(): React.ReactElement {
  const [workspaceId, setWorkspaceId] = React.useState<string | undefined>(() => {
    const workspace = companyService.getWorkspaceValue() as
      | { workspaceId?: string; id?: string }
      | null;
    return (workspace?.workspaceId ?? workspace?.id) as string | undefined;
  });
  const [source, setSource] = React.useState<SettingsSource>("defaults");
  const [updatedAt, setUpdatedAt] = React.useState<string | undefined>(undefined);
  const [loading, setLoading] = React.useState(false);
  const [initialLoading, setInitialLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [contractsLoading, setContractsLoading] = React.useState(false);
  const [removingContractId, setRemovingContractId] = React.useState<string | null>(null);
  const [employeeCapacity, setEmployeeCapacity] = React.useState<WorkspaceEmployeeCapacity | null>(null);
  const [employeeAddonContracts, setEmployeeAddonContracts] = React.useState<WorkspaceEmployeeAddonContract[]>([]);
  const [form] = Form.useForm<SettingsFormValues>();
  const accessProfiles = Form.useWatch("accessProfiles", form) ?? [];

  React.useEffect(() => {
    const sub = companyService.getWorkspace$().subscribe((workspace) => {
      const nextId = (workspace as DataMap)?.workspaceId ?? (workspace as DataMap)?.id;
      setWorkspaceId(nextId as string | undefined);
    });
    return () => sub.unsubscribe();
  }, []);

  const applySettings = React.useCallback(
    (
      bundle: {
        settings: PeopleWorkspaceSettings;
        source: SettingsSource;
        updatedAt?: string;
      }
    ) => {
      setSource(bundle.source);
      setUpdatedAt(bundle.updatedAt);
      form.setFieldsValue(toFormValues(normalizeSettings(bundle.settings)));
    },
    [form]
  );

  const loadSettings = React.useCallback(async () => {
    if (!workspaceId) {
      applySettings({
        settings: DEFAULT_PEOPLE_SETTINGS,
        source: "defaults",
      });
      setInitialLoading(false);
      return;
    }

    setLoading(true);
    try {
      const bundle = await getPeopleSettings(workspaceId);
      applySettings(bundle);
    } catch {
      message.error("Failed to load people settings.");
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [applySettings, workspaceId]);

  const loadEmployeeAddonContracts = React.useCallback(async () => {
    if (!workspaceId) {
      setEmployeeCapacity(null);
      setEmployeeAddonContracts([]);
      return;
    }

    setContractsLoading(true);
    try {
      const [capacity, contracts] = await Promise.all([
        billingService.fetchWorkspaceEmployeeCapacity(workspaceId),
        billingService.fetchWorkspaceEmployeeAddonContracts({
          workspaceId,
          status: "all",
        }),
      ]);
      setEmployeeCapacity(capacity);
      setEmployeeAddonContracts(contracts);
    } catch {
      message.error("Failed to load employee slot contracts.");
    } finally {
      setContractsLoading(false);
    }
  }, [workspaceId]);

  React.useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  React.useEffect(() => {
    void loadEmployeeAddonContracts();
  }, [loadEmployeeAddonContracts]);

  const handleRestoreDefaults = () => {
    form.setFieldsValue(toFormValues(DEFAULT_PEOPLE_SETTINGS));
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
      const bundle = await upsertPeopleSettings(workspaceId, normalized, updatedBy);
      applySettings(bundle);
      message.success("People settings saved.");
    } catch {
      message.error("Failed to save people settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveEmployeeAddonContract = async (contractId: string) => {
    if (!workspaceId) {
      message.error("Workspace is required.");
      return;
    }

    setRemovingContractId(contractId);
    try {
      await billingService.cancelWorkspaceEmployeeAddonContract({
        workspaceId,
        contractId,
      });
      message.success("Employee slot contract removed.");
      await loadEmployeeAddonContracts();
    } catch (err) {
      const parsedMessage =
        err instanceof Error ? err.message : "Failed to remove employee slot contract.";
      if (parsedMessage.toLowerCase().includes("active_employees_exceed_capacity")) {
        message.warning(
          "Cannot remove this contract while active employees exceed the remaining capacity."
        );
      } else {
        message.error(parsedMessage || "Failed to remove employee slot contract.");
      }
    } finally {
      setRemovingContractId(null);
    }
  };

  const defaultProfileOptions = normalizeProfiles(accessProfiles).map((profile) => ({
    value: profile.uid,
    label: profile.name,
  }));

  const contractsTableData = employeeAddonContracts.map((contract) => ({
    key: contract.id,
    ...contract,
  }));

  const contractColumns = [
    {
      title: "Created at",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (value: string) => formatAppDateTime(value, "--"),
      width: 180,
    },
    {
      title: "Cycle",
      dataIndex: "billingCycle",
      key: "billingCycle",
      render: (value: "monthly" | "yearly") =>
        value === "yearly" ? "Yearly" : "Monthly",
      width: 120,
    },
    {
      title: "Employees",
      dataIndex: "additionalEmployees",
      key: "additionalEmployees",
      width: 120,
    },
    {
      title: "Unit price",
      dataIndex: "unitPriceCents",
      key: "unitPriceCents",
      render: (_value: number, record: WorkspaceEmployeeAddonContract) =>
        formatMoney(record.unitPriceCents, { currency: record.currency }),
      width: 160,
    },
    {
      title: "Total",
      dataIndex: "amountCents",
      key: "amountCents",
      render: (_value: number, record: WorkspaceEmployeeAddonContract) =>
        formatMoney(record.amountCents, { currency: record.currency }),
      width: 160,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (value: WorkspaceEmployeeAddonContract["status"]) => (
        <Tag color={value === "active" ? "green" : "default"}>
          {value === "active" ? "Active" : "Cancelled"}
        </Tag>
      ),
      width: 120,
    },
    {
      title: "Actions",
      key: "actions",
      width: 140,
      render: (_value: unknown, record: WorkspaceEmployeeAddonContract) => {
        const disabled = record.status !== "active";
        return (
          <Popconfirm
            title="Remove employee add-on?"
            description="This will reduce extra employee slots for this workspace."
            okText="Remove"
            okButtonProps={{ danger: true }}
            cancelText="Keep"
            onConfirm={() => handleRemoveEmployeeAddonContract(record.id)}
            disabled={disabled}
          >
            <Button
              danger
              size="small"
              loading={removingContractId === record.id}
              disabled={disabled || removingContractId !== null}
            >
              Remove
            </Button>
          </Popconfirm>
        );
      },
    },
  ];

  if (initialLoading) {
    return <PageSkeleton mainRows={3} sideRows={2} height="100%" />;
  }

  return (
    <BaseTemplate
      content={
        <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: 16 }}>
          <SettingsPageHeader
            icon={<Settings2 size={20} />}
            title="People settings"
            description="Set team defaults, validation rules, and hierarchy access by workspace."
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
              message="These rules are applied to employee records and member access permissions."
            />

            <Form<SettingsFormValues>
              form={form}
              layout="vertical"
              initialValues={toFormValues(DEFAULT_PEOPLE_SETTINGS)}
              onFinish={handleSubmit}
            >
              <Tabs
                defaultActiveKey="defaults"
                items={[
                  {
                    key: "defaults",
                    label: <IconLabel icon={<Users size={14} />} text="Team defaults" />,
                    children: (
                      <>
                        <Typography.Title level={5} style={{ marginTop: 0 }}>
                          Pre-filled values for new employees
                        </Typography.Title>
                        <Space
                          size={16}
                          style={{ width: "100%", display: "flex", flexWrap: "wrap" }}
                        >
                          <Form.Item
                            name="defaultRole"
                            label="Default role"
                            style={{ minWidth: 240 }}
                          >
                            <Input maxLength={120} placeholder="Optional role" />
                          </Form.Item>

                          <Form.Item
                            name="defaultDepartment"
                            label="Default department"
                            style={{ minWidth: 240 }}
                          >
                            <Input maxLength={120} placeholder="Optional department" />
                          </Form.Item>

                          <Form.Item
                            name="defaultSalaryCents"
                            label="Default salary"
                            style={{ minWidth: 240 }}
                            normalize={(value) => moneyMask.normalize(value)}
                          >
                            <Input style={{ width: "100%" }} inputMode="numeric" />
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
                          Required fields in people forms
                        </Typography.Title>
                        <Space
                          size={16}
                          style={{ width: "100%", display: "flex", flexWrap: "wrap" }}
                        >
                          <Form.Item name="requireEmail" valuePropName="checked" label="Require email">
                            <Switch />
                          </Form.Item>
                          <Form.Item name="requirePhone" valuePropName="checked" label="Require phone">
                            <Switch />
                          </Form.Item>
                          <Form.Item
                            name="requireDepartment"
                            valuePropName="checked"
                            label="Require department"
                          >
                            <Switch />
                          </Form.Item>
                          <Form.Item name="requireSalary" valuePropName="checked" label="Require salary">
                            <Switch />
                          </Form.Item>
                        </Space>
                      </>
                    ),
                  },
                  {
                    key: "navigation",
                    label: <IconLabel icon={<CircleDollarSign size={14} />} text="Navigation" />,
                    children: (
                      <>
                        <Typography.Title level={5} style={{ marginTop: 0 }}>
                          Default landing tab
                        </Typography.Title>
                        <Form.Item
                          name="defaultLandingTab"
                          label="When opening People module, show"
                          style={{ maxWidth: 320 }}
                        >
                          <Select
                            options={[
                              { value: "employees", label: "Employees tab" },
                              { value: "capacity", label: "Capacity tab" },
                            ]}
                          />
                        </Form.Item>
                      </>
                    ),
                  },
                  {
                    key: "hierarchy",
                    label: <IconLabel icon={<ShieldCheck size={14} />} text="Hierarchy & access" />,
                    children: (
                      <>
                        <Typography.Title level={5} style={{ marginTop: 0 }}>
                          Workspace hierarchy profiles
                        </Typography.Title>

                        <Space
                          size={16}
                          style={{ width: "100%", display: "flex", flexWrap: "wrap" }}
                        >
                          <Form.Item
                            name="employeeAccessEnabled"
                            valuePropName="checked"
                            label="Enable hierarchy restrictions for members"
                          >
                            <Switch />
                          </Form.Item>
                          <Form.Item
                            name="defaultProfileUid"
                            label="Default profile for new employees"
                            style={{ minWidth: 280 }}
                          >
                            <Select
                              options={defaultProfileOptions}
                              placeholder="Select default profile"
                            />
                          </Form.Item>
                        </Space>

                        <Form.List name="accessProfiles">
                          {(fields, { add, remove }) => (
                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                              {fields.map((field) => {
                                const isSystem = Boolean(
                                  form.getFieldValue(["accessProfiles", field.name, "isSystem"])
                                );
                                return (
                                  <div
                                    key={field.key}
                                    style={{
                                      border: "1px solid var(--wh-color-border, rgba(255,255,255,0.18))",
                                      borderRadius: 12,
                                      padding: 12,
                                    }}
                                  >
                                    <Space
                                      size={12}
                                      style={{ width: "100%", display: "flex", flexWrap: "wrap" }}
                                      align="start"
                                    >
                                      <Form.Item
                                        name={[field.name, "name"]}
                                        label="Profile name"
                                        style={{ minWidth: 220, flex: 1 }}
                                        rules={[{ required: true, message: "Profile name is required" }]}
                                      >
                                        <Input placeholder="e.g. Supervisor" />
                                      </Form.Item>
                                      <Form.Item
                                        name={[field.name, "uid"]}
                                        label="Profile UID"
                                        style={{ minWidth: 220, flex: 1 }}
                                      >
                                        <Input placeholder="auto from name if empty" />
                                      </Form.Item>
                                      <Form.Item
                                        name={[field.name, "description"]}
                                        label="Description"
                                        style={{ minWidth: 260, flex: 2 }}
                                      >
                                        <Input placeholder="What this role can do" />
                                      </Form.Item>
                                    </Space>

                                    <Space
                                      size={12}
                                      style={{ width: "100%", display: "flex", flexWrap: "wrap" }}
                                      align="start"
                                    >
                                      <Form.Item
                                        name={[field.name, "allowedModules"]}
                                        label="Allowed modules"
                                        style={{ minWidth: 320, flex: 1 }}
                                        rules={[
                                          {
                                            validator: async (_, value) => {
                                              if (Array.isArray(value) && value.length > 0) return;
                                              throw new Error("Select at least one module");
                                            },
                                          },
                                        ]}
                                      >
                                        <Select
                                          mode="multiple"
                                          options={MODULE_OPTIONS}
                                          placeholder="Select module access"
                                        />
                                      </Form.Item>
                                      <Form.Item
                                        name={[field.name, "isSystem"]}
                                        valuePropName="checked"
                                        label="System profile"
                                      >
                                        <Switch disabled />
                                      </Form.Item>
                                      <Button
                                        danger
                                        icon={<Trash2 size={14} />}
                                        onClick={() => remove(field.name)}
                                        disabled={isSystem}
                                        style={{ marginTop: 30 }}
                                      >
                                        Remove
                                      </Button>
                                    </Space>
                                  </div>
                                );
                              })}

                              <Button
                                type="dashed"
                                icon={<Plus size={14} />}
                                onClick={() =>
                                  add({
                                    uid: "",
                                    name: "",
                                    description: "",
                                    allowedModules: ["clients", "schedule", "services"],
                                    isSystem: false,
                                  })
                                }
                              >
                                Add hierarchy profile
                              </Button>
                            </div>
                          )}
                        </Form.List>
                      </>
                    ),
                  },
                  {
                    key: "employeeContracts",
                    label: <IconLabel icon={<CircleDollarSign size={14} />} text="Billing capacity" />,
                    children: (
                      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        <Space
                          align="center"
                          style={{ width: "100%", justifyContent: "space-between" }}
                        >
                          <Typography.Title level={5} style={{ margin: 0 }}>
                            Employee slot contracts
                          </Typography.Title>
                          <Button
                            size="small"
                            loading={contractsLoading}
                            onClick={() => void loadEmployeeAddonContracts()}
                            icon={<RotateCcw size={14} />}
                          >
                            Refresh
                          </Button>
                        </Space>

                        <Typography.Text type="secondary">
                          Manage purchased employee slot add-ons. Removing a contract decreases
                          workspace capacity.
                        </Typography.Text>

                        {employeeCapacity ? (
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
                              gap: 10,
                            }}
                          >
                            <Tag>
                              Base slots: {employeeCapacity.limits.baseEmployees}
                            </Tag>
                            <Tag color="blue">
                              Add-on slots: {employeeCapacity.limits.addonEmployees}
                            </Tag>
                            <Tag color="purple">
                              Total capacity: {employeeCapacity.limits.totalEmployees}
                            </Tag>
                            <Tag color="gold">
                              Active employees: {employeeCapacity.limits.activeEmployees}
                            </Tag>
                            <Tag color="green">
                              Remaining: {employeeCapacity.limits.remainingEmployees}
                            </Tag>
                          </div>
                        ) : null}

                        {employeeCapacity &&
                        employeeCapacity.limits.activeEmployees >
                          employeeCapacity.limits.totalEmployees ? (
                          <Alert
                            type="warning"
                            showIcon
                            message="Active employees exceed current capacity."
                            description="Remove active employees before cancelling additional slot contracts."
                          />
                        ) : null}

                        <Table
                          size="small"
                          rowKey="id"
                          columns={contractColumns}
                          dataSource={contractsTableData}
                          loading={contractsLoading}
                          pagination={{ pageSize: 5, hideOnSinglePage: true }}
                          locale={{
                            emptyText:
                              "No employee add-on contracts found for this workspace.",
                          }}
                        />
                      </div>
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

export class PeopleSettingsPage extends BasePage {
  protected override options = {
    title: `${appI18n.t("people.pageTitles.settings")} | WorklyHub`,
    requiresAuth: true,
  };

  protected override renderPage(): React.ReactNode {
    return <PeopleSettingsPageContent />;
  }
}

export default PeopleSettingsPage;
