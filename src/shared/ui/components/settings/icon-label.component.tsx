import React from "react";
import { Space } from "antd";

type IconLabelProps = {
  icon: React.ReactNode;
  text: React.ReactNode;
  gap?: number;
};

export function IconLabel({ icon, text, gap = 6 }: IconLabelProps): React.ReactElement {
  return (
    <Space size={gap}>
      <span style={{ display: "inline-flex", alignItems: "center" }}>{icon}</span>
      <span>{text}</span>
    </Space>
  );
}

export default IconLabel;
