import React from "react";
import { Alert, Button, Form, Input, InputNumber, Select, Switch, Tabs, message } from "antd";
import {
  BgColorsOutlined,
  CalendarOutlined,
  DollarCircleOutlined,
  DollarOutlined,
  FileDoneOutlined,
  FileTextOutlined,
  InboxOutlined,
  MoonOutlined,
  PoweroffOutlined,
  SunOutlined,
  TeamOutlined,
  ToolOutlined,
  UsergroupAddOutlined,
} from "@ant-design/icons";
import { themeService } from "@core/config/theme/theme.service";
import type { ThemeMode } from "@core/config/theme/theme.interface";
import { BaseTemplate } from "@shared/base/base.template";
import { IconLabel } from "@shared/ui/components/settings/icon-label.component";
import type {
  NfeConfigurationWritePayload,
  WorkspaceInvoiceModuleKey,
  WorkspaceInvoiceSettings,
} from "@modules/billing/services/invoice-settings-api";
import {
  AdvancedGrid,
  ActionsRow,
  Card,
  CardSubtitle,
  CardTitle,
  EmissionGrid,
  HeroCard,
  HeroSubtitle,
  HeroTitle,
  MetaPill,
  MetaRow,
  ModuleDescription,
  ModuleTitle,
  ModuleToggleList,
  ModuleToggleRow,
  SettingsShell,
  SettingsTemplateRoot,
  TabPaneBody,
  TabsFrame,
} from "./settings.template.styles";

type ModuleOption = {
  key: WorkspaceInvoiceModuleKey;
  label: string;
  description: string;
  icon: React.ReactNode;
};

const MODULE_OPTIONS: ModuleOption[] = [
  {
    key: "work-order",
    label: "Work order",
    description: "Allows billing and NF-e issuance from work orders.",
    icon: <FileTextOutlined />,
  },
  {
    key: "schedule",
    label: "Schedule",
    description: "Allows billing and NF-e issuance from schedule completions.",
    icon: <CalendarOutlined />,
  },
  {
    key: "finance",
    label: "Finance",
    description: "Enables fiscal issuance for finance entries.",
    icon: <DollarOutlined />,
  },
  {
    key: "inventory",
    label: "Inventory",
    description: "Reserved for sales that trigger stock reduction.",
    icon: <InboxOutlined />,
  },
  {
    key: "people",
    label: "People",
    description: "Reserved for billing based on services delivered by collaborators.",
    icon: <TeamOutlined />,
  },
  {
    key: "clients",
    label: "Clients",
    description: "Reserved for sales flows initiated in the Clients module.",
    icon: <UsergroupAddOutlined />,
  },
];

type NfeConfigurationFormValues = {
  environment?: "production" | "homologation";
  integration: {
    provider: string;
    baseUrl: string;
    issuePath: string;
    method?: "POST" | "PUT";
    timeoutMs?: number;
    retries?: number;
    auth?: {
      type?: "none" | "bearer" | "api-key" | "basic";
      token?: string;
      headerName?: string;
      apiKey?: string;
      username?: string;
      password?: string;
    };
    headers?: string;
    payloadTemplate?: string;
    responseMapping?: string;
  };
  issuer: {
    legalName: string;
    document: string;
    stateRegistration?: string;
    municipalRegistration?: string;
    taxRegime?: string;
    address?: string;
  };
  defaults?: string;
  metadata?: string;
};

type SettingsTemplateProps = {
  workspaceId?: string;
  workspaceSettings: WorkspaceInvoiceSettings;
  settingsSource: "database" | "defaults";
  settingsUpdatedAt?: string;
  nfeConfiguration: NfeConfigurationWritePayload;
  nfeResolution: "workspace" | "workspace-default" | "platform" | "none";
  nfeUpdatedAt?: string;
  isLoading?: boolean;
  isSavingSettings?: boolean;
  isSavingConfiguration?: boolean;
  onSaveWorkspaceSettings: (settings: WorkspaceInvoiceSettings) => void;
  onSaveNfeConfiguration: (configuration: NfeConfigurationWritePayload) => void;
};

