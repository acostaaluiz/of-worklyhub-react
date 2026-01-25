import React, { lazy } from "react";
import type { RouteObject } from "react-router-dom";

const PeopleHomePage = lazy(() => import("@modules/people/presentation/pages/home/home.page"));
const PeopleLandingPage = lazy(() => import("@modules/people/presentation/pages/landing/landing.page"));

export const peopleStackRoutes: RouteObject[] = [
  {
    id: "people",
    path: "/people",
    children: [
      {
        id: "people.landing",
        path: "landing",
        element: (
          <React.Suspense fallback={null}>
            <PeopleLandingPage />
          </React.Suspense>
        ),
      },
      {
        id: "people.home",
        path: "",
        element: (
          <React.Suspense fallback={null}>
            <PeopleHomePage />
          </React.Suspense>
        ),
      },
    ],
  },
];

export default peopleStackRoutes;
