import React from "react";
import { Card, Typography, Avatar } from "antd";
import type { UserSession } from "@modules/users/services/auth.service";

type Props = {
  session: UserSession;
};

export default function ProfileInfo({ session }: Props) {
  if (!session) {
    return (
      <Card>
        <Typography.Title level={4}>No session</Typography.Title>
        <Typography.Text type="secondary">Not signed in</Typography.Text>
      </Card>
    );
  }

  return (
    <Card>
      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <Avatar size={64}>{String((session.uid ?? "").charAt(0)).toUpperCase()}</Avatar>
        <div>
          <Typography.Title level={4}>{session.uid}</Typography.Title>
          <Typography.Paragraph style={{ margin: 0 }}>
            <strong>Claims:</strong>
          </Typography.Paragraph>
          <pre style={{ margin: 0, whiteSpace: "pre-wrap", fontSize: 12 }}>{JSON.stringify(session.claims ?? {}, null, 2)}</pre>
        </div>
      </div>
    </Card>
  );
}
