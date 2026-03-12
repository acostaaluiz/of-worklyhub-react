import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { usersAuthService } from "@modules/users/services/auth.service";
import { usersService } from "@modules/users/services/user.service";
import { companyService } from "@modules/company/services/company.service";
import { isActivePlan } from "@modules/users/services/plan-status";

export default function RedirectIfAuthenticated() {
  const [session, setSession] = useState(() => usersAuthService.getSessionValue());
  const [redirectReady, setRedirectReady] = useState(false);
  const [hasWorkspace, setHasWorkspace] = useState<boolean | null>(null);
  const [hasActivePlan, setHasActivePlan] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    const sub = usersAuthService.getSession$().subscribe((s) => setSession(s));
    return () => sub.unsubscribe();
  }, []);

  useEffect(() => {
    let cancelled = false;
    setRedirectReady(false);
    setHasWorkspace(null);
    setHasActivePlan(null);

    if (!session) {
      setRedirectReady(false);
      return () => {
        cancelled = true;
      };
    }

    const email = (session as { email?: string } | null)?.email as string | undefined;
    if (!email) {
      setHasActivePlan(false);
      setRedirectReady(true);
      return () => {
        cancelled = true;
      };
    }

    (async () => {
      try {
        const profile = await usersService.fetchByEmail(email);
        if (!cancelled) setHasActivePlan(isActivePlan(profile));
      } catch {
        if (!cancelled) setHasActivePlan(false);
      }

      try {
        const workspace = await companyService.fetchWorkspaceByEmail(email);
        if (!cancelled) setHasWorkspace(workspace ? true : false);
      } catch {
        if (!cancelled) setHasWorkspace(false);
      } finally {
        if (!cancelled) setRedirectReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [session]);

  if (session) {
    if (!redirectReady) return null;
    if (hasActivePlan === false) {
      return <Navigate to="/billing/plans" state={{ from: location.pathname }} replace />;
    }
    if (hasWorkspace === false) {
      return <Navigate to="/company/introduction" state={{ from: location.pathname }} replace />;
    }
    return <Navigate to="/home" state={{ from: location.pathname }} replace />;
  }

  return <Outlet />;
}