function toSourceLabel(source: "database" | "defaults"): string {
  if (source === "database") return "Loaded from workspace settings";
  return "No saved record yet (default values)";
}

function toSourceCompactLabel(source: "database" | "defaults"): string {
  if (source === "database") return "workspace";
  return "default";
}

function toResolutionLabel(
  resolution: "workspace" | "workspace-default" | "platform" | "none"
): string {
  if (resolution === "workspace") return "Workspace-specific fiscal configuration";
  if (resolution === "workspace-default")
    return "Platform default workspace fiscal configuration";
  if (resolution === "platform") return "Platform fiscal configuration";
  return "No fiscal configuration saved";
}

function toResolutionCompactLabel(
  resolution: "workspace" | "workspace-default" | "platform" | "none"
): string {
  if (resolution === "workspace") return "workspace";
  if (resolution === "workspace-default") return "workspace-default";
  if (resolution === "platform") return "platform";
  return "not configured";
}

function toDateLabel(value?: string): string {
  if (!value) return "Not updated";
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return value;
  return dt.toLocaleString("en-US");
}

function toWorkspaceLabel(value?: string): string {
  if (!value) return "-";
  if (value.length <= 22) return value;
  return `${value.slice(0, 8)}...${value.slice(-6)}`;
}

function toJsonText(value: DataValue): string | undefined {
  if (!value || typeof value !== "object") return undefined;
  const keys = Object.keys(value as DataMap);
  if (keys.length <= 0) return undefined;
  return JSON.stringify(value, null, 2);
}

function parseJsonObject(label: string, value: DataValue): DataMap | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  let parsed: DataValue;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    throw new Error(`${label} must be valid JSON.`);
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(`${label} must be a JSON object.`);
  }
  return parsed as DataMap;
}

function parseJsonStringMap(
  label: string,
  value: DataValue
): Record<string, string> | undefined {
  const parsed = parseJsonObject(label, value);
  if (!parsed) return undefined;

  const mapped: Record<string, string> = {};
  Object.entries(parsed).forEach(([key, raw]) => {
    if (raw === null || raw === undefined) return;
    mapped[key] = String(raw);
  });
  return mapped;
}

function mapConfigurationToFormValues(
  configuration: NfeConfigurationWritePayload
): NfeConfigurationFormValues {
  return {
    environment: configuration.environment,
    integration: {
      provider: configuration.integration.provider,
      baseUrl: configuration.integration.baseUrl,
      issuePath: configuration.integration.issuePath,
      method: configuration.integration.method,
      timeoutMs: configuration.integration.timeoutMs,
      retries: configuration.integration.retries,
      auth: {
        type: configuration.integration.auth?.type ?? "none",
        token: configuration.integration.auth?.token,
        headerName: configuration.integration.auth?.headerName,
        apiKey: configuration.integration.auth?.apiKey,
        username: configuration.integration.auth?.username,
        password: configuration.integration.auth?.password,
      },
      headers: toJsonText(configuration.integration.headers),
      payloadTemplate: toJsonText(configuration.integration.payloadTemplate),
      responseMapping: toJsonText(configuration.integration.responseMapping),
    },
    issuer: {
      legalName: configuration.issuer.legalName,
      document: configuration.issuer.document,
      stateRegistration: configuration.issuer.stateRegistration,
      municipalRegistration: configuration.issuer.municipalRegistration,
      taxRegime: configuration.issuer.taxRegime,
      address: toJsonText(configuration.issuer.address),
    },
    defaults: toJsonText(configuration.defaults),
    metadata: toJsonText(configuration.metadata),
  };
}

