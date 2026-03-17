import React from "react";
import { message } from "antd";
import { i18n as appI18n } from "@core/i18n";
import { isAppError } from "@core/errors/is-app-error";
import {
  invoiceSettingsService,
  type WorkspaceInvoiceConfigurationBundle,
} from "@modules/billing/services/invoice-settings.service";
import type {
  NfeConfigurationWritePayload,
  WorkspaceInvoiceSettings,
} from "@modules/billing/services/invoice-settings-api";
import { BasePage } from "@shared/base/base.page";
import SettingsTemplate from "@modules/users/presentation/templates/settings/settings.template";

const DEFAULT_WORKSPACE_SETTINGS: WorkspaceInvoiceSettings = {
  enabled: false,
  modules: {
    "work-order": false,
    schedule: false,
    finance: false,
    inventory: false,
    people: false,
    clients: false,
  },
};

const DEFAULT_NFE_CONFIGURATION: NfeConfigurationWritePayload = {
  environment: "homologation",
  integration: {
    provider: "govbr",
    baseUrl: "",
    issuePath: "",
    method: "POST",
    timeoutMs: 15000,
    retries: 1,
    auth: { type: "none" },
  },
  issuer: {
    legalName: "",
    document: "",
  },
};

type State = {
  isLoading: boolean;
  initialized: boolean;
  isSavingSettings: boolean;
  isSavingConfiguration: boolean;
  workspaceId?: string;
  workspaceSettings: WorkspaceInvoiceSettings;
  settingsSource: "database" | "defaults";
  settingsUpdatedAt?: string;
  nfeConfiguration: NfeConfigurationWritePayload;
  nfeResolution: "workspace" | "workspace-default" | "platform" | "none";
  nfeUpdatedAt?: string;
};

export class SettingsPage extends BasePage<{}, State> {
  protected override options = { title: `${appI18n.t("users.pageTitles.settings")} | WorklyHub`, requiresAuth: true };

  public state: State = {
    isLoading: false,
    initialized: false,
    isSavingSettings: false,
    isSavingConfiguration: false,
    workspaceId: undefined,
    workspaceSettings: DEFAULT_WORKSPACE_SETTINGS,
    settingsSource: "defaults",
    settingsUpdatedAt: undefined,
    nfeConfiguration: DEFAULT_NFE_CONFIGURATION,
    nfeResolution: "none",
    nfeUpdatedAt: undefined,
  };

  protected override async onInit(): Promise<void> {
    this.setSafeState({ isLoading: true });
    try {
      const bundle: WorkspaceInvoiceConfigurationBundle =
        await invoiceSettingsService.fetchWorkspaceBundle();
      this.setSafeState({
        workspaceId: bundle.workspaceId,
        workspaceSettings: bundle.workspaceSettings,
        settingsSource: bundle.settingsSource,
        settingsUpdatedAt: bundle.settingsUpdatedAt,
        nfeConfiguration: bundle.nfeConfiguration,
        nfeResolution: bundle.nfeResolution,
        nfeUpdatedAt: bundle.nfeUpdatedAt,
      });
    } catch (err) {
      console.error("settings.init", err);
      message.error(
        isAppError(err)
          ? err.message
          : appI18n.t("users.settings.messages.loadError")
      );
    } finally {
      this.setSafeState({ isLoading: false });
    }
  }

  private handleSaveWorkspaceSettings = async (
    settings: WorkspaceInvoiceSettings
  ) => {
    this.setSafeState({ isSavingSettings: true });
    try {
      const response = await invoiceSettingsService.saveWorkspaceSettings(settings);
      this.setSafeState({
        workspaceId: response.workspaceId,
        workspaceSettings: response.settings,
        settingsSource: "database",
        settingsUpdatedAt: response.updatedAt,
      });
      message.success(appI18n.t("users.settings.messages.saveRulesSuccess"));
    } catch (err) {
      console.error("settings.saveWorkspaceSettings", err);
      message.error(
        isAppError(err)
          ? err.message
          : appI18n.t("users.settings.messages.saveRulesError")
      );
    } finally {
      this.setSafeState({ isSavingSettings: false });
    }
  };

  private handleSaveNfeConfiguration = async (
    configuration: NfeConfigurationWritePayload
  ) => {
    this.setSafeState({ isSavingConfiguration: true });
    try {
      const response =
        await invoiceSettingsService.saveWorkspaceNfeConfiguration(configuration);
      this.setSafeState({
        workspaceId: response.workspaceId,
        nfeConfiguration: response.configuration,
        nfeResolution: "workspace",
        nfeUpdatedAt: response.updatedAt,
      });
      message.success(appI18n.t("users.settings.messages.saveNfeSuccess"));
    } catch (err) {
      console.error("settings.saveNfeConfiguration", err);
      message.error(
        isAppError(err)
          ? err.message
          : appI18n.t("users.settings.messages.saveNfeError")
      );
    } finally {
      this.setSafeState({ isSavingConfiguration: false });
    }
  };

  protected override renderPage(): React.ReactNode {
    return (
      <SettingsTemplate
        workspaceId={this.state.workspaceId}
        workspaceSettings={this.state.workspaceSettings}
        settingsSource={this.state.settingsSource}
        settingsUpdatedAt={this.state.settingsUpdatedAt}
        nfeConfiguration={this.state.nfeConfiguration}
        nfeResolution={this.state.nfeResolution}
        nfeUpdatedAt={this.state.nfeUpdatedAt}
        isLoading={this.state.isLoading}
        isSavingSettings={this.state.isSavingSettings}
        isSavingConfiguration={this.state.isSavingConfiguration}
        onSaveWorkspaceSettings={(settings) =>
          void this.handleSaveWorkspaceSettings(settings)
        }
        onSaveNfeConfiguration={(configuration) =>
          void this.handleSaveNfeConfiguration(configuration)
        }
      />
    );
  }
}

export default SettingsPage;

