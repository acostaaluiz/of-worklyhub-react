import React from "react";
import { Tabs, Avatar, Button, Form, Input, Radio, InputNumber, Select, Tooltip } from "antd";
import { AppstoreOutlined, BankOutlined, FileTextOutlined, IdcardOutlined, MailOutlined, PhoneOutlined, ShopOutlined, TagsOutlined, TeamOutlined, UserOutlined } from "@ant-design/icons";
import styled, { keyframes } from "styled-components";
import type { ApplicationCategoryItem, ApplicationIndustryItem } from "@core/application/application-api";
import { maskPhone } from "@core/utils/mask";
import { BaseTemplate } from "@shared/base/base.template";

const { TabPane } = Tabs;

const ProfileShell = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  height: 100%;
  min-height: 0;
  overflow: hidden;
`;

const CardBase = styled.div`
  background: var(--color-glass-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
`;

const MainCard = styled(CardBase)`
  flex: 1;
  min-height: 0;
  overflow: hidden;
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  background:
    radial-gradient(circle at 14% 12%, rgba(30, 112, 255, 0.16), transparent 45%),
    radial-gradient(circle at 86% 88%, rgba(0, 214, 160, 0.14), transparent 48%),
    var(--color-glass-surface);

  @media (max-width: 768px) {
    padding: var(--space-3);
  }
`;

const AvatarShell = styled.div`
  padding: 4px;
  border-radius: 999px;
  background: linear-gradient(135deg, var(--color-surface-2), var(--color-surface));
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
`;

const ProfileName = styled.div`
  font-weight: 600;
  font-size: var(--font-size-lg);
`;

const ProfileMeta = styled.div`
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
`;

const PlanBadge = styled.div`
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const PlanName = styled.div`
  font-weight: 600;
  font-size: var(--font-size-sm);
`;

const PlanPrice = styled.div`
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
`;

const FieldLabel = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
`;

const LabelIcon = styled.span`
  display: inline-flex;
  align-items: center;
  color: var(--color-text-muted);
  font-size: 14px;
`;

const ActionButton = styled(Button)`
  height: 34px;
  border-radius: 999px;
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

const HeroFrame = styled.div`
  position: relative;
  border-radius: var(--radius-lg);
  overflow: hidden;
  min-height: 140px;
  width: 100%;
  background: linear-gradient(135deg, var(--color-surface-2), var(--color-surface));
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
  display: flex;
  align-items: flex-end;
`;

const HeroMedia = styled.div<{ $imageUrl: string }>`
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  background-image: url(${({ $imageUrl }) => $imageUrl});
`;

const HeroOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0) 0%,
    rgba(0, 0, 0, 0.35) 100%
  );
  pointer-events: none;
`;

const HeroSkeleton = styled(SkeletonBlock)`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 1;
  width: 100%;
  padding: var(--space-3);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  flex-wrap: wrap;

  @media (max-width: 768px) {
    padding: var(--space-3);
  }
`;

const HeroIdentity = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-wrap: wrap;
`;

const HeroMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const HeroActions = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
`;

const MainHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
`;

const MainTitle = styled.div`
  font-weight: 600;
  font-size: clamp(20px, 2.1vh, 30px);
`;

const MainSubtitle = styled.div`
  margin-top: 2px;
  color: var(--color-text-muted);
  font-size: clamp(12px, 1.25vh, 14px);
`;

const ProfileTabs = styled(Tabs)`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;

  .ant-tabs-nav {
    margin: var(--space-3) 0 var(--space-2);
  }

  .ant-tabs-nav::before {
    border-bottom: 1px solid var(--color-divider);
  }

  .ant-tabs-tab {
    padding: 8px 0;
    margin: 0 var(--space-4) 0 0;
    background: transparent;
    border: none;
    transition: color 160ms ease;
  }

  .ant-tabs-tab .ant-tabs-tab-btn {
    color: var(--color-text-muted);
    font-weight: 600;
  }

  .ant-tabs-tab:hover .ant-tabs-tab-btn {
    color: var(--color-text);
  }

  .ant-tabs-tab-active .ant-tabs-tab-btn {
    color: var(--color-primary);
  }

  .ant-tabs-ink-bar {
    height: 3px;
    border-radius: 999px;
    background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
  }

  .ant-tabs-content-holder {
    min-height: 0;
    overflow: auto;
    padding-right: 4px;
  }

  .ant-tabs-content,
  .ant-tabs-tabpane {
    min-height: 0;
  }

  .ant-form-item {
    margin-bottom: 10px;
  }
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
  defaultTab?: "personal" | "company";
  isAvatarLoading?: boolean;
  isWallpaperLoading?: boolean;
  isSavingPersonal?: boolean;
  isSavingCompany?: boolean;
  onOpenAvatar: () => void;
  onOpenWallpaper?: () => void;
  onSavePersonal: (values: PersonalModel) => void;
  onSaveCompany: (values: CompanyModel) => void;
};

const FormStackStyle: React.CSSProperties = { display: "flex", flexDirection: "column", gap: "var(--space-2)" };
const fallbackIndustryOptions: { value: string; label: string }[] = [
  { value: "health", label: "Health" },
  { value: "finance", label: "Finance" },
  { value: "retail", label: "Retail" },
  { value: "education", label: "Education" },
  { value: "services", label: "Services" },
  { value: "other", label: "Other" },
];

const CompanyGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-2) var(--space-3);

  @media (max-width: 1100px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }

  .span-full {
    grid-column: 1 / -1;
  }
`;

