import React, { lazy } from "react";
import type { RouteObject } from "react-router-dom";

const SchedulePage = lazy(
  () => import("@modules/schedule/presentation/pages/schedule/schedule.page")
);
const ScheduleLandingPage = lazy(
  () => import("@modules/schedule/presentation/pages/landing/landing.page")
);
const ScheduleSettingsPage = lazy(
  () => import("@modules/schedule/presentation/pages/settings/settings.page")
);

export const scheduleStackRoutes: RouteObject[] = [
  {
    id: "schedule",
    path: "/schedule",
    children: [
      {
        id: "schedule.landing",
        path: "landing",
        element: (
          <React.Suspense fallback={null}>
            <ScheduleLandingPage />
          </React.Suspense>
        ),
      },
      {
        id: "schedule.calendar",
        path: "",
        element: (
          <React.Suspense fallback={null}>
            <SchedulePage />
          </React.Suspense>
        ),
      },
      {
        id: "schedule.settings",
        path: "settings",
        element: (
          <React.Suspense fallback={null}>
            <ScheduleSettingsPage />
          </React.Suspense>
        ),
      },
    ],
  },
];