function mapFormValuesToConfiguration(
  values: NfeConfigurationFormValues
): NfeConfigurationWritePayload {
  return {
    environment: values.environment ?? "homologation",
    integration: {
      provider: values.integration.provider,
      baseUrl: values.integration.baseUrl,
      issuePath: values.integration.issuePath,
      method: values.integration.method ?? "POST",
      timeoutMs: values.integration.timeoutMs,
      retries: values.integration.retries,
      auth: values.integration.auth?.type
        ? {
            type: values.integration.auth.type,
            token: values.integration.auth.token,
            headerName: values.integration.auth.headerName,
            apiKey: values.integration.auth.apiKey,
            username: values.integration.auth.username,
            password: values.integration.auth.password,
          }
        : { type: "none" },
      headers: parseJsonStringMap("Headers", values.integration.headers),
      payloadTemplate: parseJsonObject(
        "Payload template",
        values.integration.payloadTemplate
      ),
      responseMapping: parseJsonStringMap(
        "Response mapping",
        values.integration.responseMapping
      ),
    },
    issuer: {
      legalName: values.issuer.legalName,
      document: values.issuer.document,
      stateRegistration: values.issuer.stateRegistration,
      municipalRegistration: values.issuer.municipalRegistration,
      taxRegime: values.issuer.taxRegime,
      address: parseJsonObject("Issuer address", values.issuer.address),
    },
    defaults: parseJsonObject("Defaults", values.defaults),
    metadata: parseJsonObject("Metadata", values.metadata),
  };
}

