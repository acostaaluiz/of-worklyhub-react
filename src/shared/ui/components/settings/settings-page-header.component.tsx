import React from "react";
import { Typography } from "antd";
import {
  HeaderCopy,
  HeaderIcon,
  HeaderMain,
  HeaderMeta,
  HeaderShell,
} from "./settings-page-header.component.styles";

type SettingsPageHeaderProps = {
  icon: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  meta?: React.ReactNode;
};

export function SettingsPageHeader({
  icon,
  title,
  description,
  meta,
}: SettingsPageHeaderProps): React.ReactElement {
  const titleNode =
    typeof title === "string" ? (
      <Typography.Title level={2} style={{ margin: 0 }}>
        {title}
      </Typography.Title>
    ) : (
      title
    );

  const descriptionNode =
    typeof description === "string" ? (
      <Typography.Text type="secondary">{description}</Typography.Text>
    ) : (
      description
    );

  return (
    <HeaderShell>
      <HeaderMain>
        <HeaderIcon>{icon}</HeaderIcon>
        <HeaderCopy>
          {titleNode}
          {descriptionNode}
        </HeaderCopy>
      </HeaderMain>

      {meta ? <HeaderMeta>{meta}</HeaderMeta> : null}
    </HeaderShell>
  );
}

export default SettingsPageHeader;
