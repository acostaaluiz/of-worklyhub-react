import { type PropsWithChildren, useEffect, useRef, useState } from "react";
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

const DEFAULT_NOTIFICATIONS_POLLING_INTERVAL_MS = 90000;
const MIN_NOTIFICATIONS_POLLING_INTERVAL_MS = 15000;

function resolveNotificationsPollingIntervalMs(): number {
  const runtimeEnv = (globalThis as { __WORKLYHUB_RUNTIME_ENV__?: Record<string, string | undefined> })
    .__WORKLYHUB_RUNTIME_ENV__;
  const raw =
    runtimeEnv?.VITE_NOTIFICATIONS_POLLING_INTERVAL_MS ??
    (import.meta.env.VITE_NOTIFICATIONS_POLLING_INTERVAL_MS as string | undefined);
  const parsed = Number(raw);

  if (!Number.isFinite(parsed) || parsed < MIN_NOTIFICATIONS_POLLING_INTERVAL_MS) {
    return DEFAULT_NOTIFICATIONS_POLLING_INTERVAL_MS;
  }

  return Math.floor(parsed);
}

const NOTIFICATIONS_POLLING_INTERVAL_MS = resolveNotificationsPollingIntervalMs();

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
  const notificationRefreshInFlightRef = useRef(false);

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
      if (document.visibilityState === "hidden") return;
      if (notificationRefreshInFlightRef.current) return;
      notificationRefreshInFlightRef.current = true;

      try {
        await usersNotificationsService.fetchSummary({ workspaceId });
      } catch {
        if (!isMounted) return;
      } finally {
        notificationRefreshInFlightRef.current = false;
      }
    };

    void refresh();
    const timer = window.setInterval(() => void refresh(), NOTIFICATIONS_POLLING_INTERVAL_MS);
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void refresh();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isMounted = false;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
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
