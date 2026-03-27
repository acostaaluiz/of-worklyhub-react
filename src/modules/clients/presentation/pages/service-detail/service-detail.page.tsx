import React from "react";
import { i18n as appI18n } from "@core/i18n";
import { BasePage } from "@shared/base/base.page";
import { ServiceDetailTemplate } from "@modules/clients/presentation/templates/service-detail/service-detail.template";
import { getAvailableServices } from "@modules/clients/services/clients.service";
import type { ServiceModel } from "@modules/clients/interfaces/service.model";
import { useParams } from "react-router-dom";
import type { BasePageState } from "@shared/base/interfaces/base-page.state.interface";
import type { BaseProps } from "@shared/base/interfaces/base-props.interface";

interface PageProps extends BaseProps {
  params?: { serviceId?: string };
}

interface ServiceDetailState extends BasePageState {
  service?: ServiceModel;
}

export class ServiceDetailPage extends BasePage<PageProps, ServiceDetailState> {
  protected override options = {
    title: `${appI18n.t("clients.pageTitles.serviceDetail")} | WorklyHub`,
    requiresAuth: false,
  };

  public override state: ServiceDetailState = {
    isLoading: false,
    initialized: false,
    error: undefined,
    service: undefined,
  };

  protected override async onInit(): Promise<void> {
    await this.runAsync(async () => {
      const params = this.props.params;
      const serviceId = params?.serviceId;

      const items = await getAvailableServices();
      const service = items.find((item) => item.id === serviceId) ?? items[0];
      this.setSafeState({ service });
    }, { swallowError: true });
  }

  protected override renderPage(): React.ReactNode {
    const { service } = this.state;
    if (!service) return null;
    return <ServiceDetailTemplate service={service} onBooked={() => {}} />;
  }
}

function Wrapper() {
  const params = useParams();
  return <ServiceDetailPage params={{ serviceId: params.serviceId }} />;
}

export default Wrapper;