export const SettingsTemplate: React.FC<SettingsTemplateProps> = ({
  workspaceId,
  workspaceSettings,
  settingsSource,
  settingsUpdatedAt,
  nfeConfiguration,
  nfeResolution,
  nfeUpdatedAt,
  isLoading,
  isSavingSettings,
  isSavingConfiguration,
  onSaveWorkspaceSettings,
  onSaveNfeConfiguration,
}) => {
  const tabLabel = (icon: React.ReactNode, label: string) => (
    <IconLabel icon={icon} text={label} />
  );

  const [settingsForm] = Form.useForm<DataMap>();
  const [configurationForm] = Form.useForm<NfeConfigurationFormValues>();
  const [themePreference, setThemePreference] = React.useState<ThemeMode>(() => {
    const storedPreference = themeService.getPreference();
    if (storedPreference === "light" || storedPreference === "dark") {
      return storedPreference;
    }
    const currentMode = document.documentElement.getAttribute("data-theme");
    return currentMode === "light" ? "light" : "dark";
  });
  const authType = Form.useWatch(["integration", "auth", "type"], configurationForm);

  React.useEffect(() => {
    settingsForm.setFieldsValue(workspaceSettings);
  }, [settingsForm, workspaceSettings]);

  React.useEffect(() => {
    configurationForm.setFieldsValue(mapConfigurationToFormValues(nfeConfiguration));
  }, [configurationForm, nfeConfiguration]);

  React.useEffect(() => {
    const unsubscribe = themeService.subscribe((nextState) => {
      setThemePreference(nextState.mode);
    });
    return unsubscribe;
  }, []);

  const handleSaveWorkspaceSettings = async () => {
    const values = await settingsForm.validateFields();
    onSaveWorkspaceSettings(values as WorkspaceInvoiceSettings);
  };

  const handleSaveNfeConfiguration = async () => {
    try {
      const values = await configurationForm.validateFields();
      const payload = mapFormValuesToConfiguration(values as NfeConfigurationFormValues);
      onSaveNfeConfiguration(payload);
    } catch (err) {
      if (err instanceof Error) {
        message.error(err.message);
      }
    }
  };

  const handleThemeChange = (mode: ThemeMode) => {
    themeService.setPreference(mode);
    setThemePreference(mode);
    message.success(`Theme updated to ${mode === "dark" ? "Dark" : "Light"}.`);
  };

  const moduleTab = (
    <TabPaneBody>
      <Card>
        <CardTitle>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <DollarCircleOutlined />
            <span>Billing rules by module</span>
          </span>
        </CardTitle>
        <CardSubtitle>
          Enable the modules that can start billing and NF-e issuance.
        </CardSubtitle>
        <Alert
          showIcon
          type="info"
          style={{ marginBottom: 8 }}
          message="Execution-to-billing automation"
          description="When Work Order or Schedule reaches a final execution status, the backend can automatically create a finance entry. NF-e issuance is optional."
        />

        <Form
          form={settingsForm}
          layout="vertical"
          initialValues={workspaceSettings}
          disabled={!!isLoading}
        >
          <Form.Item
            name="enabled"
            valuePropName="checked"
            label={
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <PoweroffOutlined />
                <span>Workspace billing enabled</span>
              </span>
            }
          >
            <Switch />
          </Form.Item>

          <ModuleToggleList>
            {MODULE_OPTIONS.map((moduleOption) => (
              <ModuleToggleRow key={moduleOption.key}>
                <div>
                  <ModuleTitle>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                      {moduleOption.icon}
                      <span>{moduleOption.label}</span>
                    </span>
                  </ModuleTitle>
                  <ModuleDescription>{moduleOption.description}</ModuleDescription>
                </div>
                <Form.Item
                  noStyle
                  name={["modules", moduleOption.key]}
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </ModuleToggleRow>
            ))}
          </ModuleToggleList>

          <ActionsRow>
            <Button
              type="primary"
              onClick={() => void handleSaveWorkspaceSettings()}
              loading={!!isSavingSettings}
            >
              Save rules
            </Button>
          </ActionsRow>
        </Form>
      </Card>
    </TabPaneBody>
  );

  const emissionTab = (
    <TabPaneBody>
      <Card>
        <CardTitle>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <FileDoneOutlined />
            <span>Fiscal issuance connection (NF-e)</span>
          </span>
        </CardTitle>
        <CardSubtitle>
          Configure workspace fiscal issuer settings for service-sale invoices.
        </CardSubtitle>

        <EmissionGrid>
          <Form.Item
            name="environment"
            label="Environment"
            rules={[{ required: true, message: "Select the environment." }]}
          >
            <Select
              options={[
                { value: "homologation", label: "Homologation" },
                { value: "production", label: "Production" },
              ]}
            />
          </Form.Item>

          <Form.Item
            name={["integration", "provider"]}
            label="Provider"
            rules={[{ required: true, message: "Provide the provider." }]}
          >
            <Input placeholder="govbr" />
          </Form.Item>

          <Form.Item name={["integration", "method"]} label="HTTP method">
            <Select
              options={[
                { value: "POST", label: "POST" },
                { value: "PUT", label: "PUT" },
              ]}
            />
          </Form.Item>

          <Form.Item
            name={["integration", "auth", "type"]}
            label="Authentication"
            initialValue="none"
          >
            <Select
              options={[
                { value: "none", label: "No authentication" },
                { value: "bearer", label: "Bearer token" },
                { value: "api-key", label: "API key" },
                { value: "basic", label: "Basic auth" },
              ]}
            />
          </Form.Item>

          <Form.Item
            className="span-two"
            name={["integration", "baseUrl"]}
            label="Fiscal API base URL"
            rules={[{ required: true, message: "Provide the base URL." }]}
          >
            <Input placeholder="https://api.your-provider.com" />
          </Form.Item>

          <Form.Item
            name={["integration", "issuePath"]}
            label="Issue path"
            rules={[{ required: true, message: "Provide the issue path." }]}
          >
            <Input placeholder="/nfe/emit" />
          </Form.Item>

          <Form.Item name={["integration", "timeoutMs"]} label="Timeout (ms)">
            <InputNumber min={1000} max={120000} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name={["integration", "retries"]} label="Retries">
            <InputNumber min={0} max={5} style={{ width: "100%" }} />
          </Form.Item>

          {authType === "bearer" ? (
            <Form.Item
              className="span-two"
              name={["integration", "auth", "token"]}
              label="Bearer token"
              rules={[{ required: true, message: "Provide the token." }]}
            >
              <Input.Password />
            </Form.Item>
          ) : null}

          {authType === "api-key" ? (
            <>
              <Form.Item
                name={["integration", "auth", "headerName"]}
                label="API key header"
                rules={[{ required: true, message: "Provide the header." }]}
              >
                <Input placeholder="x-api-key" />
              </Form.Item>
              <Form.Item
                name={["integration", "auth", "apiKey"]}
                label="API key"
                rules={[{ required: true, message: "Provide the API key." }]}
              >
                <Input.Password />
              </Form.Item>
            </>
          ) : null}

          {authType === "basic" ? (
            <>
              <Form.Item
                name={["integration", "auth", "username"]}
                label="Username"
                rules={[{ required: true, message: "Provide the username." }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name={["integration", "auth", "password"]}
                label="Password"
                rules={[{ required: true, message: "Provide the password." }]}
              >
                <Input.Password />
              </Form.Item>
            </>
          ) : null}

          <Form.Item
            className="span-two"
            name={["issuer", "legalName"]}
            label="Legal name"
            rules={[{ required: true, message: "Provide the legal name." }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name={["issuer", "document"]}
            label="Issuer document (CNPJ/CPF)"
            rules={[{ required: true, message: "Provide the document." }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name={["issuer", "stateRegistration"]} label="State registration">
            <Input />
          </Form.Item>

          <Form.Item name={["issuer", "municipalRegistration"]} label="Municipal registration">
            <Input />
          </Form.Item>

          <Form.Item name={["issuer", "taxRegime"]} label="Tax regime">
            <Input placeholder="simples_nacional, lucro_presumido..." />
          </Form.Item>
        </EmissionGrid>

        <ActionsRow>
          <Button
            type="primary"
            onClick={() => void handleSaveNfeConfiguration()}
            loading={!!isSavingConfiguration}
          >
            Save issuance
          </Button>
        </ActionsRow>
      </Card>
    </TabPaneBody>
  );

  const advancedTab = (
    <TabPaneBody>
      <Card>
        <CardTitle>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <ToolOutlined />
            <span>Advanced parameters</span>
          </span>
        </CardTitle>
        <CardSubtitle>
          Optional fields for extra headers, templates, and metadata.
        </CardSubtitle>

        <AdvancedGrid>
          <Form.Item name={["integration", "headers"]} label="Headers (JSON)">
            <Input.TextArea
              autoSize={{ minRows: 1, maxRows: 2 }}
              placeholder='{"x-tenant":"worklyhub"}'
            />
          </Form.Item>

          <Form.Item
            name={["integration", "payloadTemplate"]}
            label="Payload template (JSON)"
          >
            <Input.TextArea
              autoSize={{ minRows: 1, maxRows: 2 }}
              placeholder='{"operationNature":"Service provided"}'
            />
          </Form.Item>

          <Form.Item
            name={["integration", "responseMapping"]}
            label="Response mapping (JSON)"
          >
            <Input.TextArea
              autoSize={{ minRows: 1, maxRows: 2 }}
              placeholder='{"status":"status","accessKey":"access_key"}'
            />
          </Form.Item>

          <Form.Item name={["issuer", "address"]} label="Issuer address (JSON)">
            <Input.TextArea
              autoSize={{ minRows: 1, maxRows: 2 }}
              placeholder='{"street":"Street X","number":"123","city":"Sao Paulo","state":"SP"}'
            />
          </Form.Item>

          <Form.Item name={["defaults"]} label="Defaults (JSON)">
            <Input.TextArea
              autoSize={{ minRows: 1, maxRows: 2 }}
              placeholder='{"serviceCode":"1401"}'
            />
          </Form.Item>

          <Form.Item name={["metadata"]} label="Metadata (JSON)">
            <Input.TextArea
              autoSize={{ minRows: 1, maxRows: 2 }}
              placeholder='{"owner":"workspace"}'
            />
          </Form.Item>
        </AdvancedGrid>

        <ActionsRow>
          <Button
            type="primary"
            onClick={() => void handleSaveNfeConfiguration()}
            loading={!!isSavingConfiguration}
          >
            Save advanced
          </Button>
        </ActionsRow>
      </Card>
    </TabPaneBody>
  );

  const appearanceTab = (
    <TabPaneBody>
      <Card>
        <CardTitle>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <BgColorsOutlined />
            <span>Appearance</span>
          </span>
        </CardTitle>
        <CardSubtitle>Switch between light and dark themes for this device.</CardSubtitle>
        <Alert
          showIcon
          type="info"
          style={{ marginBottom: 8 }}
          message="Theme mode"
          description="The selected mode is applied immediately and saved to your local preferences."
        />

        <ModuleToggleList>
          <ModuleToggleRow>
            <div>
              <ModuleTitle>
                <SunOutlined style={{ marginRight: 6 }} />
                Light
              </ModuleTitle>
              <ModuleDescription>Bright interface for daytime usage.</ModuleDescription>
            </div>
            <Button
              type={themePreference === "light" ? "primary" : "default"}
              onClick={() => handleThemeChange("light")}
            >
              Use light
            </Button>
          </ModuleToggleRow>

          <ModuleToggleRow>
            <div>
              <ModuleTitle>
                <MoonOutlined style={{ marginRight: 6 }} />
                Dark
              </ModuleTitle>
              <ModuleDescription>Reduced glare in low-light environments.</ModuleDescription>
            </div>
            <Button
              type={themePreference === "dark" ? "primary" : "default"}
              onClick={() => handleThemeChange("dark")}
            >
              Use dark
            </Button>
          </ModuleToggleRow>
        </ModuleToggleList>

        <ActionsRow>
          <Button icon={<BgColorsOutlined />} disabled>
            Active mode: {themePreference === "dark" ? "Dark" : "Light"}
          </Button>
        </ActionsRow>
      </Card>
    </TabPaneBody>
  );

  return (
    <BaseTemplate
      content={
        <SettingsTemplateRoot>
          <SettingsShell>
            <HeroCard>
              <HeroTitle>Settings</HeroTitle>
              <HeroSubtitle>
                Centralize workspace billing and NF-e issuance configuration.
              </HeroSubtitle>
              <MetaRow>
                <MetaPill title={workspaceId}>Workspace: {toWorkspaceLabel(workspaceId)}</MetaPill>
                <MetaPill title={toSourceLabel(settingsSource)}>
                  Source: {toSourceCompactLabel(settingsSource)}
                </MetaPill>
                <MetaPill title={toResolutionLabel(nfeResolution)}>
                  NF-e: {toResolutionCompactLabel(nfeResolution)}
                </MetaPill>
                <MetaPill>Rules updated: {toDateLabel(settingsUpdatedAt)}</MetaPill>
                <MetaPill>NF-e updated: {toDateLabel(nfeUpdatedAt)}</MetaPill>
              </MetaRow>
            </HeroCard>

            <TabsFrame>
              <Form
                form={configurationForm}
                layout="vertical"
                component={false}
                initialValues={mapConfigurationToFormValues(nfeConfiguration)}
                disabled={!!isLoading}
              >
                <Tabs
                  defaultActiveKey="module-rules"
                  items={[
                    {
                      key: "module-rules",
                      label: tabLabel(<DollarCircleOutlined />, "Billing"),
                      children: moduleTab,
                    },
                    {
                      key: "issuance",
                      label: tabLabel(<FileDoneOutlined />, "Issuance"),
                      children: emissionTab,
                    },
                    {
                      key: "advanced",
                      label: tabLabel(<ToolOutlined />, "Advanced"),
                      children: advancedTab,
                    },
                    {
                      key: "appearance",
                      label: tabLabel(<BgColorsOutlined />, "Appearance"),
                      children: appearanceTab,
                    },
                  ]}
                />
              </Form>
            </TabsFrame>
          </SettingsShell>
        </SettingsTemplateRoot>
      }
    />
  );
};

export default SettingsTemplate;
