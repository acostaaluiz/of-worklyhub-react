import React from "react";
import { Space, Tag } from "antd";
import {
  getSettingsSourceTagColor,
  getSettingsSourceText,
  type SettingsSource,
} from "./settings-source.helpers";

type SettingsSourceTagsProps = {
  source: SettingsSource;
  updatedAt?: string;
  formatUpdatedAt?: (value: string) => string;
  updatedPrefix?: string;
  emptyLabel?: string;
};

export function SettingsSourceTags({
  source,
  updatedAt,
  formatUpdatedAt,
  updatedPrefix = "Updated",
  emptyLabel = "Not saved yet",
}: SettingsSourceTagsProps): React.ReactElement {
  const updatedLabel = updatedAt
    ? `${updatedPrefix} ${formatUpdatedAt ? formatUpdatedAt(updatedAt) : updatedAt}`
    : emptyLabel;

  return (
    <Space size={8}>
      <Tag color={getSettingsSourceTagColor(source)}>{getSettingsSourceText(source)}</Tag>
      <Tag>{updatedLabel}</Tag>
    </Space>
  );
}

export default SettingsSourceTags;
