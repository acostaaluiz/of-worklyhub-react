import React from "react";
import { BasePage } from "@shared/base/base.page";
import UsersHomeTemplate from "@modules/users/presentation/templates/home/home.template";
import ServicesCards from "@modules/users/presentation/components/home/services-cards.component";
import { Briefcase, Calendar, Users, DollarSign, Box } from "lucide-react";
import type { ApplicationServiceItem } from "@core/application/application-api";
import type { ReactNode } from "react";
import { Subscription } from "rxjs";
import { usersService } from "@modules/users/services/user.service";
import { applicationService } from "@core/application/application.service";
import { loadingService } from "@shared/ui/services/loading.service";
import { message } from "antd";

export class UsersHomePage extends BasePage<{}, { initialized: boolean; isLoading: boolean; error?: unknown; name?: string; services?: ApplicationServiceItem[] | null }> {
  protected override options = { title: "Home | WorklyHub", requiresAuth: true };

  private profileSub?: Subscription;

  public state = { isLoading: false, initialized: false, error: undefined, name: undefined, services: undefined };

  protected override async onInit(): Promise<void> {
    const current = usersService.getProfileValue();
    if (current?.name) this.setSafeState({ name: current.name });

    this.profileSub = usersService.getProfile$().subscribe((p) => {
      this.setSafeState({ name: p?.name });
    });

    // avoid duplicate fetches (React StrictMode can mount twice in dev)
    const existing = applicationService.getServicesValue();
    if (existing != null) {
      this.setSafeState({ services: existing });
      return;
    }

    loadingService.show();
    try {
      const services = await applicationService.fetchServices();
      this.setSafeState({ services: services ?? [] });
    } catch (err) {
      console.error("failed to fetch application services", err);
      message.error("Failed to load application services");
    } finally {
      loadingService.hide();
    }
  }

  override componentWillUnmount(): void {
    super.componentWillUnmount();
    this.profileSub?.unsubscribe();
  }

  protected override renderPage(): React.ReactNode {
    const apiServices: ApplicationServiceItem[] = (this.state.services ?? []) as ApplicationServiceItem[];

    const mapIcon = (key?: string): ReactNode => {
      switch (key) {
        case "calendar":
          return <Calendar />;
        case "users":
          return <Users />;
        case "dollar-sign":
          return <DollarSign />;
        case "box":
          return <Box />;
        default:
          return <Briefcase />;
      }
    };

    const services: { id: string; title: string; subtitle?: string; icon?: ReactNode }[] = apiServices.map((s: ApplicationServiceItem) => ({ id: s.uid, title: s.name, subtitle: s.description, icon: mapIcon(s.icon) }));

    return (
      <UsersHomeTemplate>
        <h2>{this.state.name ? `Welcome, ${this.state.name}` : "Welcome"}</h2>
        <p>Choose a module to start</p>
        <ServicesCards services={services} />
      </UsersHomeTemplate>
    );
  }
}

export default UsersHomePage;
