import React, { lazy } from "react";
import type { RouteObject } from "react-router-dom";

const PeopleHomePage = lazy(() => import("@modules/people/presentation/pages/home/home.page"));

export const peopleStackRoutes: RouteObject[] = [
  {
    id: "people",
    path: "/people",
    children: [
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
