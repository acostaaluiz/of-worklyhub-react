import React, { lazy } from "react";
import type { RouteObject } from "react-router-dom";

const CompanyIntroductionPage = lazy(
  () =>
    import(
      "@modules/company/presentation/pages/company-introduction.page"
    )
);

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
