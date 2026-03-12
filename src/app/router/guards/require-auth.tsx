import React, { useEffect, useState } from "react";
import { Navigate, useLocation, Outlet } from "react-router-dom";
import { usersAuthService } from "@modules/users/services/auth.service";
import { usersOverviewService } from "@modules/users/services/overview.service";
import {
  canAccessPath,
  getEnabledModuleKeys,
  isAlwaysAllowedPrivatePath,
} from "@modules/users/services/module-access";
import { isActivePlan } from "@modules/users/services/plan-status";

type Props = {
  children?: React.ReactNode;
};

export default function RequireAuth({ children }: Props) {
  const [session, setSession] = useState(() => usersAuthService.getSessionValue());
  const [hasActivePlan, setHasActivePlan] = useState<boolean>(() => {
    const existing = usersOverviewService.getOverviewValue();
    return isActivePlan(existing?.profile);
  });
  const [isPlanResolved, setIsPlanResolved] = useState<boolean>(() => {
    const existing = usersOverviewService.getOverviewValue();
    return existing != null;
  });
  const [enabledModules, setEnabledModules] = useState<Set<string>>(() => {
    const existing = usersOverviewService.getOverviewValue();
    return getEnabledModuleKeys(existing?.modules);
  });
  const [isOverviewReady, setIsOverviewReady] = useState<boolean>(() => {
    const existing = usersOverviewService.getOverviewValue();
    return existing != null;
  });
  const location = useLocation();
  const sessionEmail = session?.email ?? null;

  useEffect(() => {
    const sub = usersAuthService.getSession$().subscribe((s) => setSession(s));
    return () => sub.unsubscribe();
  }, []);

  useEffect(() => {
    const sub = usersOverviewService.getOverview$().subscribe((overview) => {
      if (!overview) return;
      setHasActivePlan(isActivePlan(overview.profile));
      setIsPlanResolved(true);
      setEnabledModules(getEnabledModuleKeys(overview.modules));
      setIsOverviewReady(true);
    });
    return () => sub.unsubscribe();
  }, []);

  useEffect(() => {
    if (!sessionEmail) return;

    const cached = usersOverviewService.getOverviewValue();

    let active = true;

    usersOverviewService
      .fetchOverview(true)
      .then((overview) => {
        if (!active) return;
        setHasActivePlan(isActivePlan(overview?.profile));
        setIsPlanResolved(true);
        setEnabledModules(getEnabledModuleKeys(overview?.modules));
        setIsOverviewReady(true);
      })
      .catch(() => {
        if (!active) return;
        if (!cached) setIsPlanResolved(true);
        if (!cached) setIsOverviewReady(true);
      });

    return () => {
      active = false;
    };
  }, [sessionEmail]);

  if (!session) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  const isBillingPath = location.pathname.startsWith("/billing");
  if (!isBillingPath) {
    if (!isPlanResolved) return null;
    if (!hasActivePlan) {
      return <Navigate to="/billing/plans" state={{ from: location.pathname }} replace />;
    }
  }

  if (!isAlwaysAllowedPrivatePath(location.pathname)) {
    if (!isOverviewReady) return null;
    if (!canAccessPath(location.pathname, enabledModules)) {
      return <Navigate to="/modules" state={{ from: location.pathname }} replace />;
    }
  }

  return children ?? <Outlet />;
}
