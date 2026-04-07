import React, { lazy } from "react";
import type { RouteObject } from "react-router-dom";
import { lazyWithRetry } from "@core/navigation/lazy-with-retry";

const WorkOrderLandingPage = lazyWithRetry(
  () => import("@modules/work-order/presentation/pages/landing/landing.page")
);
const WorkOrdersPage = lazy(
  () => import("@modules/work-order/presentation/pages/work-orders/work-orders.page")
);
const WorkOrderStatusesPage = lazy(
  () => import("@modules/work-order/presentation/pages/statuses/statuses.page")
);
const WorkOrderCalendarPage = lazy(
  () => import("@modules/work-order/presentation/pages/calendar/calendar.page")
);
const WorkOrderSettingsPage = lazy(
  () => import("@modules/work-order/presentation/pages/settings/settings.page")
);

export const workOrderStackRoutes: RouteObject[] = [
  {
    id: "work-order",
    path: "/work-order",
    children: [
      {
        id: "work-order.landing",
        path: "landing",
        element: (
          <React.Suspense fallback={null}>
            <WorkOrderLandingPage />
          </React.Suspense>
        ),
      },
      {
        id: "work-order.statuses",
        path: "statuses",
        element: (
          <React.Suspense fallback={null}>
            <WorkOrderStatusesPage />
          </React.Suspense>
        ),
      },
      {
        id: "work-order.calendar",
        path: "calendar",
        element: (
          <React.Suspense fallback={null}>
            <WorkOrderCalendarPage />
          </React.Suspense>
        ),
      },
      {
        id: "work-order.settings",
        path: "settings",
        element: (
          <React.Suspense fallback={null}>
            <WorkOrderSettingsPage />
          </React.Suspense>
        ),
      },
      {
        id: "work-order.home",
        path: "",
        element: (
          <React.Suspense fallback={null}>
            <WorkOrdersPage />
          </React.Suspense>
        ),
      },
    ],
  },
];
