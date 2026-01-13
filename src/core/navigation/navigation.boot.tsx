import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { setNavigator } from "./navigation.service";

export function NavigationBoot() {
  const nav = useNavigate();

  useEffect(() => {
    setNavigator((to, opts) => {
      if (opts?.replace) nav(to, { replace: true, state: opts.state });
      else nav(to, { state: opts?.state });
    });
    return () => setNavigator(() => {});
  }, [nav]);

  return <Outlet />;
}

export default NavigationBoot;
