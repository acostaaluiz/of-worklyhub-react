import React from "react";
import { Navigate } from "react-router-dom";

// Products page removed; redirect to inventory home
export default function InventoryProductsRedirect() {
  return React.createElement(Navigate, { to: "/inventory/home", replace: true });
}
