import React, { lazy } from "react";
import type { RouteObject } from "react-router-dom";

const SchedulePage = lazy(
  () => import("@modules/schedule/presentation/pages/schedule/schedule.page")
);

export const scheduleStackRoutes: RouteObject[] = [
  {
    id: "schedule",
    path: "/schedule",
    children: [
      {
        id: "schedule.calendar",
        path: "",
        element: (
          <React.Suspense fallback={null}>
            <SchedulePage />
          </React.Suspense>
        ),
      },
    ],
  },
];
