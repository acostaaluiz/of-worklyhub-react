import { createBrowserRouter, type RouteObject } from "react-router-dom";
import { publicStackRoutes } from "@app/router/stacks/public.stack";
import { privateStackRoutes } from "@app/router/stacks/private.stack";

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
  ...publicStackRoutes,
  ...privateStackRoutes,
  { path: "*", element: <NotFound /> },
];

export const appRouter = createBrowserRouter(routes);
