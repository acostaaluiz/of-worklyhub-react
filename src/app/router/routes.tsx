import { createBrowserRouter, type RouteObject } from "react-router-dom";
import { PrivateFrameLayout } from "@app/layout/private-frame/private-frame.component";
import RedirectIfAuthenticated from "@app/router/guards/redirect-if-authenticated";
import RequireAuth from "@app/router/guards/require-auth";
import { privateStackRoutes } from "@app/router/stacks/private.stack";
import { publicStackRoutes } from "@app/router/stacks/public.stack";
import { NavigationBoot } from "@core/navigation/navigation.boot";

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
    element: <NavigationBoot />,
    children: [
      {
        // public routes are only for unauthenticated users — redirect to /home if already authenticated
        element: <RedirectIfAuthenticated />,
        children: publicStackRoutes,
      },
      {
        // wrap private routes with RequireAuth and persistent PrivateFrameLayout
        element: (
          <RequireAuth>
            <PrivateFrameLayout />
          </RequireAuth>
        ),
        children: privateStackRoutes,
      },
      { path: "*", element: <NotFound /> },
    ],
  },
];

export const appRouter = createBrowserRouter(routes);
