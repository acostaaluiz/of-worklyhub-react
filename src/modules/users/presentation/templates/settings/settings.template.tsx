import React from "react";
import { Button, Form, Input, InputNumber, Select, Switch, Tabs, message } from "antd";
import { BaseTemplate } from "@shared/base/base.template";
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
};

const MODULE_OPTIONS: ModuleOption[] = [
  {
    key: "work-order",
    label: "Work order",
    description: "Permite faturar e emitir NF-e a partir das ordens de servico.",
  },
  {
    key: "schedule",
    label: "Schedule",
    description: "Permite faturar e emitir NF-e a partir dos agendamentos.",
  },
  {
    key: "finance",
    label: "Finance",
    description: "Habilita emissao fiscal em lancamentos financeiros.",
  },
  {
    key: "inventory",
    label: "Inventory",
    description: "Reserva para vendas que originam baixa de estoque.",
  },
  {
    key: "people",
    label: "People",
    description: "Reserva para faturamento por servicos prestados por colaboradores.",
  },
  {
    key: "clients",
    label: "Clients",
    description: "Reserva para fluxos de venda iniciados no modulo de clientes.",
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
  if (source === "database") return "Dados carregados do workspace";
  return "Sem registro ainda (valores padrao)";
}

function toSourceCompactLabel(source: "database" | "defaults"): string {
  if (source === "database") return "workspace";
  return "padrao";
}

function toResolutionLabel(
  resolution: "workspace" | "workspace-default" | "platform" | "none"
): string {
  if (resolution === "workspace") return "Configuracao fiscal propria do workspace";
  if (resolution === "workspace-default") return "Configuracao fiscal default da plataforma";
  if (resolution === "platform") return "Configuracao da plataforma";
  return "Sem configuracao fiscal salva";
}

function toResolutionCompactLabel(
  resolution: "workspace" | "workspace-default" | "platform" | "none"
): string {
  if (resolution === "workspace") return "workspace";
  if (resolution === "workspace-default") return "workspace-default";
  if (resolution === "platform") return "plataforma";
  return "nao configurado";
}

function toDateLabel(value?: string): string {
  if (!value) return "Nao atualizado";
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return value;
  return dt.toLocaleString("pt-BR");
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
    throw new Error(`${label} precisa estar em JSON valido.`);
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(`${label} precisa ser um objeto JSON.`);
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
      address: parseJsonObject("Endereco do emissor", values.issuer.address),
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
  const [settingsForm] = Form.useForm<DataMap>();
  const [configurationForm] = Form.useForm<NfeConfigurationFormValues>();
  const authType = Form.useWatch(["integration", "auth", "type"], configurationForm);

  React.useEffect(() => {
    settingsForm.setFieldsValue(workspaceSettings);
  }, [settingsForm, workspaceSettings]);

  React.useEffect(() => {
    configurationForm.setFieldsValue(mapConfigurationToFormValues(nfeConfiguration));
  }, [configurationForm, nfeConfiguration]);

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

  const moduleTab = (
    <TabPaneBody>
      <Card>
        <CardTitle>Regras de faturamento por modulo</CardTitle>
        <CardSubtitle>
          Ative os modulos que podem iniciar cobranca e emissao de NF-e.
        </CardSubtitle>

        <Form
          form={settingsForm}
          layout="vertical"
          initialValues={workspaceSettings}
          disabled={!!isLoading}
        >
          <Form.Item
            name="enabled"
            valuePropName="checked"
            label="Faturamento do workspace habilitado"
          >
            <Switch />
          </Form.Item>

          <ModuleToggleList>
            {MODULE_OPTIONS.map((moduleOption) => (
              <ModuleToggleRow key={moduleOption.key}>
                <div>
                  <ModuleTitle>{moduleOption.label}</ModuleTitle>
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
              Salvar regras
            </Button>
          </ActionsRow>
        </Form>
      </Card>
    </TabPaneBody>
  );

  const emissionTab = (
    <TabPaneBody>
      <Card>
        <CardTitle>Conexao de emissao fiscal (NF-e)</CardTitle>
        <CardSubtitle>
          Configure o emissor fiscal do workspace para notas de venda de servico.
        </CardSubtitle>

        <EmissionGrid>
          <Form.Item
            name="environment"
            label="Ambiente"
            rules={[{ required: true, message: "Selecione o ambiente." }]}
          >
            <Select
              options={[
                { value: "homologation", label: "Homologacao" },
                { value: "production", label: "Producao" },
              ]}
            />
          </Form.Item>

          <Form.Item
            name={["integration", "provider"]}
            label="Provider"
            rules={[{ required: true, message: "Informe o provider." }]}
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
            label="Autenticacao"
            initialValue="none"
          >
            <Select
              options={[
                { value: "none", label: "Sem autenticacao" },
                { value: "bearer", label: "Bearer token" },
                { value: "api-key", label: "API key" },
                { value: "basic", label: "Basic auth" },
              ]}
            />
          </Form.Item>

          <Form.Item
            className="span-two"
            name={["integration", "baseUrl"]}
            label="Base URL da API fiscal"
            rules={[{ required: true, message: "Informe a Base URL." }]}
          >
            <Input placeholder="https://api.seu-provider.com" />
          </Form.Item>

          <Form.Item
            name={["integration", "issuePath"]}
            label="Path de emissao"
            rules={[{ required: true, message: "Informe o path de emissao." }]}
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
              rules={[{ required: true, message: "Informe o token." }]}
            >
              <Input.Password />
            </Form.Item>
          ) : null}

          {authType === "api-key" ? (
            <>
              <Form.Item
                name={["integration", "auth", "headerName"]}
                label="Header da API key"
                rules={[{ required: true, message: "Informe o header." }]}
              >
                <Input placeholder="x-api-key" />
              </Form.Item>
              <Form.Item
                name={["integration", "auth", "apiKey"]}
                label="API key"
                rules={[{ required: true, message: "Informe a API key." }]}
              >
                <Input.Password />
              </Form.Item>
            </>
          ) : null}

          {authType === "basic" ? (
            <>
              <Form.Item
                name={["integration", "auth", "username"]}
                label="Usuario"
                rules={[{ required: true, message: "Informe o usuario." }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name={["integration", "auth", "password"]}
                label="Senha"
                rules={[{ required: true, message: "Informe a senha." }]}
              >
                <Input.Password />
              </Form.Item>
            </>
          ) : null}

          <Form.Item
            className="span-two"
            name={["issuer", "legalName"]}
            label="Razao social"
            rules={[{ required: true, message: "Informe a razao social." }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name={["issuer", "document"]}
            label="CNPJ/CPF emissor"
            rules={[{ required: true, message: "Informe o documento." }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name={["issuer", "stateRegistration"]} label="Inscricao estadual">
            <Input />
          </Form.Item>

          <Form.Item name={["issuer", "municipalRegistration"]} label="Inscricao municipal">
            <Input />
          </Form.Item>

          <Form.Item name={["issuer", "taxRegime"]} label="Regime tributario">
            <Input placeholder="simples_nacional, lucro_presumido..." />
          </Form.Item>
        </EmissionGrid>

        <ActionsRow>
          <Button
            type="primary"
            onClick={() => void handleSaveNfeConfiguration()}
            loading={!!isSavingConfiguration}
          >
            Salvar emissao
          </Button>
        </ActionsRow>
      </Card>
    </TabPaneBody>
  );

  const advancedTab = (
    <TabPaneBody>
      <Card>
        <CardTitle>Parametros avancados</CardTitle>
        <CardSubtitle>
          Campos opcionais para headers extras, templates e metadados.
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
              placeholder='{"natureza_operacao":"Prestacao de servicos"}'
            />
          </Form.Item>

          <Form.Item
            name={["integration", "responseMapping"]}
            label="Response mapping (JSON)"
          >
            <Input.TextArea
              autoSize={{ minRows: 1, maxRows: 2 }}
              placeholder='{"status":"status","accessKey":"chave"}'
            />
          </Form.Item>

          <Form.Item name={["issuer", "address"]} label="Endereco emissor (JSON)">
            <Input.TextArea
              autoSize={{ minRows: 1, maxRows: 2 }}
              placeholder='{"logradouro":"Rua X","numero":"123","municipio":"Sao Paulo","uf":"SP"}'
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
            Salvar avancado
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
                Centralize parametros de faturamento e emissao de NF-e do workspace.
              </HeroSubtitle>
              <MetaRow>
                <MetaPill title={workspaceId}>Workspace: {toWorkspaceLabel(workspaceId)}</MetaPill>
                <MetaPill title={toSourceLabel(settingsSource)}>
                  Origem: {toSourceCompactLabel(settingsSource)}
                </MetaPill>
                <MetaPill title={toResolutionLabel(nfeResolution)}>
                  NF-e: {toResolutionCompactLabel(nfeResolution)}
                </MetaPill>
                <MetaPill>Regras atualizadas: {toDateLabel(settingsUpdatedAt)}</MetaPill>
                <MetaPill>NF-e atualizado: {toDateLabel(nfeUpdatedAt)}</MetaPill>
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
                    { key: "module-rules", label: "Faturamento", children: moduleTab },
                    { key: "issuance", label: "Emissao", children: emissionTab },
                    { key: "advanced", label: "Avancado", children: advancedTab },
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
