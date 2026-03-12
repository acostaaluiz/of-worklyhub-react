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
import type { ThemeCustomColors, ThemeMode } from "@core/config/theme/theme.interface";
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

type AppearanceColorKey = keyof ThemeCustomColors;

type AppearanceColorOption = {
  key: AppearanceColorKey;
  label: string;
  description: string;
  cssVariable: string;
  fallbackByMode: Record<ThemeMode, string>;
};

const HEX_COLOR_PATTERN = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

const APPEARANCE_COLOR_OPTIONS: AppearanceColorOption[] = [
  {
    key: "background",
    label: "Background color",
    description: "Main app backdrop color.",
    cssVariable: "--color-background",
    fallbackByMode: { light: "#f4f6f9", dark: "#0f1f26" },
  },
  {
    key: "surface",
    label: "Surface color",
    description: "Card and panel base color.",
    cssVariable: "--color-surface",
    fallbackByMode: { light: "#ffffff", dark: "#132a33" },
  },
  {
    key: "surfaceAlt",
    label: "Surface alt color",
    description: "Secondary panel color and layered surfaces.",
    cssVariable: "--color-surface-2",
    fallbackByMode: { light: "#eef4ff", dark: "#173642" },
  },
  {
    key: "primary",
    label: "Primary color",
    description: "Main actions, highlights and interactive accents.",
    cssVariable: "--color-primary",
    fallbackByMode: { light: "#1e70ff", dark: "#4de6d3" },
  },
  {
    key: "secondary",
    label: "Secondary color",
    description: "Secondary accents and supporting highlights.",
    cssVariable: "--color-secondary",
    fallbackByMode: { light: "#00d6a0", dark: "#2dd4bf" },
  },
  {
    key: "tertiary",
    label: "Tertiary color",
    description: "Complementary accent used in gradients and details.",
    cssVariable: "--color-tertiary",
    fallbackByMode: { light: "#7a2cff", dark: "#7a2cff" },
  },
  {
    key: "text",
    label: "Text color",
    description: "Main text color for headings and body content.",
    cssVariable: "--color-text",
    fallbackByMode: { light: "#071318", dark: "#e6f1f4" },
  },
];

function normalizeHexColor(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  if (!HEX_COLOR_PATTERN.test(trimmed)) return null;

  if (trimmed.length === 4) {
    const r = trimmed[1];
    const g = trimmed[2];
    const b = trimmed[3];
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }

  return trimmed.toLowerCase();
}

function toColorInputValue(value: unknown, fallback: string): string {
  return normalizeHexColor(value) ?? fallback;
}

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

