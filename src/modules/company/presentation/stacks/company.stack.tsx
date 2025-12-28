import React, { lazy } from "react";
import type { RouteObject } from "react-router-dom";

const CompanyIntroductionPage = lazy(
  () =>
    import(
      "@modules/company/presentation/pages/company-introduction.page"
    )
);

const CompanyProfilePage = lazy(
  () => import("@modules/company/presentation/pages/profile/profile.page")
);
const CompanyServicesAdminPage = lazy(() => import('@modules/company/presentation/pages/services/services.page'));

export const companyStackRoutes: RouteObject[] = [
  {
    id: "company",
    path: "/company",
    children: [
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
