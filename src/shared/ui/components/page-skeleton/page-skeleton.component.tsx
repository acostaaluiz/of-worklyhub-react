import React from "react";
import { Skeleton, Card } from "antd";

type Props = {
  headerRows?: number;
  mainRows?: number;
  sideRows?: number;
  height?: string | number;
};

export const PageSkeleton: React.FC<Props> = ({ headerRows = 1, mainRows = 6, sideRows = 4, height = '85vh' }) => {
  const heightValue = typeof height === 'number' ? `${height}px` : height;
  return (
    <div style={{ padding: 12, width: '100%', height: heightValue, boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 12 }}>
        <div style={{ width: 56, height: 56, background: "var(--surface)", borderRadius: 8 }} />
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: 8 }}>
            <Skeleton active paragraph={{ rows: headerRows }} title={false} />
          </div>
          <Skeleton active paragraph={{ rows: headerRows }} title={false} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12, flex: 1 }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Card className="surface" style={{ border: "none", flex: 1 }}>
            <div style={{ height: '100%' }}>
              <Skeleton active paragraph={{ rows: mainRows }} title={false} />
            </div>
          </Card>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Card className="surface" style={{ border: "none", flex: 1 }}>
            <div style={{ height: '100%' }}>
              <Skeleton active paragraph={{ rows: sideRows }} title={false} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PageSkeleton;
