import React from "react";
import { BaseTemplate } from "@shared/base/base.template";
import { Tabs, Row, Col, Avatar, Button, Form, Input, Radio, InputNumber, Select, Tooltip } from "antd";
import styled, { keyframes } from "styled-components";
import type { ApplicationCategoryItem, ApplicationIndustryItem } from "@core/application/application-api";

const { TabPane } = Tabs;

const AvatarWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
`;

const shimmer = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

const SkeletonBlock = styled.div<{ $width?: string; $height: number; $radius?: number }>`
  width: ${({ $width }) => $width ?? "100%"};
  height: ${({ $height }) => `${$height}px`};
  border-radius: ${({ $radius }) => ($radius != null ? `${$radius}px` : "8px")};
  background: var(--color-surface-2);
  position: relative;
  overflow: hidden;

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    transform: translateX(-100%);
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.08) 50%,
      rgba(255, 255, 255, 0) 100%
    );
    animation: ${shimmer} 1.2s ease-in-out infinite;
  }
`;

const WallpaperFrame = styled.div`
  margin-bottom: 12px;
  border-radius: 8px;
  overflow: hidden;
  height: 160px;
  width: 100%;
  background: var(--color-surface-2);
`;

const WallpaperImage = styled.div<{ $imageUrl: string }>`
  height: 100%;
  background-size: cover;
  background-position: center;
  background-image: url(${({ $imageUrl }) => $imageUrl});
