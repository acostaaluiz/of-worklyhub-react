import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { usersAuthService } from "@modules/users/services/auth.service";

export default function RedirectIfAuthenticated() {
  const [session, setSession] = useState(() => usersAuthService.getSessionValue());
  const location = useLocation();

  useEffect(() => {
    const sub = usersAuthService.getSession$().subscribe((s) => setSession(s));
    return () => sub.unsubscribe();
  }, []);

  if (session) return <Navigate to="/home" state={{ from: location.pathname }} replace />;

  return <Outlet />;
}
