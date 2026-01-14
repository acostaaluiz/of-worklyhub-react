import React from "react";
import { type PropsWithChildren } from "react";
import { useNavigate, useLocation, Outlet, useNavigation } from "react-router-dom";

import AppHeader from "@shared/ui/components/header/header.component";
import type { MenuProps } from "antd";
import { AppFooter } from "@shared/ui/components/footer/footer.component";
import { usersAuthService } from "@modules/users/services/auth.service";
import { companyService } from "@modules/company/services/company.service";
import { useEffect, useState } from "react";

import {
  PrivateFrame,
  PrivatePageShell,
  ContentShell,
  SkeletonAvatar,
  SkeletonRow,
  SkeletonList,
} from "./private-frame.component.styles";


export function PrivateFrameLayout({ children }: PropsWithChildren) {
  const navigate = useNavigate();
  const location = useLocation();

  const [hasWorkspace, setHasWorkspace] = useState<boolean>(() => {
    return !!companyService.getWorkspaceValue();
  });

  const navigation = useNavigation();
  const [showSkeleton, setShowSkeleton] = useState<boolean>(() => !children);
  const minSkeletonMs = 500;
  const skeletonStartRef = React.useRef<number | null>(null);
  

  useEffect(() => {
    // when navigation begins show skeleton and record start
    if (navigation.state === "loading" || navigation.state === "submitting") {
      skeletonStartRef.current = Date.now();
      const t0 = setTimeout(() => setShowSkeleton(true), 0);
      return () => clearTimeout(t0);
    }

    // when navigation ends, ensure skeleton displays for at least minSkeletonMs
    const start = skeletonStartRef.current ?? Date.now();
    const elapsed = Date.now() - start;
    const remaining = Math.max(0, minSkeletonMs - elapsed);
    const t = setTimeout(() => {
      setShowSkeleton(false);
      skeletonStartRef.current = null;
    }, remaining);
    return () => clearTimeout(t);
  }, [navigation.state, location.pathname, children]);

  

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
          <PrivateFrame>
            {showSkeleton ? (
              <div aria-hidden>
                {/* Skeleton layout that mirrors common content structure */}
                <div style={{ padding: 12 }}>
                  <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 12 }}>
                    <SkeletonAvatar />
                    <div style={{ flex: 1 }}>
                      <SkeletonRow style={{ width: "40%" }} />
                      <SkeletonRow style={{ width: "60%" }} />
                    </div>
                  </div>

                  <SkeletonList>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                        <div style={{ flex: 1 }}>
                          <SkeletonRow style={{ width: "80%" }} />
                          <SkeletonRow style={{ width: "60%" }} />
                        </div>
                        <div style={{ width: 120 }}>
                          <SkeletonRow style={{ height: 48, borderRadius: 8 }} />
                        </div>
                      </div>
                    ))}
                  </SkeletonList>
                </div>
              </div>
            ) : (
              children ?? <Outlet />
            )}
          </PrivateFrame>
        </div>
      </ContentShell>

      <AppFooter />
    </PrivatePageShell>
  );
}
