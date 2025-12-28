import React, { lazy } from "react";
import type { RouteObject } from "react-router-dom";

const InventoryOverviewPage = lazy(() => import("@modules/inventory/presentation/pages/overview/overview.page"));
const InventoryProductsPage = lazy(() => import("@modules/inventory/presentation/pages/products/products.page"));
const InventoryCategoriesPage = lazy(() => import("@modules/inventory/presentation/pages/categories/categories.page"));
const InventoryHomePage = lazy(() => import("@modules/inventory/presentation/pages/home/home.page"));

export const inventoryStackRoutes: RouteObject[] = [
  {
    id: "inventory",
    path: "/inventory",
    children: [
      {
        id: "inventory.overview",
        path: "",
        element: (
          <React.Suspense fallback={null}>
            <InventoryOverviewPage />
          </React.Suspense>
        ),
      },
      {
        id: "inventory.products",
        path: "products",
        element: (
          <React.Suspense fallback={null}>
            <InventoryProductsPage />
          </React.Suspense>
        ),
      },
      {
        id: "inventory.categories",
        path: "categories",
        element: (
          <React.Suspense fallback={null}>
            <InventoryCategoriesPage />
          </React.Suspense>
        ),
      },
      {
        id: "inventory.home",
        path: "home",
        element: (
          <React.Suspense fallback={null}>
            <InventoryHomePage />
          </React.Suspense>
        ),
      },
    ],
  },
];

export default inventoryStackRoutes;
