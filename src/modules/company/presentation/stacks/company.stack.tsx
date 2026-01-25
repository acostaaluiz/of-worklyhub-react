import React, { lazy } from "react";
import type { RouteObject } from "react-router-dom";

const CompanyIntroductionPage = lazy(
  () =>
    import(
      "@modules/company/presentation/pages/company-introduction.page"
    )
);
const CompanyLandingPage = lazy(
  () => import("@modules/company/presentation/pages/landing/landing.page")
);

const CompanyProfilePage = lazy(
  () => import("@modules/company/presentation/pages/profile/profile.page")
);
const CompanyServicesAdminPage = lazy(() => import('@modules/company/presentation/pages/services/services.page'));
const SlaByEmployeePage = lazy(
  () => import("@modules/slas/presentation/pages/sla-by-employee/sla-by-employee.page")
);

export const companyStackRoutes: RouteObject[] = [
  {
    id: "company",
    path: "/company",
    children: [
      {
        id: "company.landing",
        path: "landing",
        element: (
          <React.Suspense fallback={null}>
            <CompanyLandingPage />
          </React.Suspense>
        ),
      },
      {
        id: "company.introduction",
        path: "introduction",
        element: (
          <React.Suspense fallback={null}>
            <CompanyIntroductionPage />
          </React.Suspense>
        ),
      },
      {
        id: "company.profile",
        path: "profile/:id",
        element: (
          <React.Suspense fallback={null}>
            <CompanyProfilePage />
          </React.Suspense>
        ),
      },
      {
        id: "company.services",
        path: "services",
        element: (
          <React.Suspense fallback={null}>
            <CompanyServicesAdminPage />
          </React.Suspense>
        ),
      },
      {
        id: "company.slas",
        path: "slas",
        element: (
          <React.Suspense fallback={null}>
            <SlaByEmployeePage />
          </React.Suspense>
        ),
      },
      {
        index: true,
        element: (
          <React.Suspense fallback={null}>
            <CompanyIntroductionPage />
          </React.Suspense>
        ),
      },
    ],
  },
];