const FormActions = styled.div`
  display: flex;
  gap: var(--space-2);
  align-items: center;
  flex-wrap: wrap;
`;

const PersonalGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-2) var(--space-3);

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }

  .span-full {
    grid-column: 1 / -1;
  }
`;

const ProfileHighlights = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const HighlightCard = styled.div`
  border-radius: var(--radius-sm);
  border: 1px solid color-mix(in srgb, var(--color-primary) 18%, var(--color-border));
  background: color-mix(in srgb, var(--color-surface) 90%, transparent);
  padding: 8px 10px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const HighlightIcon = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: var(--color-surface-2);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--color-text-muted);
`;

const HighlightMeta = styled.div`
  min-width: 0;
`;

const HighlightLabel = styled.div`
  font-size: 11px;
  color: var(--color-text-muted);
`;

const HighlightValue = styled.div`
  margin-top: 1px;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const ProfileTemplate: React.FC<ProfileTemplateProps> = ({
  personal,
  company,
  categories,
  industries,
  defaultTab,
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
    // schedule update after render to avoid "not connected to DataMap Form" warning
    Promise.resolve().then(() => {
      try {
        const maskedPersonal = { ...personal, phone: maskPhone(personal?.phone) };
        personalForm.setFieldsValue(maskedPersonal ?? {});
      } catch {
        // ignore
      }
    });
  }, [personal, personalForm]);

  React.useEffect(() => {
    // always set company form values (use sensible defaults) so fields render filled when possible
    const defaults = { accountType: "individual" } as Partial<CompanyModel>;
    Promise.resolve().then(() => {
      try {
        companyForm.setFieldsValue(company ?? defaults);
      } catch {
        // ignore
      }
    });
  }, [company, companyForm]);

  const content = (
    <ProfileShell>
      <MainCard>
        <MainHeader>
          <div>
            <MainTitle>Profile settings</MainTitle>
            <MainSubtitle>Update your personal and company information.</MainSubtitle>
          </div>
        </MainHeader>

        <HeroFrame>
          {isWallpaperLoading ? <HeroSkeleton $height={180} /> : null}
          {!isWallpaperLoading && company?.wallpaperUrl ? (
            <HeroMedia $imageUrl={company?.wallpaperUrl ?? ""} />
          ) : null}
          <HeroOverlay />
          <HeroContent>
            <HeroIdentity>
              <AvatarShell>
                {isAvatarLoading ? (
                  <SkeletonBlock $width="80px" $height={80} $radius={40} />
                ) : (
                  <Avatar size={80} src={personal?.photoUrl} />
                )}
              </AvatarShell>
              <HeroMeta>
                <ProfileName>{personal?.fullName ?? "-"}</ProfileName>
                <ProfileMeta>{personal?.email}</ProfileMeta>
              </HeroMeta>
            </HeroIdentity>

            <HeroActions>
              <PlanBadge>
                <PlanName>{personal?.planName ?? "No plan"}</PlanName>
                {personal?.planPrice ? <PlanPrice>{personal.planPrice}</PlanPrice> : null}
              </PlanBadge>
              <ActionButton type="default" onClick={onOpenAvatar}>Change photo</ActionButton>
            </HeroActions>
          </HeroContent>
        </HeroFrame>

        <ProfileHighlights>
          <HighlightCard>
            <HighlightIcon><TagsOutlined /></HighlightIcon>
            <HighlightMeta>
              <HighlightLabel>Plan</HighlightLabel>
              <HighlightValue>{personal?.planName ?? "No plan"}</HighlightValue>
            </HighlightMeta>
          </HighlightCard>

          <HighlightCard>
            <HighlightIcon><IdcardOutlined /></HighlightIcon>
            <HighlightMeta>
              <HighlightLabel>Account type</HighlightLabel>
              <HighlightValue>{company?.accountType === "company" ? "Company" : "Individual"}</HighlightValue>
            </HighlightMeta>
          </HighlightCard>

          <HighlightCard>
            <HighlightIcon><TeamOutlined /></HighlightIcon>
            <HighlightMeta>
              <HighlightLabel>Employees</HighlightLabel>
              <HighlightValue>{company?.employees ?? 0}</HighlightValue>
            </HighlightMeta>
          </HighlightCard>
        </ProfileHighlights>

        <ProfileTabs defaultActiveKey={defaultTab ?? "personal"}>
            <TabPane tab="Personal info" key="personal">
              <Form form={personalForm} initialValues={{ ...personal, phone: maskPhone(personal?.phone) }} layout="vertical" style={FormStackStyle} onFinish={(v) => onSavePersonal(v as PersonalModel)}>
                <PersonalGrid>
                  <Form.Item
                    name="fullName"
                    label={
                      <FieldLabel>
                        <LabelIcon><UserOutlined /></LabelIcon>
                        Full name
                      </FieldLabel>
                    }
                    rules={[{ required: true, message: "Please enter your full name" }]}
                  >
                    <Input placeholder="Full name" />
                  </Form.Item>
                  <Form.Item
                    name="email"
                    label={
                      <FieldLabel>
                        <LabelIcon><MailOutlined /></LabelIcon>
                        Email
                      </FieldLabel>
                    }
                  >
                    <Input disabled />
                  </Form.Item>
                  <Form.Item
                    className="span-full"
                    name="phone"
                    label={
                      <FieldLabel>
                        <LabelIcon><PhoneOutlined /></LabelIcon>
                        Phone
                        <Tooltip title="Include country code (e.g. +55 11 99999-9999)">
                          <span style={{ marginLeft: 6, cursor: "help", color: "var(--color-text-muted)" }}>?</span>
                        </Tooltip>
                      </FieldLabel>
                    }
                  >
                    <Input
                      placeholder="Phone"
                      onBlur={(e) => {
                        try {
                          // apply mask on blur so the user can type freely while editing
                          personalForm.setFieldsValue({ phone: maskPhone(String(e.target.value ?? "")) });
                        } catch {
                          // ignore
                        }
                      }}
                    />
                  </Form.Item>
                </PersonalGrid>
                <Form.Item>
                  <FormActions>
                    <Tooltip title="Save your personal profile changes">
                      <span>
                        <Button type="primary" htmlType="submit" loading={isSavingPersonal}>Save personal</Button>
                      </span>
                    </Tooltip>
                  </FormActions>
                </Form.Item>
              </Form>
            </TabPane>

            <TabPane tab="Company info" key="company" forceRender>
              <Form form={companyForm} initialValues={company ?? { accountType: "individual" }} layout="vertical" style={FormStackStyle} onFinish={(v) => onSaveCompany(v as CompanyModel)}>
                <CompanyGrid>
                  <Form.Item
                    name="accountType"
                    label={
                      <FieldLabel>
                        <LabelIcon><IdcardOutlined /></LabelIcon>
                        Account type
                      </FieldLabel>
                    }
                  >
                    <Radio.Group>
                      <Radio value="individual">Individual</Radio>
                      <Radio value="company">Company</Radio>
                    </Radio.Group>
                  </Form.Item>

                  <Form.Item
                    name="employees"
                    label={
                      <FieldLabel>
                        <LabelIcon><TeamOutlined /></LabelIcon>
                        Employees
                      </FieldLabel>
                    }
                  >
                    <InputNumber style={{ width: "100%" }} min={0} />
                  </Form.Item>

                  <Form.Item
                    name="legalName"
                    label={
                      <FieldLabel>
                        <LabelIcon><BankOutlined /></LabelIcon>
                        Legal name
                        <Tooltip title="Official registered company name">
                          <span style={{ marginLeft: 6, cursor: "help", color: "var(--color-text-muted)" }}>?</span>
                        </Tooltip>
                      </FieldLabel>
                    }
                  >
                    <Input placeholder="Legal name" />
                  </Form.Item>

                  <Form.Item
                    name="tradeName"
                    label={
                      <FieldLabel>
                        <LabelIcon><ShopOutlined /></LabelIcon>
                        Trade name
                      </FieldLabel>
                    }
                  >
                    <Input placeholder="Trade name" />
                  </Form.Item>

                  <Form.Item
                    name="primaryService"
                    label={
                      <FieldLabel>
                        <LabelIcon><AppstoreOutlined /></LabelIcon>
                        Primary service
                      </FieldLabel>
                    }
                  >
                    <Select placeholder="Select primary service" options={serviceOptions} />
                  </Form.Item>

                  <Form.Item
                    name="industry"
                    label={
                      <FieldLabel>
                        <LabelIcon><TagsOutlined /></LabelIcon>
                        Industry
                      </FieldLabel>
                    }
                  >
                    <Select placeholder="Select an industry" options={industryOptions} />
                  </Form.Item>

                  <Form.Item
                    name="description"
                    label={
                      <FieldLabel>
                        <LabelIcon><FileTextOutlined /></LabelIcon>
                        Description
                      </FieldLabel>
                    }
                    className="span-full"
                  >
                    <Input.TextArea rows={2} />
                  </Form.Item>
                </CompanyGrid>

                <Form.Item>
                  <FormActions>
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
                  </FormActions>
                </Form.Item>
              </Form>
            </TabPane>
          </ProfileTabs>
        </MainCard>
    </ProfileShell>
  );

  return <BaseTemplate content={content} />;
};

export default ProfileTemplate;

