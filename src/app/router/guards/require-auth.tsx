import React, { useEffect, useState } from "react";
import { Navigate, useLocation, Outlet } from "react-router-dom";
import { usersAuthService } from "@modules/users/services/auth.service";
import { usersOverviewService } from "@modules/users/services/overview.service";
import { companyService } from "@modules/company/services/company.service";
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
  const [hasWorkspace, setHasWorkspace] = useState<boolean>(() => {
    return companyService.getWorkspaceValue() != null;
  });
  const [isWorkspaceResolved, setIsWorkspaceResolved] = useState<boolean>(() => {
    return companyService.getWorkspaceValue() != null;
  });
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
    const sub = companyService.getWorkspace$().subscribe((workspace) => {
      setHasWorkspace(workspace != null);
      setIsWorkspaceResolved(true);
    });
    return () => sub.unsubscribe();
  }, []);

  useEffect(() => {
    const sessionEmail = session?.email;
    let active = true;

    const resolveWorkspace = async () => {
      if (!sessionEmail) return;
      if (!active) return;
      setIsWorkspaceResolved(false);

      const cachedWorkspace = companyService.getWorkspaceValue();
      if (cachedWorkspace != null) {
        if (!active) return;
        setHasWorkspace(true);
        setIsWorkspaceResolved(true);
        return;
      }

      try {
        const workspace = await companyService.fetchWorkspaceByEmail(sessionEmail);
        if (!active) return;
        setHasWorkspace(Boolean(workspace));
      } catch {
        if (!active) return;
        setHasWorkspace(companyService.getWorkspaceValue() != null);
      } finally {
        if (active) {
          setIsWorkspaceResolved(true);
        }
      }
    };

    void resolveWorkspace();

    return () => {
      active = false;
    };
  }, [session?.email]);

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
    if (!sessionEmail || !hasWorkspace) return;

    const cached = usersOverviewService.getOverviewValue();

    let active = true;
    const shouldForceRefresh = hasActivePlan === false;

    usersOverviewService
      .fetchOverview(shouldForceRefresh)
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
  }, [sessionEmail, hasWorkspace, hasActivePlan]);

  if (!session) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (!isWorkspaceResolved) return null;

  const isCompanySetupPath = location.pathname.startsWith("/company/introduction");
  if (!hasWorkspace) {
    if (!isCompanySetupPath) {
      return <Navigate to="/company/introduction" state={{ from: location.pathname }} replace />;
    }
    return children ?? <Outlet />;
  }

  const isBillingPath = location.pathname.startsWith("/billing");
  if (!isBillingPath && !isCompanySetupPath) {
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
