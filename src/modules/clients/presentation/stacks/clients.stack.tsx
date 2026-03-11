import React, { lazy } from "react";
import type { RouteObject } from "react-router-dom";

const ClientsHomePage = lazy(
  () => import("@modules/clients/presentation/pages/home/home.page")
);
const ClientsLandingPage = lazy(
  () => import("@modules/clients/presentation/pages/landing/landing.page")
);
const ServiceDetailPage = lazy(
  () => import("@modules/clients/presentation/pages/service-detail/service-detail.page")
);
const Customer360Page = lazy(
  () => import("@modules/clients/presentation/pages/customer-360/customer-360.page")
);

export const clientsStackRoutes: RouteObject[] = [
  {
    id: "clients",
    path: "/clients",
    children: [
      {
        id: "clients.landing",
        path: "landing",
        element: (
          <React.Suspense fallback={null}>
            <ClientsLandingPage />
          </React.Suspense>
        ),
      },
      {
        id: "clients.home",
        path: "",
        element: (
          <React.Suspense fallback={null}>
            <ClientsHomePage />
          </React.Suspense>
        ),
      },
      {
        id: "clients.service.detail",
        path: "service/:serviceId",
        element: (
          <React.Suspense fallback={null}>
            <ServiceDetailPage />
          </React.Suspense>
        ),
      },
      {
        id: "clients.customer-360",
        path: "360",
        element: (
          <React.Suspense fallback={null}>
            <Customer360Page />
          </React.Suspense>
        ),
      },
    ],
  },
];

export default clientsStackRoutes;
