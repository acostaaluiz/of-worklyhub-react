import React, { useEffect, useState } from "react";
import { Spin } from "antd";
import { Subscription } from "rxjs";
import { loadingService } from "@shared/ui/services/loading.service";

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "rgba(0,0,0,0.35)",
  zIndex: 9999,
};

export const LoadingOverlay: React.FC = () => {
  const [visible, setVisible] = useState<boolean>(false);

  useEffect(() => {
    const sub: Subscription = loadingService.observable.subscribe((v) => setVisible(v));
    return () => sub.unsubscribe();
  }, []);

  if (!visible) return null;

  return (
    <div style={overlayStyle} aria-hidden={!visible}>
      <Spin size="large" />
    </div>
  );
};

export default LoadingOverlay;
