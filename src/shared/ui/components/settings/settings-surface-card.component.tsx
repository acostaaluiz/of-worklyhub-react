import React from "react";
import { Card } from "antd";
import type { CardProps } from "antd";

const BASE_STYLE: React.CSSProperties = {
  border: "1px solid color-mix(in srgb, var(--color-primary) 18%, var(--color-border))",
  background:
    "linear-gradient(140deg, color-mix(in srgb, var(--color-surface-2) 72%, transparent), var(--color-surface))",
  boxShadow: "var(--shadow-sm)",
};

export function SettingsSurfaceCard({ style, bordered, ...rest }: CardProps): React.ReactElement {
  return (
    <Card
      {...rest}
      bordered={bordered ?? false}
      style={{
        ...BASE_STYLE,
        ...(style ?? {}),
      }}
    />
  );
}

export default SettingsSurfaceCard;
