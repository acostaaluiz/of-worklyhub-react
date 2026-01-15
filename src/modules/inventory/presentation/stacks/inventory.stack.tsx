import React, { lazy } from "react";
import type { RouteObject } from "react-router-dom";

// Overview and products pages removed - keeping only categories and home for now
const InventoryCategoriesPage = lazy(() => import("@modules/inventory/presentation/pages/categories/categories.page"));
const InventoryHomePage = lazy(() => import("@modules/inventory/presentation/pages/home/home.page"));

export const inventoryStackRoutes: RouteObject[] = [
  {
    id: "inventory",
    path: "/inventory",
    children: [
      // make Inventory Home the default for `/inventory`
      {
        index: true,
        element: (
          <React.Suspense fallback={null}>
            <InventoryHomePage />
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
