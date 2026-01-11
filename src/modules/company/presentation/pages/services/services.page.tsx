import React, { type JSX } from "react";
import { BaseTemplate } from "@shared/base/base.template";
import { PrivateFrameLayout } from "@shared/ui/layout/private-frame/private-frame.component";
import ServiceManagerComponent from "@modules/company/presentation/components/company-services-admin/service-manager.component";
import { companyWorkspaceService } from "@modules/company/services/company-workspace.service";
import type { CompanyServiceModel } from "@modules/company/interfaces/service.model";
import { message } from "antd";
import { loadingService } from "@shared/ui/services/loading.service";
import { useEffect, useState } from "react";
import { BasePage } from "@shared/base/base.page";

function CompanyServicesAdminPageContent(): JSX.Element {
  const [services, setServices] = useState<CompanyServiceModel[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await companyWorkspaceService.listServices();
      setServices(res);
    } catch (err) {
      // swallow for now
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  async function handleCreate(payload: Omit<CompanyServiceModel, "id" | "createdAt">) {
    console.log(payload);
    setLoading(true);
    loadingService.show();
    try {
      await companyWorkspaceService.createService(payload);
      message.success("Serviço criado");
      await load();
    } catch (e) {
      console.log('error: ', e);
      message.error("Erro ao criar serviço");
    } finally {
      setLoading(false);
      loadingService.hide();
    }
  }

  async function handleUpdate(_id: string, _patch: Partial<CompanyServiceModel>) {
    setLoading(true);
    loadingService.show();
    try {
      await companyWorkspaceService.updateService(_id, _patch);
      message.success("Serviço atualizado");
      await load();
    } catch (e) {
      console.error(e);
      message.error("Erro ao atualizar serviço");
    } finally {
      setLoading(false);
      loadingService.hide();
    }
  }

  async function handleDeactivate(_s: CompanyServiceModel) {
    const s = _s;
    setLoading(true);
    loadingService.show();
    try {
      const nextActive = !(s.active ?? false);
      await companyWorkspaceService.updateService(s.id, { active: nextActive });
      message.success(nextActive ? "Serviço ativado" : "Serviço desativado");
      await load();
    } catch (e) {
      console.error(e);
      message.error("Erro ao inativar/ativar serviço");
    } finally {
      setLoading(false);
      loadingService.hide();
    }
  }

  return (
    <BaseTemplate
      content={
        <PrivateFrameLayout>
          <div style={{ padding: 16 }}>
            <h2 style={{ margin: 0 }}>Services you offer</h2>
            <div style={{ marginTop: 12 }}>
              <ServiceManagerComponent services={services} loading={loading} onCreate={handleCreate} onUpdate={handleUpdate} onDeactivate={handleDeactivate} />
            </div>
          </div>
        </PrivateFrameLayout>
      }
    />
  );
}

export class CompanyServicesAdminPage extends BasePage {
  protected override options = {
    title: "Company Services | WorklyHub",
    requiresAuth: true,
  };

  protected override renderPage(): React.ReactNode {
    return <CompanyServicesAdminPageContent />;
  }
}

export default CompanyServicesAdminPage;
