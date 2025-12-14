import type { RouteObject } from "react-router-dom";
import { usersStackRoutes } from "@modules/users/presentation/stacks/users.stack";
import { companyStackRoutes } from "@modules/company/presentation/stacks/company.stack";
import { billingStackRoutes } from "@modules/billing/presentation/stacks/billing.stack";

export const privateStackRoutes: RouteObject[] = [
  ...usersStackRoutes,
  ...companyStackRoutes,
  ...billingStackRoutes,
];
