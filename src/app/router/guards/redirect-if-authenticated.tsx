import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { usersAuthService } from "@modules/users/services/auth.service";
import { usersService } from "@modules/users/services/user.service";
import { usersOverviewService } from "@modules/users/services/overview.service";
import { companyService } from "@modules/company/services/company.service";
import { isActivePlan } from "@modules/users/services/plan-status";

type SessionLike = {
  email?: string;
  claims?: {
    email?: string;
  } | null;
} | null;

function resolveSessionEmail(session: SessionLike): string | undefined {
  const fromSession = session?.email;
  if (typeof fromSession === "string" && fromSession.trim().length > 0) {
    return fromSession.trim();
  }

  const fromClaims = session?.claims?.email;
  if (typeof fromClaims === "string" && fromClaims.trim().length > 0) {
    return fromClaims.trim();
  }

  return undefined;
}

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
    const run = async () => {
      if (!session) return;
      if (!cancelled) {
        setRedirectReady(false);
        setHasWorkspace(null);
        setHasActivePlan(null);
      }

      let resolvedProfile = usersOverviewService.getOverviewValue()?.profile ?? null;
      let resolvedEmail = resolveSessionEmail(session as SessionLike) ?? resolvedProfile?.email;
      let fetchedOverviewPromise: Promise<Awaited<ReturnType<typeof usersOverviewService.fetchOverview>>> | null = null;

      const fetchOverviewOnce = async () => {
        if (!fetchedOverviewPromise) {
          fetchedOverviewPromise = usersOverviewService.fetchOverview(true);
        }
        return fetchedOverviewPromise;
      };

      if (!resolvedEmail) {
        try {
          const overview = await fetchOverviewOnce();
          if (overview?.profile) {
            resolvedProfile = overview.profile;
            resolvedEmail = overview.profile.email ?? resolvedEmail;
          }
        } catch {
          // keep unresolved email/profile when overview request fails
        }
      }

      let workspaceExists = companyService.getWorkspaceValue() ? true : false;
      if (resolvedEmail && !workspaceExists) {
        try {
          const workspace = await companyService.fetchWorkspaceByEmail(resolvedEmail);
          workspaceExists = workspace ? true : false;
        } catch {
          workspaceExists = companyService.getWorkspaceValue() ? true : false;
        }
      }

      if (!cancelled) setHasWorkspace(workspaceExists);

      if (!workspaceExists) {
        if (!cancelled) setHasActivePlan(false);
        if (!cancelled) setRedirectReady(true);
        return;
      }

      if (!resolvedProfile) {
        try {
          const overview = await fetchOverviewOnce();
          if (overview?.profile) {
            resolvedProfile = overview.profile;
            resolvedEmail = overview.profile.email ?? resolvedEmail;
          }
        } catch {
          // keep cached profile when overview request fails
        }
      }

      if (resolvedProfile && !isActivePlan(resolvedProfile)) {
        try {
          const refreshed = await fetchOverviewOnce();
          if (refreshed?.profile) {
            resolvedProfile = refreshed.profile;
            resolvedEmail = refreshed.profile.email ?? resolvedEmail;
          }
        } catch {
          // keep resolved profile when forced refresh fails
        }
      }

      if (!resolvedProfile && resolvedEmail) {
        try {
          resolvedProfile = await usersService.fetchByEmail(resolvedEmail);
        } catch {
          // keep unresolved profile when user endpoint fails
        }
      }

      const activePlan = isActivePlan(resolvedProfile);
      if (!cancelled) setHasActivePlan(activePlan);
      if (!cancelled) setRedirectReady(true);
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [session]);

  if (session) {
    if (!redirectReady) return null;
    if (hasWorkspace === false) {
      return <Navigate to="/company/introduction" state={{ from: location.pathname }} replace />;
    }
    if (hasActivePlan === false) {
      return <Navigate to="/billing/plans" state={{ from: location.pathname }} replace />;
    }
    return <Navigate to="/home" state={{ from: location.pathname }} replace />;
  }

  return <Outlet />;
}

