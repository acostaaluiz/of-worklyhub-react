import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { usersAuthService } from "@modules/users/services/auth.service";
import { usersService } from "@modules/users/services/user.service";
import { companyService } from "@modules/company/services/company.service";

export default function RedirectIfAuthenticated() {
  const [session, setSession] = useState(() => usersAuthService.getSessionValue());
  const [redirectReady, setRedirectReady] = useState(false);
  const [hasWorkspace, setHasWorkspace] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    const sub = usersAuthService.getSession$().subscribe((s) => setSession(s));
    return () => sub.unsubscribe();
  }, []);

  useEffect(() => {
    let cancelled = false;
    setRedirectReady(false);

    if (!session) {
      // no session — nothing to load and no redirect
      setRedirectReady(false);
      return () => {
        cancelled = true;
      };
    }

    const email = (session as { email?: string } | null)?.email as string | undefined;
    if (!email) {
      // no email available, proceed immediately
      setRedirectReady(true);
      return () => {
        cancelled = true;
      };
    }

    (async () => {
      // fetch profile in background — do not await so redirect isn't blocked
      usersService.fetchByEmail(email).catch(() => {
        /* ignore errors */
      });

      try {
        const workspace = await companyService.fetchWorkspaceByEmail(email);
        if (!cancelled) {
          setHasWorkspace(workspace ? true : false);
        }
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
    if (!redirectReady) return null; // wait until profile and workspace check complete
    if (hasWorkspace === false) {
      return (
        <Navigate to="/company/introduction" state={{ from: location.pathname }} replace />
      );
    }
    return <Navigate to="/home" state={{ from: location.pathname }} replace />;
  }

  return <Outlet />;
}
