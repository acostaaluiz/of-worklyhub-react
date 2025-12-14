import React, { lazy } from "react";
import type { RouteObject } from "react-router-dom";

const LoginPage = lazy(
  () => import("@modules/users/presentation/pages/login/login.page")
);

const RegisterPage = lazy(
  () => import("@modules/users/presentation/pages/register/register.page")
);

export const authStackRoutes: RouteObject[] = [
  {
    id: "auth",
    path: "/",
    children: [
      {
        id: "auth.login",
        path: "login",
        element: (
          <React.Suspense fallback={null}>
            <LoginPage />
          </React.Suspense>
        ),
      },
      {
        id: "auth.register",
        path: "register",
        element: (
          <React.Suspense fallback={null}>
            <RegisterPage />
          </React.Suspense>
        ),
      },
      {
        index: true,
        element: (
          <React.Suspense fallback={null}>
            <LoginPage />
          </React.Suspense>
        ),
      },
    ],
  },
];
