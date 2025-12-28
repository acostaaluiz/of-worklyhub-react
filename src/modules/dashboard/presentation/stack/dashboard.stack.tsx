import React, { lazy } from "react";
import type { RouteObject } from "react-router-dom";

const DashboardPage = lazy(() =>
  import("@modules/dashboard/presentation/pages/dashboard/dashboard.page").then(
    (m: any) => ({
      default: m.default ?? m.DashboardPage,
    })
  )
);

export const dashboardStackRoutes: RouteObject[] = [
  {
    id: "dashboard",
    path: "/dashboard",
    children: [
      {
        id: "dashboard.home",
        path: "",
        element: (
          <React.Suspense fallback={null}>
            <DashboardPage />
          </React.Suspense>
        ),
      },
    ],
  },
];
