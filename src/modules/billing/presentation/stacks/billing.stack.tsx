import React, { lazy } from "react";
import type { RouteObject } from "react-router-dom";

const PlanSelectionPage = lazy(
  () =>
    import("@modules/billing/presentation/pages/plan-selection/plan-selection.page")
);
const BillingLandingPage = lazy(
  () => import("@modules/billing/presentation/pages/landing/landing.page")
);

const CheckoutPage = lazy(
  () => import("@modules/billing/presentation/pages/checkout/checkout.page")
);
const EmployeeCapacityPage = lazy(
  () =>
    import(
      "@modules/billing/presentation/pages/employee-capacity/employee-capacity.page"
    )
);
const AiTokenPackagesPage = lazy(
  () =>
    import(
      "@modules/billing/presentation/pages/ai-token-packages/ai-token-packages.page"
    )
);

export const billingStackRoutes: RouteObject[] = [
  {
    id: "billing",
    path: "/billing",
    children: [
      {
        id: "billing.landing",
        path: "landing",
        element: (
          <React.Suspense fallback={null}>
            <BillingLandingPage />
          </React.Suspense>
        ),
      },
      {
        id: "billing.plans",
        path: "plans",
        element: (
          <React.Suspense fallback={null}>
            <PlanSelectionPage />
          </React.Suspense>
        ),
      },
      {
        id: "billing.checkout",
        path: "checkout",
        element: (
          <React.Suspense fallback={null}>
            <CheckoutPage />
          </React.Suspense>
        ),
      },
      {
        id: "billing.employeeCapacity",
        path: "employees",
        element: (
          <React.Suspense fallback={null}>
            <EmployeeCapacityPage />
          </React.Suspense>
        ),
      },
      {
        id: "billing.aiTokenPackages",
        path: "ai-tokens",
        element: (
          <React.Suspense fallback={null}>
            <AiTokenPackagesPage />
          </React.Suspense>
        ),
      },
    ],
  },
];
