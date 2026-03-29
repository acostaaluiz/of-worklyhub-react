import React from "react";
import { Card } from "antd";
import type { CardProps } from "antd";
import styled from "styled-components";

const BASE_STYLE: React.CSSProperties = {
  border: "1px solid color-mix(in srgb, var(--color-primary) 18%, var(--color-border))",
  background:
    "linear-gradient(140deg, color-mix(in srgb, var(--color-surface-2) 72%, transparent), var(--color-surface))",
  boxShadow: "var(--shadow-sm)",
};

const ResponsiveSettingsCard = styled(Card)`
  @media (max-width: 768px) {
    .ant-space-item > .ant-form-item,
    .ant-form-item {
      min-width: 100% !important;
      width: 100% !important;
      flex: 1 1 100% !important;
    }

    .ant-tabs-nav {
      margin-bottom: var(--space-3);
    }
  }
`;

export function SettingsSurfaceCard({ style, bordered, ...rest }: CardProps): React.ReactElement {
  return (
    <ResponsiveSettingsCard
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
