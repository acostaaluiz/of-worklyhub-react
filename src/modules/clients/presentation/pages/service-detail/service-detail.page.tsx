import React from "react";
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
    title: "Service | WorklyHub",
    requiresAuth: false,
  };

  public override state: ServiceDetailState = {
    isLoading: false,
    initialized: false,
    error: undefined,
    service: undefined,
  };

  protected override renderPage(): React.ReactNode {
    const { service } = this.state;
    if (!service) return null;
    return <ServiceDetailTemplate service={service} onBooked={() => {}} />;
  }

  async componentDidMount(): Promise<void> {
    super.componentDidMount?.();

    const params = this.props.params;
    const serviceId = params?.serviceId;

    const items = await getAvailableServices();
    const svc = items.find((s) => s.id === serviceId) ?? items[0];
    this.setState({ service: svc });
  }
}

function Wrapper() {
  const params = useParams();
  return <ServiceDetailPage params={{ serviceId: params.serviceId }} />;
}

export default Wrapper;
