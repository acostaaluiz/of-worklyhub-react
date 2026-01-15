import React from "react";
import { Navigate } from "react-router-dom";

// Overview page removed; redirect to inventory home
export default function InventoryOverviewRedirect() {
  return React.createElement(Navigate, { to: "/inventory/home", replace: true });
}
