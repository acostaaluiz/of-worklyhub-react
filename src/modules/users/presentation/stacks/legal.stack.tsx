import React, { lazy } from "react";
import type { RouteObject } from "react-router-dom";

const TermsPage = lazy(
  () => import("@modules/users/presentation/pages/legal/terms.page")
);

const PrivacyPage = lazy(
  () => import("@modules/users/presentation/pages/legal/privacy.page")
);

export const legalStackRoutes: RouteObject[] = [
  {
    id: "legal",
    path: "/",
    children: [
      {
        id: "legal.terms",
        path: "terms",
        element: (
          <React.Suspense fallback={null}>
            <TermsPage />
          </React.Suspense>
        ),
      },
      {
        id: "legal.privacy",
        path: "privacy",
        element: (
          <React.Suspense fallback={null}>
            <PrivacyPage />
          </React.Suspense>
        ),
      },
    ],
  },
];
