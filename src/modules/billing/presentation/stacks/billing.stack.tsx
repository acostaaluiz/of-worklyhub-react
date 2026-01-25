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
    ],
  },
];
