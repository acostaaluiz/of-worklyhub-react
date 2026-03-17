import { type PropsWithChildren, useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import type { MenuProps } from "antd";
import { LogoutOutlined, SettingOutlined, UserOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

import { companyService } from "@modules/company/services/company.service";
import { usersAuthService } from "@modules/users/services/auth.service";
import { usersNotificationsService } from "@modules/users/services/notifications.service";
import { AssistantChatWidget } from "@modules/users/presentation/components/assistant-chat/assistant-chat.widget";
import { AppFooter } from "@shared/ui/components/footer/footer.component";
import AppHeader from "./header.component";
import {
  ContentShell,
  PrivateFrame,
  PrivatePageShell,
} from "./private-frame.component.styles";


export function PrivateFrameLayout({ children }: PropsWithChildren) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const isNotificationsRoute = location.pathname.startsWith("/notifications");
  const isSettingsRoute = location.pathname.startsWith("/settings");
  const isCompanySetupRoute = location.pathname.startsWith("/company/introduction");

  const [hasWorkspace, setHasWorkspace] = useState<boolean>(() => {
    return !!companyService.getWorkspaceValue();
  });
  const [workspaceId, setWorkspaceId] = useState<string | undefined>(() => {
    const ws = companyService.getWorkspaceValue() as { workspaceId?: string; id?: string } | null;
    return (ws?.workspaceId ?? ws?.id ?? undefined) as string | undefined;
  });
  const [unreadNotifications, setUnreadNotifications] = useState<number>(() =>
    usersNotificationsService.getSummaryValue().unreadCount ?? 0
  );

  useEffect(() => {
    const sub = companyService.getWorkspace$().subscribe((w) => {
      setHasWorkspace(!!w);
      const current = w as { workspaceId?: string; id?: string } | null;
      setWorkspaceId((current?.workspaceId ?? current?.id ?? undefined) as string | undefined);
    });
    return () => sub.unsubscribe();
  }, []);

  useEffect(() => {
    const sub = usersNotificationsService
      .getSummary$()
      .subscribe((summary) => setUnreadNotifications(summary.unreadCount ?? 0));
    return () => sub.unsubscribe();
  }, []);

  useEffect(() => {
    if (!hasWorkspace || !workspaceId) {
      usersNotificationsService.resetSummary();
      return;
    }

    let isMounted = true;

    const refresh = async () => {
      try {
        await usersNotificationsService.fetchSummary({ workspaceId });
      } catch {
        if (!isMounted) return;
      }
    };

    void refresh();
    const timer = window.setInterval(() => void refresh(), 45000);

    return () => {
      isMounted = false;
      window.clearInterval(timer);
    };
  }, [hasWorkspace, workspaceId]);

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const handleUpgrade = () => navigate("/billing/plans");
  const handleNotifications = () => navigate("/notifications");

  const handleLogout = async () => {
    await usersAuthService.signOut();
    navigate("/login");
  };

  const menuItems: MenuProps["items"] = [
    // Show Company setup only when user does NOT have a workspace yet
    ...(hasWorkspace ? [] : [{ key: "/company/introduction", label: t("layout.header.menu.companySetup") }]),
    { key: "/billing/landing", label: t("layout.header.menu.billing") },
    { key: "/users", label: t("layout.header.menu.users") },
  ];

  const userMenuItems: MenuProps["items"] = [
    { key: "/users", label: t("layout.header.userMenu.profile"), icon: <UserOutlined /> },
    { key: "/settings", label: t("layout.header.userMenu.settings"), icon: <SettingOutlined /> },
    { type: "divider" as const },
    { key: "logout", label: t("layout.header.userMenu.signOut"), icon: <LogoutOutlined /> },
  ];

  const frameClassName = [
    isNotificationsRoute ? "compact-frame" : null,
    isSettingsRoute || isCompanySetupRoute ? "no-page-scroll" : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <PrivatePageShell>
      <AppHeader
        menuItems={menuItems}
        userMenuItems={userMenuItems}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        onUpgrade={handleUpgrade}
        onNotificationsClick={handleNotifications}
        unreadNotifications={unreadNotifications}
        selectedPath={location.pathname}
      />

      <ContentShell>
        <div className="container">
          <PrivateFrame className={frameClassName || undefined}>
            {children ?? <Outlet />}
          </PrivateFrame>
        </div>
      </ContentShell>

      <AssistantChatWidget />

      <AppFooter />
    </PrivatePageShell>
  );
}
