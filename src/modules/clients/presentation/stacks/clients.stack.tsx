import React, { lazy } from "react";
import type { RouteObject } from "react-router-dom";

const ClientsHomePage = lazy(
  () => import("@modules/clients/presentation/pages/home/home.page")
);
const ServiceDetailPage = lazy(
  () => import("@modules/clients/presentation/pages/service-detail/service-detail.page")
);
const MyAppointmentsPage = lazy(
  () => import("@modules/clients/presentation/pages/my-appointments/my-appointments.page")
);

export const clientsStackRoutes: RouteObject[] = [
  {
    id: "clients",
    path: "/clients",
    children: [
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
        id: "clients.appointments",
        path: "appointments",
        element: (
          <React.Suspense fallback={null}>
            <MyAppointmentsPage />
          </React.Suspense>
        ),
      },
    ],
  },
];

export default clientsStackRoutes;
