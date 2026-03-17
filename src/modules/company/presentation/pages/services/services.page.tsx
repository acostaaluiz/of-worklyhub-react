import React, { type JSX, useEffect, useState } from "react";
import { message } from "antd";

import { i18n as appI18n } from "@core/i18n";
import type { CompanyServiceModel } from "@modules/company/interfaces/service.model";
import ServiceManagerComponent from "@modules/company/presentation/components/company-services-admin/service-manager.component";
import { companyWorkspaceService } from "@modules/company/services/company-workspace.service";
import { BasePage } from "@shared/base/base.page";
import { BaseTemplate } from "@shared/base/base.template";
import { loadingService } from "@shared/ui/services/loading.service";

function CompanyServicesAdminPageContent(): JSX.Element {
  const [services, setServices] = useState<CompanyServiceModel[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await companyWorkspaceService.listServices();
      setServices(res);
    } catch {
      // ignore for now
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  async function handleCreate(payload: Omit<CompanyServiceModel, "id" | "createdAt">) {
    setLoading(true);
    loadingService.show();
    try {
      await companyWorkspaceService.createService(payload);
      message.success(appI18n.t("company.admin.messages.serviceCreated"));
      await load();
    } catch (error) {
      console.error(error);
      message.error(appI18n.t("company.admin.messages.createServiceError"));
    } finally {
      setLoading(false);
      loadingService.hide();
    }
  }

  async function handleUpdate(id: string, patch: Partial<CompanyServiceModel>) {
    setLoading(true);
    loadingService.show();
    try {
      await companyWorkspaceService.updateService(id, patch);
      message.success(appI18n.t("company.admin.messages.serviceUpdated"));
      await load();
    } catch (error) {
      console.error(error);
      message.error(appI18n.t("company.admin.messages.updateServiceError"));
    } finally {
      setLoading(false);
      loadingService.hide();
    }
  }

  async function handleDeactivate(service: CompanyServiceModel) {
    setLoading(true);
    loadingService.show();
    try {
      const nextActive = !(service.active ?? false);
      await companyWorkspaceService.updateService(service.id, { active: nextActive });
      message.success(
        nextActive
          ? appI18n.t("company.admin.messages.serviceActivated")
          : appI18n.t("company.admin.messages.serviceDeactivated")
      );
      await load();
    } catch (error) {
      console.error(error);
      message.error(appI18n.t("company.admin.messages.toggleServiceError"));
    } finally {
      setLoading(false);
      loadingService.hide();
    }
  }

  return (
    <BaseTemplate
      content={
        <div style={{ padding: 16 }}>
          <h2 style={{ margin: 0 }} data-cy="company-services-page-title">
            {appI18n.t("company.admin.servicesPage.title")}
          </h2>
          <div style={{ marginTop: 12 }}>
            <div data-cy="company-services-page">
              <ServiceManagerComponent
                services={services}
                loading={loading}
                onCreate={handleCreate}
                onUpdate={handleUpdate}
                onDeactivate={handleDeactivate}
              />
            </div>
          </div>
        </div>
      }
    />
  );
}

export class CompanyServicesAdminPage extends BasePage {
  protected override options = {
    title: `${appI18n.t("company.pageTitles.services")} | WorklyHub`,
    requiresAuth: true,
  };

  protected override renderPage(): React.ReactNode {
    return <CompanyServicesAdminPageContent />;
  }
}

export default CompanyServicesAdminPage;
