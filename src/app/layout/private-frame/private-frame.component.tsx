import { type PropsWithChildren, useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import type { MenuProps } from "antd";

import { companyService } from "@modules/company/services/company.service";
import { usersAuthService } from "@modules/users/services/auth.service";
import { AppFooter } from "@shared/ui/components/footer/footer.component";
import AppHeader from "./header.component";
import {
  ContentShell,
  PrivateFrame,
  PrivatePageShell,
} from "./private-frame.component.styles";


export function PrivateFrameLayout({ children }: PropsWithChildren) {
  const navigate = useNavigate();
  const location = useLocation();

  const [hasWorkspace, setHasWorkspace] = useState<boolean>(() => {
    return !!companyService.getWorkspaceValue();
  });

  useEffect(() => {
    const sub = companyService.getWorkspace$().subscribe((w) => setHasWorkspace(!!w));
    return () => sub.unsubscribe();
  }, []);

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const handleUpgrade = () => navigate("/billing/plans");

  const handleLogout = async () => {
    await usersAuthService.signOut();
    navigate("/login");
  };

  const menuItems: MenuProps["items"] = [
    // Show Company setup only when user does NOT have a workspace yet
    ...(hasWorkspace ? [] : [{ key: "/company/introduction", label: "Company setup" }]),
    { key: "/billing/landing", label: "Billing" },
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
          <PrivateFrame style={{ minWidth: 900 }}>
            {children ?? <Outlet />}
          </PrivateFrame>
        </div>
      </ContentShell>

      <AppFooter />
    </PrivatePageShell>
  );
}
