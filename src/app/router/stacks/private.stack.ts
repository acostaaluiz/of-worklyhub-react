import type { RouteObject } from "react-router-dom";
import { usersStackRoutes } from "@modules/users/presentation/stacks/users.stack";
import { companyStackRoutes } from "@modules/company/presentation/stacks/company.stack";
import { billingStackRoutes } from "@modules/billing/presentation/stacks/billing.stack";
import { scheduleStackRoutes } from "@modules/schedule/presentation/stacks/schedule.stack";
import { dashboardStackRoutes } from "@modules/dashboard/presentation/stack/dashboard.stack";
import { financeStackRoutes } from "@modules/finance/presentation/stacks/finance.stack";
import clientsStackRoutes from "@modules/clients/presentation/stacks/clients.stack";
import { inventoryStackRoutes } from "@modules/inventory/presentation/stacks/inventory.stack";
import { peopleStackRoutes } from "@modules/people/presentation/stacks/people.stack";

export const privateStackRoutes: RouteObject[] = [
  ...usersStackRoutes,
  ...companyStackRoutes,
  ...billingStackRoutes,
  ...scheduleStackRoutes,
  ...dashboardStackRoutes,
  ...financeStackRoutes,
  ...clientsStackRoutes,
  ...inventoryStackRoutes,
  ...peopleStackRoutes,
];
