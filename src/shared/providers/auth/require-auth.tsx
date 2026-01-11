import React, { useEffect, useState } from "react";
import { Navigate, useLocation, Outlet } from "react-router-dom";
import { usersAuthService } from "@modules/users/services/auth.service";

type Props = {
  children?: React.ReactNode;
};

export default function RequireAuth({ children }: Props) {
  const [session, setSession] = useState(() => usersAuthService.getSessionValue());
  const location = useLocation();

  useEffect(() => {
    const sub = usersAuthService.getSession$().subscribe((s) => setSession(s));
    return () => sub.unsubscribe();
  }, []);

  if (session) return (children ?? <Outlet />);

  return <Navigate to="/login" state={{ from: location.pathname }} replace />;
}
