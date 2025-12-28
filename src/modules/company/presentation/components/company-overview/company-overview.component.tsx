import React from "react";
import { Typography, Tag, Space } from "antd";
import type { CompanyProfileModel } from "@modules/company/interfaces/company.model";
import {
  OverviewShell,
  HeroImage,
  InfoRow,
  MetaRow,
  AvatarWrap,
} from "./company-overview.component.styles";

type Props = {
  profile: CompanyProfileModel;
};

export function CompanyOverview({ profile }: Props) {
  return (
    <OverviewShell className="surface">
      <HeroImage style={{ backgroundImage: `url(${profile.imageUrl})` }} />

      <InfoRow>
        <div style={{ flex: 1 }}>
          <Typography.Title level={3} style={{ margin: 0 }}>
            {profile.name}
          </Typography.Title>
          <MetaRow>
            <Typography.Text type="secondary">{profile.address}</Typography.Text>
          </MetaRow>
          <div style={{ marginTop: 8 }}>{profile.description}</div>
        </div>

        <div>
          <Space direction="vertical" align="end">
            <div>
              <Tag color="gold">Destaque</Tag>
            </div>
            <AvatarWrap>{/* eventualmente avatar/logo */}</AvatarWrap>
          </Space>
        </div>
      </InfoRow>
    </OverviewShell>
  );
}

export default CompanyOverview;
