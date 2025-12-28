import React, { useMemo } from "react";
import { BasePage } from "@shared/base/base.page";
import UsersHomeTemplate from "@modules/users/presentation/templates/home/home.template";
import ServicesCards from "@modules/users/presentation/components/home/services-cards.component";
import { User, Briefcase, Calendar, FileText } from "lucide-react";

function UsersHomeContent(): JSX.Element {
  const services = useMemo(
    () => [
      { id: "schedule", title: "Schedule", subtitle: "Manage appointments", icon: <Calendar /> },
      { id: "clients", title: "Clients", subtitle: "Manage clients", icon: <User /> },
      { id: "services", title: "Services", subtitle: "Catalog and pricing", icon: <Briefcase /> },
      { id: "finance", title: "Finance", subtitle: "Payments and reports", icon: <FileText /> },
    ],
    []
  );

  return (
    <UsersHomeTemplate>
      <h2>Welcome</h2>
      <p>Choose a module to start</p>
      <ServicesCards services={services} />
    </UsersHomeTemplate>
  );
}

export class UsersHomePage extends BasePage {
  protected override options = { title: "Home | WorklyHub", requiresAuth: true };

  protected override renderPage(): React.ReactNode {
    return <UsersHomeContent />;
  }
}

export default UsersHomePage;
