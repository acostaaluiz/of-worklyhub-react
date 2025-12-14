import type { RouteObject } from "react-router-dom";
import { authStackRoutes } from "@modules/users/presentation/stacks/auth.stack";

export const publicStackRoutes: RouteObject[] = [...authStackRoutes];
