import { createBrowserRouter, type RouteObject } from "react-router-dom";
import { publicStackRoutes } from "@app/router/stacks/public.stack";
import { privateStackRoutes } from "@app/router/stacks/private.stack";
import RedirectIfAuthenticated from "@shared/providers/auth/redirect-if-authenticated";
import RequireAuth from "@shared/providers/auth/require-auth";
import { Outlet } from "react-router-dom";

function NotFound() {
  return (
    <div className="container" style={{ padding: "var(--space-8)" }}>
      <div
        className="surface"
        style={{ padding: "var(--space-7)", borderRadius: "var(--radius-lg)" }}
      >
        <h1 style={{ margin: 0 }}>Not Found</h1>
        <p className="text-muted" style={{ marginTop: "var(--space-2)" }}>
          The page you are looking for does not exist.
        </p>
      </div>
    </div>
  );
}

const routes: RouteObject[] = [
  {
    // public routes are only for unauthenticated users — redirect to /home if already authenticated
    element: (
      <RedirectIfAuthenticated>
        <Outlet />
      </RedirectIfAuthenticated>
    ),
    children: publicStackRoutes,
  },
  {
    // wrap private routes with RequireAuth
    element: (
      <RequireAuth>
        <Outlet />
      </RequireAuth>
    ),
    children: privateStackRoutes,
  },
  { path: "*", element: <NotFound /> },
];

export const appRouter = createBrowserRouter(routes);
