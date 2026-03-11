import React, { lazy } from "react";
import type { RouteObject } from "react-router-dom";

const GrowthLandingPage = lazy(
  () => import("@modules/growth/presentation/pages/landing/landing.page")
);
const GrowthAutopilotPage = lazy(
  () => import("@modules/growth/presentation/pages/autopilot/autopilot.page")
);

export const growthStackRoutes: RouteObject[] = [
  {
    id: "growth",
    path: "/growth",
    children: [
      {
        id: "growth.landing",
        path: "landing",
        element: (
          <React.Suspense fallback={null}>
            <GrowthLandingPage />
          </React.Suspense>
        ),
      },
      {
        id: "growth.home",
        path: "",
        element: (
          <React.Suspense fallback={null}>
            <GrowthAutopilotPage />
          </React.Suspense>
        ),
      },
    ],
  },
];

export default growthStackRoutes;
