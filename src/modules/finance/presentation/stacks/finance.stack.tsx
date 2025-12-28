import React, { lazy } from "react";
import type { RouteObject } from "react-router-dom";

const FinancePage = lazy(
  () => import("@modules/finance/presentation/pages/finance/finance.page")
);
const ServicesFinancePage = lazy(
  () => import("@modules/finance/presentation/pages/services-finance/services-finance.page")
);
const SuggestionsPage = lazy(
  () => import("@modules/finance/presentation/pages/suggestions/suggestions.page")
);
const EntriesPage = lazy(
  () => import("@modules/finance/presentation/pages/entries/entries.page")
);

export const financeStackRoutes: RouteObject[] = [
  {
    id: "finance",
    path: "/finance",
    children: [
      {
        id: "finance.home",
        path: "",
        element: (
          <React.Suspense fallback={null}>
            <FinancePage />
          </React.Suspense>
        ),
      },
      {
        id: "finance.services",
        path: "services",
        element: (
          <React.Suspense fallback={null}>
            <ServicesFinancePage />
          </React.Suspense>
        ),
      },
      {
        id: "finance.suggestions",
        path: "suggestions",
        element: (
          <React.Suspense fallback={null}>
            <SuggestionsPage />
          </React.Suspense>
        ),
      },
      {
        id: "finance.entries",
        path: "entries",
        element: (
          <React.Suspense fallback={null}>
            <EntriesPage />
          </React.Suspense>
        ),
      },
    ],
  },
];