function readCssColorVariable(variableName: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;

  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(variableName)
    .trim();

  return toColorInputValue(raw, fallback);
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
  const tabLabel = (
    icon: React.ReactNode,
    label: string,
    dataCy: string
  ) => (
    <span data-cy={dataCy}>
      <IconLabel icon={icon} text={label} />
    </span>
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
  const [customColors, setCustomColors] = React.useState<ThemeCustomColors>(() =>
    themeService.getCustomColors()
  );
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
      setCustomColors(nextState.customColors);
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

  const resolveAppearanceColor = React.useCallback(
    (option: AppearanceColorOption): string => {
      const fallback = option.fallbackByMode[themePreference];
      const stored = normalizeHexColor(customColors[option.key]);
      if (stored) return stored;
      return readCssColorVariable(option.cssVariable, fallback);
    },
    [customColors, themePreference]
  );

  const handleCustomColorChange = (
    option: AppearanceColorOption,
    rawColor: string
  ) => {
    const normalized = toColorInputValue(
      rawColor,
      option.fallbackByMode[themePreference]
    );

    const nextColors: ThemeCustomColors = {
      ...themeService.getCustomColors(),
      [option.key]: normalized,
    };

    themeService.setCustomColors(nextColors);
  };

  const handleResetCustomColors = () => {
    themeService.clearCustomColors();
    message.success("Custom colors removed. Default palette restored.");
  };

  const hasCustomColors = React.useMemo(
    () => Object.keys(customColors).length > 0,
    [customColors]
  );

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
          data-cy="settings-billing-form"
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
            <Switch data-cy="settings-billing-enabled-switch" />
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
                  <Switch
                    data-cy={`settings-billing-module-${moduleOption.key}-switch`}
                  />
                </Form.Item>
              </ModuleToggleRow>
            ))}
          </ModuleToggleList>

          <ActionsRow>
            <Button
              type="primary"
              onClick={() => void handleSaveWorkspaceSettings()}
              loading={!!isSavingSettings}
              data-cy="settings-billing-save-button"
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

        <EmissionGrid data-cy="settings-issuance-form">
          <Form.Item
            name="environment"
            label="Environment"
            rules={[{ required: true, message: "Select the environment." }]}
          >
            <Select
              data-cy="settings-issuance-environment-select"
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
            <Input data-cy="settings-issuance-provider-input" placeholder="govbr" />
          </Form.Item>

          <Form.Item name={["integration", "method"]} label="HTTP method">
            <Select
              data-cy="settings-issuance-method-select"
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
              data-cy="settings-issuance-auth-type-select"
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
            <Input
              data-cy="settings-issuance-base-url-input"
              placeholder="https://api.your-provider.com"
            />
          </Form.Item>

          <Form.Item
            name={["integration", "issuePath"]}
            label="Issue path"
            rules={[{ required: true, message: "Provide the issue path." }]}
          >
            <Input data-cy="settings-issuance-issue-path-input" placeholder="/nfe/emit" />
          </Form.Item>

          <Form.Item name={["integration", "timeoutMs"]} label="Timeout (ms)">
            <InputNumber
              data-cy="settings-issuance-timeout-input"
              min={1000}
              max={120000}
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item name={["integration", "retries"]} label="Retries">
            <InputNumber
              data-cy="settings-issuance-retries-input"
              min={0}
              max={5}
              style={{ width: "100%" }}
            />
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
                <Input
                  data-cy="settings-issuance-api-key-header-input"
                  placeholder="x-api-key"
                />
              </Form.Item>
              <Form.Item
                name={["integration", "auth", "apiKey"]}
                label="API key"
                rules={[{ required: true, message: "Provide the API key." }]}
              >
                <Input.Password data-cy="settings-issuance-api-key-input" />
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
            <Input data-cy="settings-issuance-legal-name-input" />
          </Form.Item>

          <Form.Item
            name={["issuer", "document"]}
            label="Issuer document (CNPJ/CPF)"
            rules={[{ required: true, message: "Provide the document." }]}
          >
            <Input data-cy="settings-issuance-document-input" />
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
            data-cy="settings-issuance-save-button"
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

        <AdvancedGrid data-cy="settings-advanced-form">
          <Form.Item name={["integration", "headers"]} label="Headers (JSON)">
            <Input.TextArea
              data-cy="settings-advanced-headers-input"
              autoSize={{ minRows: 1, maxRows: 2 }}
              placeholder='{"x-tenant":"worklyhub"}'
            />
          </Form.Item>

          <Form.Item
            name={["integration", "payloadTemplate"]}
            label="Payload template (JSON)"
          >
            <Input.TextArea
              data-cy="settings-advanced-payload-template-input"
              autoSize={{ minRows: 1, maxRows: 2 }}
              placeholder='{"operationNature":"Service provided"}'
            />
          </Form.Item>

          <Form.Item
            name={["integration", "responseMapping"]}
            label="Response mapping (JSON)"
          >
            <Input.TextArea
              data-cy="settings-advanced-response-mapping-input"
              autoSize={{ minRows: 1, maxRows: 2 }}
              placeholder='{"status":"status","accessKey":"access_key"}'
            />
          </Form.Item>

          <Form.Item name={["issuer", "address"]} label="Issuer address (JSON)">
            <Input.TextArea
              data-cy="settings-advanced-address-input"
              autoSize={{ minRows: 1, maxRows: 2 }}
              placeholder='{"street":"Street X","number":"123","city":"Sao Paulo","state":"SP"}'
            />
          </Form.Item>

          <Form.Item name={["defaults"]} label="Defaults (JSON)">
            <Input.TextArea
              data-cy="settings-advanced-defaults-input"
              autoSize={{ minRows: 1, maxRows: 2 }}
              placeholder='{"serviceCode":"1401"}'
            />
          </Form.Item>

          <Form.Item name={["metadata"]} label="Metadata (JSON)">
            <Input.TextArea
              data-cy="settings-advanced-metadata-input"
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
            data-cy="settings-advanced-save-button"
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
        <CardSubtitle>
          Switch between light and dark themes and optionally customize key colors.
        </CardSubtitle>
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
              data-cy="settings-appearance-use-light-button"
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
              data-cy="settings-appearance-use-dark-button"
            >
              Use dark
            </Button>
          </ModuleToggleRow>
        </ModuleToggleList>

        <ModuleToggleList>
          {APPEARANCE_COLOR_OPTIONS.map((option) => {
            const colorValue = resolveAppearanceColor(option);
            return (
              <ModuleToggleRow key={option.key}>
                <div>
                  <ModuleTitle>{option.label}</ModuleTitle>
                  <ModuleDescription>{option.description}</ModuleDescription>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input
                    type="color"
                    value={colorValue}
                    onChange={(event) =>
                      handleCustomColorChange(option, event.target.value)
                    }
                    style={{
                      width: 44,
                      height: 32,
                      border: "1px solid var(--color-border)",
                      borderRadius: 8,
                      background: "transparent",
                      cursor: "pointer",
                    }}
                    data-cy={`settings-appearance-color-${option.key}-picker`}
                  />
                  <Input
                    value={colorValue.toUpperCase()}
                    readOnly
                    style={{ width: 108 }}
                    data-cy={`settings-appearance-color-${option.key}-value`}
                  />
                </div>
              </ModuleToggleRow>
            );
          })}
        </ModuleToggleList>

        <ActionsRow style={{ gap: 8, flexWrap: "wrap" }}>
          <Button
            onClick={handleResetCustomColors}
            disabled={!hasCustomColors}
            data-cy="settings-appearance-reset-custom-colors-button"
          >
            Use default palette
          </Button>
          <Button icon={<BgColorsOutlined />} disabled data-cy="settings-appearance-active-mode">
            Active mode: {themePreference === "dark" ? "Dark" : "Light"}
          </Button>
          <Button disabled data-cy="settings-appearance-custom-status">
            Custom palette: {hasCustomColors ? "Enabled" : "Disabled"}
          </Button>
        </ActionsRow>
      </Card>
    </TabPaneBody>
  );

  return (
    <BaseTemplate
      content={
        <SettingsTemplateRoot data-cy="settings-page">
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

            <TabsFrame data-cy="settings-tabs-frame">
              <Form
                form={configurationForm}
                layout="vertical"
                component={false}
                initialValues={mapConfigurationToFormValues(nfeConfiguration)}
                disabled={!!isLoading}
              >
                <Tabs
                  data-cy="settings-tabs"
                  defaultActiveKey="module-rules"
                  items={[
                    {
                      key: "module-rules",
                      label: tabLabel(
                        <DollarCircleOutlined />,
                        "Billing",
                        "settings-tab-billing"
                      ),
                      children: moduleTab,
                    },
                    {
                      key: "issuance",
                      label: tabLabel(
                        <FileDoneOutlined />,
                        "Issuance",
                        "settings-tab-issuance"
                      ),
                      children: emissionTab,
                    },
                    {
                      key: "advanced",
                      label: tabLabel(
                        <ToolOutlined />,
                        "Advanced",
                        "settings-tab-advanced"
                      ),
                      children: advancedTab,
                    },
                    {
                      key: "appearance",
                      label: tabLabel(
                        <BgColorsOutlined />,
                        "Appearance",
                        "settings-tab-appearance"
                      ),
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
