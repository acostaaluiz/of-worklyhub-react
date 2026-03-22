import React from "react";
import { Alert, Button, Form, Input, InputNumber, Select, Switch, Tabs, message } from "antd";
import {
  BgColorsOutlined,
  CalendarOutlined,
  DollarCircleOutlined,
  DollarOutlined,
  FileDoneOutlined,
  FileTextOutlined,
  GlobalOutlined,
  InboxOutlined,
  MoonOutlined,
  PoweroffOutlined,
  SunOutlined,
  TeamOutlined,
  ToolOutlined,
  UsergroupAddOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { themeService } from "@core/config/theme/theme.service";
import type { ThemeCustomColors, ThemeMode } from "@core/config/theme/theme.interface";
import { normalizeAppLanguage, setAppLanguage, type AppLanguage } from "@core/i18n";
import { BaseTemplate } from "@shared/base/base.template";
import { IconLabel } from "@shared/ui/components/settings/icon-label.component";
import type {
  NfeConfigurationWritePayload,
  WorkspaceInvoiceModuleKey,
  WorkspaceInvoiceSettings,
} from "@modules/billing/services/invoice-settings-api";
import {
  AdvancedGrid,
  AppearanceTabContent,
  AppearanceTabs,
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
  PresetPaletteBadge,
  PresetPaletteButton,
  PresetPaletteGrid,
  PresetPaletteMeta,
  PresetPaletteSwatch,
  PresetPaletteSwatches,
  PresetPaletteTitle,
  SettingsShell,
  SettingsTemplateRoot,
  TabPaneBody,
  TabsFrame,
} from "./settings.template.styles";

type ModuleOption = {
  key: WorkspaceInvoiceModuleKey;
  labelKey: string;
  descriptionKey: string;
  icon: React.ReactNode;
};

const MODULE_OPTIONS: ModuleOption[] = [
  {
    key: "work-order",
    labelKey: "users.settings.billing.modules.workOrder.label",
    descriptionKey: "users.settings.billing.modules.workOrder.description",
    icon: <FileTextOutlined />,
  },
  {
    key: "schedule",
    labelKey: "users.settings.billing.modules.schedule.label",
    descriptionKey: "users.settings.billing.modules.schedule.description",
    icon: <CalendarOutlined />,
  },
  {
    key: "finance",
    labelKey: "users.settings.billing.modules.finance.label",
    descriptionKey: "users.settings.billing.modules.finance.description",
    icon: <DollarOutlined />,
  },
  {
    key: "inventory",
    labelKey: "users.settings.billing.modules.inventory.label",
    descriptionKey: "users.settings.billing.modules.inventory.description",
    icon: <InboxOutlined />,
  },
  {
    key: "people",
    labelKey: "users.settings.billing.modules.people.label",
    descriptionKey: "users.settings.billing.modules.people.description",
    icon: <TeamOutlined />,
  },
  {
    key: "clients",
    labelKey: "users.settings.billing.modules.clients.label",
    descriptionKey: "users.settings.billing.modules.clients.description",
    icon: <UsergroupAddOutlined />,
  },
];

type AppearanceColorKey = keyof ThemeCustomColors;

type CompleteThemeColors = Required<ThemeCustomColors>;

type AppearancePresetPalette = {
  id: string;
  labelKey: string;
  descriptionKey: string;
  colorsByMode: Record<ThemeMode, CompleteThemeColors>;
};

const HEX_COLOR_PATTERN = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

const APPEARANCE_COLOR_KEYS: AppearanceColorKey[] = [
  "background",
  "surface",
  "surfaceAlt",
  "primary",
  "secondary",
  "tertiary",
  "text",
];

const APPEARANCE_PRESET_PALETTES: AppearancePresetPalette[] = [
  {
    id: "atlas",
    labelKey: "users.settings.appearance.customColors.presets.atlas.label",
    descriptionKey:
      "users.settings.appearance.customColors.presets.atlas.description",
    colorsByMode: {
      light: {
        background: "#f4f6f9",
        surface: "#ffffff",
        surfaceAlt: "#eaf2ff",
        primary: "#1e70ff",
        secondary: "#00cfa3",
        tertiary: "#7059ff",
        text: "#071318",
      },
      dark: {
        background: "#0f1f26",
        surface: "#132a33",
        surfaceAlt: "#173642",
        primary: "#4de6d3",
        secondary: "#2dd4bf",
        tertiary: "#8b7bff",
        text: "#e6f1f4",
      },
    },
  },
  {
    id: "sunrise",
    labelKey: "users.settings.appearance.customColors.presets.sunrise.label",
    descriptionKey:
      "users.settings.appearance.customColors.presets.sunrise.description",
    colorsByMode: {
      light: {
        background: "#fff6ed",
        surface: "#ffffff",
        surfaceAlt: "#ffe9d7",
        primary: "#ff7a00",
        secondary: "#ff4d4f",
        tertiary: "#a63ff0",
        text: "#2b1206",
      },
      dark: {
        background: "#2a160a",
        surface: "#3a2114",
        surfaceAlt: "#4b2b1b",
        primary: "#ff9b45",
        secondary: "#ff6a6d",
        tertiary: "#c085ff",
        text: "#ffeada",
      },
    },
  },
  {
    id: "forest",
    labelKey: "users.settings.appearance.customColors.presets.forest.label",
    descriptionKey:
      "users.settings.appearance.customColors.presets.forest.description",
    colorsByMode: {
      light: {
        background: "#f1f8f4",
        surface: "#ffffff",
        surfaceAlt: "#e1f3e8",
        primary: "#198754",
        secondary: "#0db39e",
        tertiary: "#4b7f25",
        text: "#0d1f14",
      },
      dark: {
        background: "#102018",
        surface: "#162a20",
        surfaceAlt: "#1f372b",
        primary: "#45c17a",
        secondary: "#2dcab3",
        tertiary: "#9bc56c",
        text: "#e2f2e9",
      },
    },
  },
  {
    id: "berry",
    labelKey: "users.settings.appearance.customColors.presets.berry.label",
    descriptionKey:
      "users.settings.appearance.customColors.presets.berry.description",
    colorsByMode: {
      light: {
        background: "#fff3f7",
        surface: "#ffffff",
        surfaceAlt: "#ffe3ed",
        primary: "#e83e8c",
        secondary: "#c52c74",
        tertiary: "#6f42c1",
        text: "#26111a",
      },
      dark: {
        background: "#29131f",
        surface: "#3a1b2b",
        surfaceAlt: "#4a2236",
        primary: "#ff71ad",
        secondary: "#e65a95",
        tertiary: "#9e7ae0",
        text: "#ffe5ef",
      },
    },
  },
  {
    id: "ocean",
    labelKey: "users.settings.appearance.customColors.presets.ocean.label",
    descriptionKey:
      "users.settings.appearance.customColors.presets.ocean.description",
    colorsByMode: {
      light: {
        background: "#edf8fb",
        surface: "#ffffff",
        surfaceAlt: "#def0f7",
        primary: "#0b84a5",
        secondary: "#00a6fb",
        tertiary: "#2b59c3",
        text: "#08202b",
      },
      dark: {
        background: "#0f2230",
        surface: "#163042",
        surfaceAlt: "#1b3f52",
        primary: "#36b8d9",
        secondary: "#54c5ff",
        tertiary: "#7ea1ff",
        text: "#ddf2fb",
      },
    },
  },
  {
    id: "graphite",
    labelKey: "users.settings.appearance.customColors.presets.graphite.label",
    descriptionKey:
      "users.settings.appearance.customColors.presets.graphite.description",
    colorsByMode: {
      light: {
        background: "#f5f7fa",
        surface: "#ffffff",
        surfaceAlt: "#e9edf3",
        primary: "#4b5d73",
        secondary: "#3c91e6",
        tertiary: "#6b7280",
        text: "#101927",
      },
      dark: {
        background: "#131922",
        surface: "#1a2431",
        surfaceAlt: "#223040",
        primary: "#8aa0b7",
        secondary: "#6ab5ff",
        tertiary: "#9aa5b1",
        text: "#e8edf5",
      },
    },
  },
  {
    id: "mango",
    labelKey: "users.settings.appearance.customColors.presets.mango.label",
    descriptionKey:
      "users.settings.appearance.customColors.presets.mango.description",
    colorsByMode: {
      light: {
        background: "#fff8ed",
        surface: "#ffffff",
        surfaceAlt: "#ffefcf",
        primary: "#ff9f1c",
        secondary: "#ffbf00",
        tertiary: "#ff6f3c",
        text: "#2a1804",
      },
      dark: {
        background: "#2a1b06",
        surface: "#38250d",
        surfaceAlt: "#493013",
        primary: "#ffbc5b",
        secondary: "#ffd250",
        tertiary: "#ff8f63",
        text: "#ffefd2",
      },
    },
  },
  {
    id: "lagoon",
    labelKey: "users.settings.appearance.customColors.presets.lagoon.label",
    descriptionKey:
      "users.settings.appearance.customColors.presets.lagoon.description",
    colorsByMode: {
      light: {
        background: "#ecfbf9",
        surface: "#ffffff",
        surfaceAlt: "#d9f5ef",
        primary: "#00bfa6",
        secondary: "#00a8e8",
        tertiary: "#2f5dff",
        text: "#05211c",
      },
      dark: {
        background: "#08231f",
        surface: "#10312b",
        surfaceAlt: "#154138",
        primary: "#34d9c2",
        secondary: "#4ec8ff",
        tertiary: "#7d9fff",
        text: "#d7f7f1",
      },
    },
  },
  {
    id: "plum",
    labelKey: "users.settings.appearance.customColors.presets.plum.label",
    descriptionKey:
      "users.settings.appearance.customColors.presets.plum.description",
    colorsByMode: {
      light: {
        background: "#f9f2ff",
        surface: "#ffffff",
        surfaceAlt: "#efe2ff",
        primary: "#7b2cbf",
        secondary: "#9d4edd",
        tertiary: "#4cc9f0",
        text: "#1d112b",
      },
      dark: {
        background: "#1c1030",
        surface: "#261642",
        surfaceAlt: "#32205a",
        primary: "#b084f5",
        secondary: "#c39dff",
        tertiary: "#7cdfff",
        text: "#efe5ff",
      },
    },
  },
  {
    id: "copper",
    labelKey: "users.settings.appearance.customColors.presets.copper.label",
    descriptionKey:
      "users.settings.appearance.customColors.presets.copper.description",
    colorsByMode: {
      light: {
        background: "#faf4ee",
        surface: "#ffffff",
        surfaceAlt: "#f0e3d6",
        primary: "#b35c2e",
        secondary: "#8f7d43",
        tertiary: "#d97706",
        text: "#23150b",
      },
      dark: {
        background: "#24170e",
        surface: "#322015",
        surfaceAlt: "#412a1c",
        primary: "#d38a5a",
        secondary: "#b79b63",
        tertiary: "#f3a23e",
        text: "#f5e8dc",
      },
    },
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

function normalizeThemeColors(
  colors: ThemeCustomColors | null | undefined
): ThemeCustomColors {
  if (!colors || typeof colors !== "object") return {};

  const normalized: ThemeCustomColors = {};
  APPEARANCE_COLOR_KEYS.forEach((key) => {
    const color = normalizeHexColor(colors[key]);
    if (color) normalized[key] = color;
  });

  return normalized;
}

function areThemeColorsEqual(
  left: ThemeCustomColors | null | undefined,
  right: ThemeCustomColors | null | undefined
): boolean {
  const normalizedLeft = normalizeThemeColors(left);
  const normalizedRight = normalizeThemeColors(right);

  return APPEARANCE_COLOR_KEYS.every(
    (key) => normalizedLeft[key] === normalizedRight[key]
  );
}

function resolvePaletteSwatchColors(colors: ThemeCustomColors): string[] {
  const defaultPalette = APPEARANCE_PRESET_PALETTES[0]?.colorsByMode.light;
  const fallbackBackground = defaultPalette?.background ?? "#f4f6f9";
  const fallbackSurfaceAlt = defaultPalette?.surfaceAlt ?? "#eaf2ff";
  const fallbackPrimary = defaultPalette?.primary ?? "#1e70ff";
  const fallbackSecondary = defaultPalette?.secondary ?? "#00cfa3";
  const fallbackTertiary = defaultPalette?.tertiary ?? "#7059ff";

  return [
    normalizeHexColor(colors.background) ?? fallbackBackground,
    normalizeHexColor(colors.surfaceAlt) ?? fallbackSurfaceAlt,
    normalizeHexColor(colors.primary) ?? fallbackPrimary,
    normalizeHexColor(colors.secondary) ?? fallbackSecondary,
    normalizeHexColor(colors.tertiary) ?? fallbackTertiary,
  ];
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

type TranslateFn = (key: string, options?: Record<string, unknown>) => string;

function toSourceLabel(source: "database" | "defaults", t: TranslateFn): string {
  if (source === "database") return t("users.settings.meta.sourceLong.database");
  return t("users.settings.meta.sourceLong.defaults");
}

function toSourceCompactLabel(source: "database" | "defaults", t: TranslateFn): string {
  if (source === "database") return t("users.settings.meta.sourceCompact.database");
  return t("users.settings.meta.sourceCompact.defaults");
}

function toResolutionLabel(
  resolution: "workspace" | "workspace-default" | "platform" | "none",
  t: TranslateFn
): string {
  if (resolution === "workspace")
    return t("users.settings.meta.resolutionLong.workspace");
  if (resolution === "workspace-default")
    return t("users.settings.meta.resolutionLong.workspaceDefault");
  if (resolution === "platform") return t("users.settings.meta.resolutionLong.platform");
  return t("users.settings.meta.resolutionLong.none");
}

function toResolutionCompactLabel(
  resolution: "workspace" | "workspace-default" | "platform" | "none",
  t: TranslateFn
): string {
  if (resolution === "workspace") return t("users.settings.meta.resolutionCompact.workspace");
  if (resolution === "workspace-default")
    return t("users.settings.meta.resolutionCompact.workspaceDefault");
  if (resolution === "platform") return t("users.settings.meta.resolutionCompact.platform");
  return t("users.settings.meta.resolutionCompact.none");
}

function toDateLabel(
  value: string | undefined,
  locale: AppLanguage,
  notUpdatedLabel: string
): string {
  if (!value) return notUpdatedLabel;
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return value;
  return dt.toLocaleString(locale);
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

function parseJsonObject(
  label: string,
  value: DataValue,
  t: TranslateFn
): DataMap | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  let parsed: DataValue;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    throw new Error(
      t("users.settings.advanced.validation.mustBeValidJson", { label })
    );
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(
      t("users.settings.advanced.validation.mustBeJsonObject", { label })
    );
  }
  return parsed as DataMap;
}

function parseJsonStringMap(
  label: string,
  value: DataValue,
  t: TranslateFn
): Record<string, string> | undefined {
  const parsed = parseJsonObject(label, value, t);
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
  values: NfeConfigurationFormValues,
  t: TranslateFn
): NfeConfigurationWritePayload {
  const headersLabel = t("users.settings.advanced.fields.headers");
  const payloadTemplateLabel = t("users.settings.advanced.fields.payloadTemplate");
  const responseMappingLabel = t("users.settings.advanced.fields.responseMapping");
  const issuerAddressLabel = t("users.settings.advanced.fields.issuerAddress");
  const defaultsLabel = t("users.settings.advanced.fields.defaults");
  const metadataLabel = t("users.settings.advanced.fields.metadata");

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
      headers: parseJsonStringMap(headersLabel, values.integration.headers, t),
      payloadTemplate: parseJsonObject(
        payloadTemplateLabel,
        values.integration.payloadTemplate,
        t
      ),
      responseMapping: parseJsonStringMap(
        responseMappingLabel,
        values.integration.responseMapping,
        t
      ),
    },
    issuer: {
      legalName: values.issuer.legalName,
      document: values.issuer.document,
      stateRegistration: values.issuer.stateRegistration,
      municipalRegistration: values.issuer.municipalRegistration,
      taxRegime: values.issuer.taxRegime,
      address: parseJsonObject(issuerAddressLabel, values.issuer.address, t),
    },
    defaults: parseJsonObject(defaultsLabel, values.defaults, t),
    metadata: parseJsonObject(metadataLabel, values.metadata, t),
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
  const { t, i18n } = useTranslation();

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
  const [appLanguage, setAppLanguageState] = React.useState<AppLanguage>(() =>
    normalizeAppLanguage(i18n.resolvedLanguage ?? i18n.language)
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

  React.useEffect(() => {
    const handleLanguageChanged = (language: string) => {
      setAppLanguageState(normalizeAppLanguage(language));
    };

    i18n.on("languageChanged", handleLanguageChanged);
    return () => {
      i18n.off("languageChanged", handleLanguageChanged);
    };
  }, [i18n]);

  const handleSaveWorkspaceSettings = async () => {
    const values = await settingsForm.validateFields();
    onSaveWorkspaceSettings(values as WorkspaceInvoiceSettings);
  };

  const handleSaveNfeConfiguration = async () => {
    try {
      const values = await configurationForm.validateFields();
      const payload = mapFormValuesToConfiguration(
        values as NfeConfigurationFormValues,
        t as TranslateFn
      );
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
    message.success(
      t("users.settings.appearance.theme.updateSuccess", {
        mode:
          mode === "dark"
            ? t("users.settings.appearance.theme.modes.dark")
            : t("users.settings.appearance.theme.modes.light"),
      })
    );
  };

  const handleLanguageChange = async (nextLanguage: AppLanguage) => {
    await setAppLanguage(nextLanguage);
    setAppLanguageState(nextLanguage);
    message.success(
      t("settings.language.changeSuccess", {
        language:
          nextLanguage === "pt-BR"
            ? t("settings.language.portuguese")
            : t("settings.language.english"),
      })
    );
  };

  const handlePresetPaletteSelect = (palette: AppearancePresetPalette) => {
    const colors = palette.colorsByMode[themePreference];
    themeService.setCustomColors(colors);
    message.success(
      t("users.settings.appearance.customColors.applySuccess", {
        palette: t(palette.labelKey),
      })
    );
  };

  const activePresetPalette = React.useMemo(
    () =>
      APPEARANCE_PRESET_PALETTES.find((palette) =>
        areThemeColorsEqual(customColors, palette.colorsByMode[themePreference])
      ) ?? null,
    [customColors, themePreference]
  );

  const handleResetCustomColors = () => {
    themeService.clearCustomColors();
    message.success(t("users.settings.appearance.customColors.resetSuccess"));
  };

  const hasCustomColors = React.useMemo(
    () => Object.keys(customColors).length > 0,
    [customColors]
  );

  const activePaletteStatus = React.useMemo(() => {
    if (!hasCustomColors) {
      return t("users.settings.appearance.customColors.states.default");
    }
    if (activePresetPalette) {
      return t(activePresetPalette.labelKey);
    }
    return t("users.settings.appearance.customColors.states.custom");
  }, [activePresetPalette, hasCustomColors, t]);

  const moduleTab = (
    <TabPaneBody>
      <Card>
        <CardTitle>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <DollarCircleOutlined />
            <span>{t("users.settings.billing.title")}</span>
          </span>
        </CardTitle>
        <CardSubtitle>
          {t("users.settings.billing.subtitle")}
        </CardSubtitle>
        <Alert
          showIcon
          type="info"
          style={{ marginBottom: 8 }}
          message={t("users.settings.billing.automation.title")}
          description={t("users.settings.billing.automation.description")}
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
                <span>{t("users.settings.billing.workspaceEnabled")}</span>
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
                      <span>{t(moduleOption.labelKey)}</span>
                    </span>
                  </ModuleTitle>
                  <ModuleDescription>{t(moduleOption.descriptionKey)}</ModuleDescription>
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
              {t("users.settings.billing.actions.save")}
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
            <span>{t("users.settings.issuance.title")}</span>
          </span>
        </CardTitle>
        <CardSubtitle>
          {t("users.settings.issuance.subtitle")}
        </CardSubtitle>

        <EmissionGrid data-cy="settings-issuance-form">
          <Form.Item
            name="environment"
            label={t("users.settings.issuance.fields.environment")}
            rules={[
              {
                required: true,
                message: t("users.settings.issuance.validation.environmentRequired"),
              },
            ]}
          >
            <Select
              data-cy="settings-issuance-environment-select"
              options={[
                {
                  value: "homologation",
                  label: t("users.settings.issuance.options.environment.homologation"),
                },
                {
                  value: "production",
                  label: t("users.settings.issuance.options.environment.production"),
                },
              ]}
            />
          </Form.Item>

          <Form.Item
            name={["integration", "provider"]}
            label={t("users.settings.issuance.fields.provider")}
            rules={[
              {
                required: true,
                message: t("users.settings.issuance.validation.providerRequired"),
              },
            ]}
          >
            <Input
              data-cy="settings-issuance-provider-input"
              placeholder={t("users.settings.issuance.placeholders.provider")}
            />
          </Form.Item>

          <Form.Item
            name={["integration", "method"]}
            label={t("users.settings.issuance.fields.httpMethod")}
          >
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
            label={t("users.settings.issuance.fields.authentication")}
            initialValue="none"
          >
            <Select
              data-cy="settings-issuance-auth-type-select"
              options={[
                {
                  value: "none",
                  label: t("users.settings.issuance.options.authentication.none"),
                },
                {
                  value: "bearer",
                  label: t("users.settings.issuance.options.authentication.bearer"),
                },
                {
                  value: "api-key",
                  label: t("users.settings.issuance.options.authentication.apiKey"),
                },
                {
                  value: "basic",
                  label: t("users.settings.issuance.options.authentication.basic"),
                },
              ]}
            />
          </Form.Item>

          <Form.Item
            className="span-two"
            name={["integration", "baseUrl"]}
            label={t("users.settings.issuance.fields.baseUrl")}
            rules={[
              {
                required: true,
                message: t("users.settings.issuance.validation.baseUrlRequired"),
              },
            ]}
          >
            <Input
              data-cy="settings-issuance-base-url-input"
              placeholder={t("users.settings.issuance.placeholders.baseUrl")}
            />
          </Form.Item>

          <Form.Item
            name={["integration", "issuePath"]}
            label={t("users.settings.issuance.fields.issuePath")}
            rules={[
              {
                required: true,
                message: t("users.settings.issuance.validation.issuePathRequired"),
              },
            ]}
          >
            <Input
              data-cy="settings-issuance-issue-path-input"
              placeholder={t("users.settings.issuance.placeholders.issuePath")}
            />
          </Form.Item>

          <Form.Item
            name={["integration", "timeoutMs"]}
            label={t("users.settings.issuance.fields.timeoutMs")}
          >
            <InputNumber
              data-cy="settings-issuance-timeout-input"
              min={1000}
              max={120000}
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item
            name={["integration", "retries"]}
            label={t("users.settings.issuance.fields.retries")}
          >
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
              label={t("users.settings.issuance.fields.bearerToken")}
              rules={[
                {
                  required: true,
                  message: t("users.settings.issuance.validation.tokenRequired"),
                },
              ]}
            >
              <Input.Password />
            </Form.Item>
          ) : null}

          {authType === "api-key" ? (
            <>
              <Form.Item
                name={["integration", "auth", "headerName"]}
                label={t("users.settings.issuance.fields.apiKeyHeader")}
                rules={[
                  {
                    required: true,
                    message: t("users.settings.issuance.validation.headerRequired"),
                  },
                ]}
              >
                <Input
                  data-cy="settings-issuance-api-key-header-input"
                  placeholder={t("users.settings.issuance.placeholders.apiKeyHeader")}
                />
              </Form.Item>
              <Form.Item
                name={["integration", "auth", "apiKey"]}
                label={t("users.settings.issuance.fields.apiKey")}
                rules={[
                  {
                    required: true,
                    message: t("users.settings.issuance.validation.apiKeyRequired"),
                  },
                ]}
              >
                <Input.Password data-cy="settings-issuance-api-key-input" />
              </Form.Item>
            </>
          ) : null}

          {authType === "basic" ? (
            <>
              <Form.Item
                name={["integration", "auth", "username"]}
                label={t("users.settings.issuance.fields.username")}
                rules={[
                  {
                    required: true,
                    message: t("users.settings.issuance.validation.usernameRequired"),
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name={["integration", "auth", "password"]}
                label={t("users.settings.issuance.fields.password")}
                rules={[
                  {
                    required: true,
                    message: t("users.settings.issuance.validation.passwordRequired"),
                  },
                ]}
              >
                <Input.Password />
              </Form.Item>
            </>
          ) : null}

          <Form.Item
            className="span-two"
            name={["issuer", "legalName"]}
            label={t("users.settings.issuance.fields.legalName")}
            rules={[
              {
                required: true,
                message: t("users.settings.issuance.validation.legalNameRequired"),
              },
            ]}
          >
            <Input data-cy="settings-issuance-legal-name-input" />
          </Form.Item>

          <Form.Item
            name={["issuer", "document"]}
            label={t("users.settings.issuance.fields.issuerDocument")}
            rules={[
              {
                required: true,
                message: t("users.settings.issuance.validation.documentRequired"),
              },
            ]}
          >
            <Input data-cy="settings-issuance-document-input" />
          </Form.Item>

          <Form.Item
            name={["issuer", "stateRegistration"]}
            label={t("users.settings.issuance.fields.stateRegistration")}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name={["issuer", "municipalRegistration"]}
            label={t("users.settings.issuance.fields.municipalRegistration")}
          >
            <Input />
          </Form.Item>

          <Form.Item name={["issuer", "taxRegime"]} label={t("users.settings.issuance.fields.taxRegime")}>
            <Input placeholder={t("users.settings.issuance.placeholders.taxRegime")} />
          </Form.Item>
        </EmissionGrid>

        <ActionsRow>
          <Button
            type="primary"
            onClick={() => void handleSaveNfeConfiguration()}
            loading={!!isSavingConfiguration}
            data-cy="settings-issuance-save-button"
          >
            {t("users.settings.issuance.actions.save")}
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
            <span>{t("users.settings.advanced.title")}</span>
          </span>
        </CardTitle>
        <CardSubtitle>
          {t("users.settings.advanced.subtitle")}
        </CardSubtitle>

        <AdvancedGrid data-cy="settings-advanced-form">
          <Form.Item
            name={["integration", "headers"]}
            label={t("users.settings.advanced.fields.headers")}
          >
            <Input.TextArea
              data-cy="settings-advanced-headers-input"
              autoSize={{ minRows: 1, maxRows: 2 }}
              placeholder={t("users.settings.advanced.placeholders.headers")}
            />
          </Form.Item>

          <Form.Item
            name={["integration", "payloadTemplate"]}
            label={t("users.settings.advanced.fields.payloadTemplate")}
          >
            <Input.TextArea
              data-cy="settings-advanced-payload-template-input"
              autoSize={{ minRows: 1, maxRows: 2 }}
              placeholder={t("users.settings.advanced.placeholders.payloadTemplate")}
            />
          </Form.Item>

          <Form.Item
            name={["integration", "responseMapping"]}
            label={t("users.settings.advanced.fields.responseMapping")}
          >
            <Input.TextArea
              data-cy="settings-advanced-response-mapping-input"
              autoSize={{ minRows: 1, maxRows: 2 }}
              placeholder={t("users.settings.advanced.placeholders.responseMapping")}
            />
          </Form.Item>

          <Form.Item
            name={["issuer", "address"]}
            label={t("users.settings.advanced.fields.issuerAddress")}
          >
            <Input.TextArea
              data-cy="settings-advanced-address-input"
              autoSize={{ minRows: 1, maxRows: 2 }}
              placeholder={t("users.settings.advanced.placeholders.issuerAddress")}
            />
          </Form.Item>

          <Form.Item name={["defaults"]} label={t("users.settings.advanced.fields.defaults")}>
            <Input.TextArea
              data-cy="settings-advanced-defaults-input"
              autoSize={{ minRows: 1, maxRows: 2 }}
              placeholder={t("users.settings.advanced.placeholders.defaults")}
            />
          </Form.Item>

          <Form.Item name={["metadata"]} label={t("users.settings.advanced.fields.metadata")}>
            <Input.TextArea
              data-cy="settings-advanced-metadata-input"
              autoSize={{ minRows: 1, maxRows: 2 }}
              placeholder={t("users.settings.advanced.placeholders.metadata")}
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
            {t("users.settings.advanced.actions.save")}
          </Button>
        </ActionsRow>
      </Card>
    </TabPaneBody>
  );

  const appearanceThemeContent = (
    <AppearanceTabContent>
      <Alert
        showIcon
        type="info"
        style={{ marginBottom: 8 }}
        message={t("users.settings.appearance.theme.alertTitle")}
        description={t("users.settings.appearance.theme.alertDescription")}
      />
      <ModuleToggleList>
        <ModuleToggleRow>
          <div>
            <ModuleTitle>
              <SunOutlined style={{ marginRight: 6 }} />
              {t("users.settings.appearance.theme.lightLabel")}
            </ModuleTitle>
            <ModuleDescription>
              {t("users.settings.appearance.theme.lightDescription")}
            </ModuleDescription>
          </div>
          <Button
            type={themePreference === "light" ? "primary" : "default"}
            onClick={() => handleThemeChange("light")}
            data-cy="settings-appearance-use-light-button"
          >
            {t("users.settings.appearance.theme.useLight")}
          </Button>
        </ModuleToggleRow>

        <ModuleToggleRow>
          <div>
            <ModuleTitle>
              <MoonOutlined style={{ marginRight: 6 }} />
              {t("users.settings.appearance.theme.darkLabel")}
            </ModuleTitle>
            <ModuleDescription>
              {t("users.settings.appearance.theme.darkDescription")}
            </ModuleDescription>
          </div>
          <Button
            type={themePreference === "dark" ? "primary" : "default"}
            onClick={() => handleThemeChange("dark")}
            data-cy="settings-appearance-use-dark-button"
          >
            {t("users.settings.appearance.theme.useDark")}
          </Button>
        </ModuleToggleRow>
      </ModuleToggleList>

      <ActionsRow style={{ gap: 8, flexWrap: "wrap" }}>
        <Button icon={<BgColorsOutlined />} disabled data-cy="settings-appearance-active-mode">
          {t("users.settings.appearance.theme.activeMode", {
            mode:
              themePreference === "dark"
                ? t("users.settings.appearance.theme.modes.dark")
                : t("users.settings.appearance.theme.modes.light"),
          })}
        </Button>
      </ActionsRow>
    </AppearanceTabContent>
  );

  const appearanceCustomColorsContent = (
    <AppearanceTabContent>
      <Alert
        showIcon
        type="info"
        style={{ marginBottom: 8 }}
        message={t("users.settings.appearance.customColors.introTitle")}
        description={t("users.settings.appearance.customColors.introDescription")}
      />

      <PresetPaletteGrid>
        {APPEARANCE_PRESET_PALETTES.map((palette) => {
          const isSelected = activePresetPalette?.id === palette.id;
          const swatches = resolvePaletteSwatchColors(
            palette.colorsByMode[themePreference]
          );
          return (
            <PresetPaletteButton
              key={palette.id}
              type="button"
              onClick={() => handlePresetPaletteSelect(palette)}
              $selected={isSelected}
              aria-pressed={isSelected}
              data-cy={`settings-appearance-preset-${palette.id}-button`}
            >
              <PresetPaletteSwatches>
                {swatches.map((swatchColor, index) => (
                  <PresetPaletteSwatch
                    key={`${palette.id}-swatch-${index}`}
                    $color={swatchColor}
                  />
                ))}
              </PresetPaletteSwatches>
              <PresetPaletteMeta>
                <div>
                  <PresetPaletteTitle>{t(palette.labelKey)}</PresetPaletteTitle>
                  <ModuleDescription>{t(palette.descriptionKey)}</ModuleDescription>
                </div>
                {isSelected ? (
                  <PresetPaletteBadge>
                    {t("users.settings.appearance.customColors.selected")}
                  </PresetPaletteBadge>
                ) : null}
              </PresetPaletteMeta>
            </PresetPaletteButton>
          );
        })}
      </PresetPaletteGrid>

      <ActionsRow style={{ gap: 8, flexWrap: "wrap" }}>
        <Button
          onClick={handleResetCustomColors}
          disabled={!hasCustomColors}
          data-cy="settings-appearance-reset-custom-colors-button"
        >
          {t("users.settings.appearance.customColors.reset")}
        </Button>
        <Button disabled data-cy="settings-appearance-custom-status">
          {t("users.settings.appearance.customColors.status", {
            state: activePaletteStatus,
          })}
        </Button>
      </ActionsRow>
    </AppearanceTabContent>
  );

  const appearanceLanguageContent = (
    <AppearanceTabContent>
      <Alert
        showIcon
        type="info"
        style={{ marginBottom: 8 }}
        message={t("settings.language.title")}
        description={t("settings.language.description")}
      />
      <ModuleToggleList>
        <ModuleToggleRow>
          <div>
            <ModuleTitle>{t("settings.language.selectLabel")}</ModuleTitle>
            <ModuleDescription>{t("settings.language.description")}</ModuleDescription>
          </div>
          <Select
            value={appLanguage}
            onChange={(value) => void handleLanguageChange(value as AppLanguage)}
            style={{ minWidth: 220 }}
            data-cy="settings-appearance-language-select"
            options={[
              { value: "en-US", label: t("settings.language.english") },
              { value: "pt-BR", label: t("settings.language.portuguese") },
            ]}
          />
        </ModuleToggleRow>
      </ModuleToggleList>
    </AppearanceTabContent>
  );

  const appearanceTab = (
    <TabPaneBody>
      <Card>
        <CardTitle>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <BgColorsOutlined />
            <span>{t("users.settings.appearance.title")}</span>
          </span>
        </CardTitle>
        <CardSubtitle>
          {t("users.settings.appearance.subtitle")}
        </CardSubtitle>
        <AppearanceTabs
          data-cy="settings-appearance-tabs"
          defaultActiveKey="theme"
          items={[
            {
              key: "theme",
              label: tabLabel(
                <SunOutlined />,
                t("users.settings.appearance.tabs.theme"),
                "settings-appearance-tab-theme"
              ),
              children: appearanceThemeContent,
            },
            {
              key: "custom-colors",
              label: tabLabel(
                <BgColorsOutlined />,
                t("users.settings.appearance.tabs.customColors"),
                "settings-appearance-tab-custom-colors"
              ),
              children: appearanceCustomColorsContent,
            },
            {
              key: "language",
              label: tabLabel(
                <GlobalOutlined />,
                t("settings.language.selectLabel"),
                "settings-appearance-tab-language"
              ),
              children: appearanceLanguageContent,
            },
          ]}
        />
      </Card>
    </TabPaneBody>
  );

  return (
    <BaseTemplate
      content={
        <SettingsTemplateRoot data-cy="settings-page">
          <SettingsShell>
            <HeroCard>
              <HeroTitle>{t("users.settings.hero.title")}</HeroTitle>
              <HeroSubtitle>
                {t("users.settings.hero.subtitle")}
              </HeroSubtitle>
              <MetaRow>
                <MetaPill title={workspaceId}>
                  {t("users.settings.meta.workspace")}: {toWorkspaceLabel(workspaceId)}
                </MetaPill>
                <MetaPill title={toSourceLabel(settingsSource, t as TranslateFn)}>
                  {t("users.settings.meta.source")}:
                  {" "}
                  {toSourceCompactLabel(settingsSource, t as TranslateFn)}
                </MetaPill>
                <MetaPill title={toResolutionLabel(nfeResolution, t as TranslateFn)}>
                  {t("users.settings.meta.nfe")}:
                  {" "}
                  {toResolutionCompactLabel(nfeResolution, t as TranslateFn)}
                </MetaPill>
                <MetaPill>
                  {t("users.settings.meta.rulesUpdated")}:
                  {" "}
                  {toDateLabel(
                    settingsUpdatedAt,
                    appLanguage,
                    t("users.settings.meta.notUpdated")
                  )}
                </MetaPill>
                <MetaPill>
                  {t("users.settings.meta.nfeUpdated")}:
                  {" "}
                  {toDateLabel(
                    nfeUpdatedAt,
                    appLanguage,
                    t("users.settings.meta.notUpdated")
                  )}
                </MetaPill>
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
                        t("users.settings.tabs.billing"),
                        "settings-tab-billing"
                      ),
                      children: moduleTab,
                    },
                    {
                      key: "issuance",
                      label: tabLabel(
                        <FileDoneOutlined />,
                        t("users.settings.tabs.issuance"),
                        "settings-tab-issuance"
                      ),
                      children: emissionTab,
                    },
                    {
                      key: "advanced",
                      label: tabLabel(
                        <ToolOutlined />,
                        t("users.settings.tabs.advanced"),
                        "settings-tab-advanced"
                      ),
                      children: advancedTab,
                    },
                    {
                      key: "appearance",
                      label: tabLabel(
                        <BgColorsOutlined />,
                        t("users.settings.tabs.appearance"),
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
