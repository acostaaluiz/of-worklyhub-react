import { type PropsWithChildren } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import AppHeader from "@shared/ui/components/header/header.component";
import type { MenuProps } from "antd";
import { AppFooter } from "@shared/ui/components/footer/footer.component";
import { usersAuthService } from "@modules/users/services/auth.service";

import {
  PrivateFrame,
  PrivatePageShell,
  ContentShell,
} from "./private-frame.component.styles";

export function PrivateFrameLayout({ children }: PropsWithChildren) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const handleUpgrade = () => navigate("/billing/plans");

  const handleLogout = async () => {
    await usersAuthService.signOut();
    navigate("/login");
  };

  const menuItems: MenuProps["items"] = [
    { key: "/company/introduction", label: "Company setup" },
    { key: "/billing/plans", label: "Billing" },
    { key: "/users", label: "Users" },
  ];

  const userMenuItems: MenuProps["items"] = [
    { key: "/users", label: "Profile" },
    { key: "/settings", label: "Settings" },
    { type: "divider" as const },
    { key: "logout", label: "Sign out" },
  ];

  return (
    <PrivatePageShell>
      <AppHeader
        menuItems={menuItems}
        userMenuItems={userMenuItems}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        onUpgrade={handleUpgrade}
        selectedPath={location.pathname}
      />

      <ContentShell>
        <div className="container">
          <PrivateFrame>{children}</PrivateFrame>
        </div>
      </ContentShell>

      <AppFooter />
    </PrivatePageShell>
  );
}