`;

export type PersonalModel = {
  fullName: string;
  email: string;
  phone?: string;
  photoUrl?: string;
  planId?: number;
  planName?: string;
  planPrice?: string;
};

export type CompanyModel = {
  accountType: "individual" | "company";
  legalName?: string;
  employees?: number;
  primaryService?: string;
  industry?: string;
  description?: string;
  tradeName?: string;
  wallpaperUrl?: string;
};

export type ProfileTemplateProps = {
  personal: PersonalModel;
  company?: CompanyModel;
  categories?: ApplicationCategoryItem[];
  industries?: ApplicationIndustryItem[];
  isAvatarLoading?: boolean;
  isWallpaperLoading?: boolean;
  isSavingPersonal?: boolean;
  isSavingCompany?: boolean;
  onOpenAvatar: () => void;
  onOpenWallpaper?: () => void;
  onSavePersonal: (values: PersonalModel) => void;
  onSaveCompany: (values: CompanyModel) => void;
};

const FormStackStyle: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 12 };
const fallbackIndustryOptions: { value: string; label: string }[] = [
  { value: "health", label: "Health" },
  { value: "finance", label: "Finance" },
  { value: "retail", label: "Retail" },
  { value: "education", label: "Education" },
  { value: "services", label: "Services" },
  { value: "other", label: "Other" },
];

const CompanyColumns = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ColumnStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const ProfileTemplate: React.FC<ProfileTemplateProps> = ({
  personal,
  company,
  categories,
  industries,
  isAvatarLoading,
  isWallpaperLoading,
  onOpenAvatar,
  onOpenWallpaper,
  onSavePersonal,
  onSaveCompany,
  isSavingPersonal,
  isSavingCompany,
}) => {
  const [personalForm] = Form.useForm();
  const [companyForm] = Form.useForm();
  const serviceOptions = React.useMemo(() => {
    const base = (categories ?? []).map((c) => ({ value: c.uid, label: c.name }));
    const current = company?.primaryService;
    if (current && !base.some((opt) => opt.value === current)) {
      return [{ value: current, label: current }, ...base];
    }
    return base;
  }, [categories, company?.primaryService]);

  const industryOptions = React.useMemo(() => {
    const base = (industries && industries.length > 0)
      ? industries.map((i) => ({ value: i.uid, label: i.name }))
      : fallbackIndustryOptions;
    const current = company?.industry;
    if (current && !base.some((opt) => opt.value === current)) {
      return [{ value: current, label: current }, ...base];
    }
    return base;
  }, [industries, company?.industry]);

  React.useEffect(() => {
    // schedule update after render to avoid "not connected to any Form" warning
    Promise.resolve().then(() => {
      try {
        personalForm.setFieldsValue(personal ?? {});
      } catch {
        // ignore
      }
    });
  }, [personal, personalForm]);

  React.useEffect(() => {
    // always set company form values (use sensible defaults) so fields render filled when possible
    const defaults = { accountType: "individual" } as Partial<import(".").CompanyModel>;
    Promise.resolve().then(() => {
      try {
        companyForm.setFieldsValue(company ?? defaults);
      } catch {
        // ignore
      }
    });
  }, [company, companyForm]);

  const content = (
    <Row gutter={24} style={{ marginTop: 8 }}>
      <Col xs={24} md={8}>
        <AvatarWrap>
          {isAvatarLoading ? (
            <SkeletonBlock $width="120px" $height={120} $radius={60} />
          ) : (
            <Avatar size={120} src={personal?.photoUrl} />
          )}
          <div style={{ textAlign: "center" }}>
            <div style={{ fontWeight: 600 }}>{personal?.fullName}</div>
            <div style={{ color: "var(--color-text-muted)", fontSize: 14 }}>{personal?.email}</div>
          </div>
          <div style={{ textAlign: "center", marginTop: 8 }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{personal?.planName ?? "No plan"}</div>
            {personal?.planPrice ? <div style={{ color: "var(--color-text-muted)", fontSize: 13 }}>{personal.planPrice}</div> : null}
          </div>
          <Button type="default" onClick={onOpenAvatar}>Change photo</Button>
        </AvatarWrap>
      </Col>
      <Col xs={24} md={16}>
        {isWallpaperLoading || company?.wallpaperUrl ? (
          <WallpaperFrame>
            {isWallpaperLoading ? (
              <SkeletonBlock $height={160} />
            ) : (
              <WallpaperImage $imageUrl={company?.wallpaperUrl ?? ""} />
            )}
          </WallpaperFrame>
        ) : null}
        <Tabs defaultActiveKey="personal">
          <TabPane tab="Personal info" key="personal">
            <Form form={personalForm} initialValues={personal} layout="vertical" style={FormStackStyle} onFinish={(v) => onSavePersonal(v as PersonalModel)}>
              <Form.Item name="fullName" label="Full name" rules={[{ required: true, message: "Please enter your full name" }]}>
                <Input placeholder="Full name" />
              </Form.Item>
              <Form.Item name="email" label="Email">
                <Input disabled />
              </Form.Item>
              <Form.Item
                name="phone"
                label={
                  <span>
                    Phone{" "}
                    <Tooltip title="Include country code (e.g. +55 11 99999-9999)">
                      <span style={{ marginLeft: 6, cursor: "help", color: "var(--color-text-muted)" }}>?</span>
                    </Tooltip>
                  </span>
                }
              >
                <Input placeholder="Phone" />
              </Form.Item>
              <Form.Item>
                <Tooltip title="Save your personal profile changes">
                  <span>
                    <Button type="primary" htmlType="submit" loading={isSavingPersonal}>Save personal</Button>
                  </span>
                </Tooltip>
              </Form.Item>
            </Form>
          </TabPane>

          <TabPane tab="Company info" key="company" forceRender>
            <Form form={companyForm} initialValues={company ?? { accountType: "individual" }} layout="vertical" style={FormStackStyle} onFinish={(v) => onSaveCompany(v as CompanyModel)}>
              <CompanyColumns>
                <ColumnStack>
                  <Form.Item name="accountType" label="Account type">
                    <Radio.Group>
                      <Radio value="individual">Individual</Radio>
                      <Radio value="company">Company</Radio>
                    </Radio.Group>
                  </Form.Item>

                  <Form.Item
                    name="legalName"
                    label={
                      <span>
                        Legal name{" "}
                        <Tooltip title="Official registered company name">
                          <span style={{ marginLeft: 6, cursor: "help", color: "var(--color-text-muted)" }}>?</span>
                        </Tooltip>
                      </span>
                    }
                  >
                    <Input placeholder="Legal name" />
                  </Form.Item>

                  <Form.Item name="tradeName" label="Trade name">
                    <Input placeholder="Trade name" />
                  </Form.Item>

                  <Form.Item name="employees" label="Employees">
                    <InputNumber style={{ width: 160 }} min={0} />
                  </Form.Item>
                </ColumnStack>

                <ColumnStack>
                  <Form.Item name="primaryService" label="Primary service">
                    <Select placeholder="Select primary service" options={serviceOptions} />
                  </Form.Item>

                  <Form.Item name="industry" label="Industry">
                    <Select placeholder="Select an industry" options={industryOptions} />
                  </Form.Item>

                  <Form.Item name="description" label="Description">
                    <Input.TextArea rows={4} />
                  </Form.Item>
                </ColumnStack>
              </CompanyColumns>

              <Form.Item>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <Tooltip title="Upload a new company wallpaper">
                    <span>
                      <Button type="default" onClick={onOpenWallpaper}>Change wallpaper</Button>
                    </span>
                  </Tooltip>
                  <Tooltip title="Save your company profile changes">
                    <span>
                      <Button type="primary" htmlType="submit" loading={isSavingCompany}>Save company</Button>
                    </span>
                  </Tooltip>
                </div>
              </Form.Item>
            </Form>
          </TabPane>
        </Tabs>
      </Col>
    </Row>
  );

  return <BaseTemplate content={content} />;
};

export default ProfileTemplate;

