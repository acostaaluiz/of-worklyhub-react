import React from "react";
import { Tabs, Avatar, Button, Form, Input, Radio, InputNumber, Select, Tooltip, Progress, Table, Tag } from "antd";
import { AppstoreOutlined, BankOutlined, FileTextOutlined, HistoryOutlined, IdcardOutlined, MailOutlined, PhoneOutlined, RobotOutlined, ShopOutlined, TagsOutlined, TeamOutlined, ThunderboltOutlined, UserOutlined } from "@ant-design/icons";
import styled, { keyframes } from "styled-components";
import { useTranslation } from "react-i18next";
import type { ApplicationCategoryItem, ApplicationIndustryItem } from "@core/application/application-api";
import { maskPhone } from "@core/utils/mask";
import { BaseTemplate } from "@shared/base/base.template";
import type { AiTokenLedgerEntryModel, AiTokenSummaryModel } from "@modules/users/interfaces/ai-token.model";

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
  background-color: var(--color-surface-elevated);
  background-image: none;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
`;

const MainCard = styled(CardBase)`
  flex: 1;
  min-height: 0;
  overflow: hidden;
  isolation: isolate;
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  background-color: var(--color-surface-elevated);
  background-image: none;

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
    flex: 1;
    min-height: 0;
    overflow: hidden;
    background-color: var(--color-surface-elevated);
    background-image: none;
  }

  .ant-tabs-content,
  .ant-tabs-tabpane {
    height: 100%;
    min-height: 0;
    background-color: var(--color-surface-elevated);
    background-image: none;
  }

  .ant-tabs-tabpane {
    overflow-y: auto;
    overflow-x: hidden;
    padding-right: 2px;
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
  defaultTab?: "personal" | "company" | "ai-tokens";
  aiTokensSummary?: AiTokenSummaryModel;
  aiTokensLedger?: AiTokenLedgerEntryModel[];
  aiTokensTotal?: number;
  isAiTokensLoading?: boolean;
  isAvatarLoading?: boolean;
  isWallpaperLoading?: boolean;
  isSavingPersonal?: boolean;
  isSavingCompany?: boolean;
  onRefreshAiTokens?: () => void;
  onOpenAvatar: () => void;
  onOpenWallpaper?: () => void;
  onSavePersonal: (values: PersonalModel) => void;
  onSaveCompany: (values: CompanyModel) => void;
};

const FormStackStyle: React.CSSProperties = { display: "flex", flexDirection: "column", gap: "var(--space-2)" };
const fallbackIndustryOptionValues = [
  "health",
  "finance",
  "retail",
  "education",
  "services",
  "other",
] as const;

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
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;

  @media (max-width: 1100px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 760px) {
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
  aiTokensSummary,
  aiTokensLedger,
  aiTokensTotal,
  isAiTokensLoading,
  isAvatarLoading,
  isWallpaperLoading,
  onOpenAvatar,
  onOpenWallpaper,
  onSavePersonal,
  onSaveCompany,
  isSavingPersonal,
  isSavingCompany,
  onRefreshAiTokens,
}) => {
  const { t } = useTranslation();
  const [personalForm] = Form.useForm();
  const [companyForm] = Form.useForm();

  const fallbackIndustryOptions = React.useMemo(
    () =>
      fallbackIndustryOptionValues.map((value) => ({
        value,
        label: t(`users.profile.company.fields.industryFallback.${value}`),
      })),
    [t]
  );

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
  }, [industries, company?.industry, fallbackIndustryOptions]);

  const aiTokenColumns = React.useMemo(() => ([
    {
      title: t("users.profile.aiTokens.table.columns.when"),
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      render: (value: string) => {
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return "-";
        return d.toLocaleString();
      },
    },
    {
      title: t("users.profile.aiTokens.table.columns.module"),
      dataIndex: "sourceModule",
      key: "sourceModule",
      width: 120,
      render: (value: string) => <Tag>{value}</Tag>,
    },
    {
      title: t("users.profile.aiTokens.table.columns.feature"),
      dataIndex: "sourceFeature",
      key: "sourceFeature",
      width: 240,
      ellipsis: true,
    },
    {
      title: t("users.profile.aiTokens.table.columns.type"),
      dataIndex: "entryType",
      key: "entryType",
      width: 110,
      render: (value: string) => (
        <Tag color={value === "debit" ? "red" : value === "credit" ? "green" : "gold"}>
          {t(`users.profile.aiTokens.table.entryType.${value}`, { defaultValue: value })}
        </Tag>
      ),
    },
    {
      title: t("users.profile.aiTokens.table.columns.tokens"),
      dataIndex: "amountTokens",
      key: "amountTokens",
      width: 110,
      render: (value: number, row: AiTokenLedgerEntryModel) => (
        <span style={{ fontWeight: 600, color: row.entryType === "debit" ? "var(--color-error)" : "var(--color-success)" }}>
          {row.entryType === "debit" ? "-" : "+"}
          {value}
        </span>
      ),
    },
    {
      title: t("users.profile.aiTokens.table.columns.balanceAfter"),
      dataIndex: "balanceAfterTokens",
      key: "balanceAfterTokens",
      width: 140,
      render: (value: number) => <span style={{ fontWeight: 600 }}>{value}</span>,
    },
  ]), [t]);

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
    <ProfileShell data-cy="users-profile-template">
      <MainCard data-cy="users-profile-main-card">
        <MainHeader>
          <div>
            <MainTitle>{t("users.profile.header.title")}</MainTitle>
            <MainSubtitle>{t("users.profile.header.subtitle")}</MainSubtitle>
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
                <PlanName>{personal?.planName ?? t("users.profile.common.noPlan")}</PlanName>
                {personal?.planPrice ? <PlanPrice>{personal.planPrice}</PlanPrice> : null}
              </PlanBadge>
              <ActionButton type="default" onClick={onOpenAvatar} data-cy="users-profile-change-photo-button">
                {t("users.profile.actions.changePhoto")}
              </ActionButton>
            </HeroActions>
          </HeroContent>
        </HeroFrame>

        <ProfileHighlights>
          <HighlightCard>
            <HighlightIcon><TagsOutlined /></HighlightIcon>
            <HighlightMeta>
              <HighlightLabel>{t("users.profile.highlights.plan")}</HighlightLabel>
              <HighlightValue>{personal?.planName ?? t("users.profile.common.noPlan")}</HighlightValue>
            </HighlightMeta>
          </HighlightCard>

          <HighlightCard>
            <HighlightIcon><IdcardOutlined /></HighlightIcon>
            <HighlightMeta>
              <HighlightLabel>{t("users.profile.highlights.accountType")}</HighlightLabel>
              <HighlightValue>
                {t(
                  `users.profile.company.fields.accountType.options.${company?.accountType === "company" ? "company" : "individual"}`
                )}
              </HighlightValue>
            </HighlightMeta>
          </HighlightCard>

          <HighlightCard>
            <HighlightIcon><TeamOutlined /></HighlightIcon>
            <HighlightMeta>
              <HighlightLabel>{t("users.profile.highlights.employees")}</HighlightLabel>
              <HighlightValue>{company?.employees ?? 0}</HighlightValue>
            </HighlightMeta>
          </HighlightCard>

          <HighlightCard>
            <HighlightIcon><ThunderboltOutlined /></HighlightIcon>
            <HighlightMeta>
              <HighlightLabel>{t("users.profile.highlights.aiTokens")}</HighlightLabel>
              <HighlightValue>{aiTokensSummary?.totalBalanceTokens ?? 0}</HighlightValue>
            </HighlightMeta>
          </HighlightCard>
        </ProfileHighlights>

        <ProfileTabs defaultActiveKey={defaultTab ?? "personal"} data-cy="users-profile-tabs">
            <TabPane tab={<span data-cy="users-profile-tab-personal">{t("users.profile.tabs.personal")}</span>} key="personal">
              <Form
                form={personalForm}
                initialValues={{ ...personal, phone: maskPhone(personal?.phone) }}
                layout="vertical"
                style={FormStackStyle}
                onFinish={(v) => onSavePersonal(v as PersonalModel)}
                data-cy="users-personal-form"
              >
                <PersonalGrid>
                  <Form.Item
                    name="fullName"
                    label={
                      <FieldLabel>
                        <LabelIcon><UserOutlined /></LabelIcon>
                        {t("users.profile.personal.fields.fullName.label")}
                      </FieldLabel>
                    }
                    rules={[{ required: true, message: t("users.profile.personal.fields.fullName.required") }]}
                  >
                    <Input placeholder={t("users.profile.personal.fields.fullName.placeholder")} data-cy="users-personal-full-name-input" />
                  </Form.Item>
                  <Form.Item
                    name="email"
                    label={
                      <FieldLabel>
                        <LabelIcon><MailOutlined /></LabelIcon>
                        {t("users.profile.personal.fields.email.label")}
                      </FieldLabel>
                    }
                  >
                    <Input disabled data-cy="users-personal-email-input" />
                  </Form.Item>
                  <Form.Item
                    className="span-full"
                    name="phone"
                    label={
                      <FieldLabel>
                        <LabelIcon><PhoneOutlined /></LabelIcon>
                        {t("users.profile.personal.fields.phone.label")}
                        <Tooltip title={t("users.profile.personal.fields.phone.hint")}>
                          <span style={{ marginLeft: 6, cursor: "help", color: "var(--color-text-muted)" }}>?</span>
                        </Tooltip>
                      </FieldLabel>
                    }
                  >
                    <Input
                      placeholder={t("users.profile.personal.fields.phone.placeholder")}
                      data-cy="users-personal-phone-input"
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
                    <Tooltip title={t("users.profile.personal.actions.saveTooltip")}>
                      <span>
                        <Button
                          type="primary"
                          htmlType="submit"
                          loading={isSavingPersonal}
                          data-cy="users-personal-save-button"
                        >
                          {t("users.profile.personal.actions.save")}
                        </Button>
                      </span>
                    </Tooltip>
                  </FormActions>
                </Form.Item>
              </Form>
            </TabPane>

            <TabPane tab={<span data-cy="users-profile-tab-company">{t("users.profile.tabs.company")}</span>} key="company" forceRender>
              <Form
                form={companyForm}
                initialValues={company ?? { accountType: "individual" }}
                layout="vertical"
                style={FormStackStyle}
                onFinish={(v) => onSaveCompany(v as CompanyModel)}
                data-cy="users-company-form"
              >
                <CompanyGrid>
                  <Form.Item
                    name="accountType"
                    label={
                      <FieldLabel>
                        <LabelIcon><IdcardOutlined /></LabelIcon>
                        {t("users.profile.company.fields.accountType.label")}
                      </FieldLabel>
                    }
                  >
                    <Radio.Group data-cy="users-company-account-type-radio-group">
                      <Radio value="individual" data-cy="users-company-account-type-individual-radio">
                        {t("users.profile.company.fields.accountType.options.individual")}
                      </Radio>
                      <Radio value="company" data-cy="users-company-account-type-company-radio">
                        {t("users.profile.company.fields.accountType.options.company")}
                      </Radio>
                    </Radio.Group>
                  </Form.Item>

                  <Form.Item
                    name="employees"
                    label={
                      <FieldLabel>
                        <LabelIcon><TeamOutlined /></LabelIcon>
                        {t("users.profile.company.fields.employees.label")}
                      </FieldLabel>
                    }
                  >
                    <InputNumber
                      style={{ width: "100%" }}
                      min={0}
                      data-cy="users-company-employees-input"
                    />
                  </Form.Item>

                  <Form.Item
                    name="legalName"
                    label={
                      <FieldLabel>
                        <LabelIcon><BankOutlined /></LabelIcon>
                        {t("users.profile.company.fields.legalName.label")}
                        <Tooltip title={t("users.profile.company.fields.legalName.hint")}>
                          <span style={{ marginLeft: 6, cursor: "help", color: "var(--color-text-muted)" }}>?</span>
                        </Tooltip>
                      </FieldLabel>
                    }
                  >
                    <Input placeholder={t("users.profile.company.fields.legalName.placeholder")} data-cy="users-company-legal-name-input" />
                  </Form.Item>

                  <Form.Item
                    name="tradeName"
                    label={
                      <FieldLabel>
                        <LabelIcon><ShopOutlined /></LabelIcon>
                        {t("users.profile.company.fields.tradeName.label")}
                      </FieldLabel>
                    }
                  >
                    <Input placeholder={t("users.profile.company.fields.tradeName.placeholder")} data-cy="users-company-trade-name-input" />
                  </Form.Item>

                  <Form.Item
                    name="primaryService"
                    label={
                      <FieldLabel>
                        <LabelIcon><AppstoreOutlined /></LabelIcon>
                        {t("users.profile.company.fields.primaryService.label")}
                      </FieldLabel>
                    }
                  >
                    <Select
                      placeholder={t("users.profile.company.fields.primaryService.placeholder")}
                      options={serviceOptions}
                      data-cy="users-company-primary-service-select"
                    />
                  </Form.Item>

                  <Form.Item
                    name="industry"
                    label={
                      <FieldLabel>
                        <LabelIcon><TagsOutlined /></LabelIcon>
                        {t("users.profile.company.fields.industry.label")}
                      </FieldLabel>
                    }
                  >
                    <Select
                      placeholder={t("users.profile.company.fields.industry.placeholder")}
                      options={industryOptions}
                      data-cy="users-company-industry-select"
                    />
                  </Form.Item>

                  <Form.Item
                    name="description"
                    label={
                      <FieldLabel>
                        <LabelIcon><FileTextOutlined /></LabelIcon>
                        {t("users.profile.company.fields.description.label")}
                      </FieldLabel>
                    }
                    className="span-full"
                  >
                    <Input.TextArea rows={2} data-cy="users-company-description-input" />
                  </Form.Item>
                </CompanyGrid>

                <Form.Item>
                  <FormActions>
                    <Tooltip title={t("users.profile.company.actions.changeWallpaperTooltip")}>
                      <span>
                        <Button type="default" onClick={onOpenWallpaper} data-cy="users-company-change-wallpaper-button">
                          {t("users.profile.company.actions.changeWallpaper")}
                        </Button>
                      </span>
                    </Tooltip>
                    <Tooltip title={t("users.profile.company.actions.saveTooltip")}>
                      <span>
                        <Button
                          type="primary"
                          htmlType="submit"
                          loading={isSavingCompany}
                          data-cy="users-company-save-button"
                        >
                          {t("users.profile.company.actions.save")}
                        </Button>
                      </span>
                    </Tooltip>
                  </FormActions>
                </Form.Item>
              </Form>
            </TabPane>

            <TabPane tab={<span data-cy="users-profile-tab-ai-tokens">{t("users.profile.tabs.aiTokens")}</span>} key="ai-tokens">
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div
                  style={{
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-md)",
                    padding: 12,
                    background: "color-mix(in srgb, var(--color-surface) 92%, transparent)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontWeight: 700 }}>
                        <RobotOutlined />
                        {t("users.profile.aiTokens.balance.title")}
                      </div>
                      <div style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
                        {t("users.profile.aiTokens.balance.subtitle")}
                      </div>
                    </div>
                    <Button onClick={onRefreshAiTokens} loading={isAiTokensLoading}>
                      {t("users.profile.aiTokens.balance.actions.refresh")}
                    </Button>
                  </div>

                  <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 8 }}>
                    <div>
                      <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{t("users.profile.aiTokens.balance.cards.current")}</div>
                      <div style={{ fontSize: 20, fontWeight: 800 }}>{aiTokensSummary?.totalBalanceTokens ?? 0}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{t("users.profile.aiTokens.balance.cards.monthlyQuota")}</div>
                      <div style={{ fontSize: 20, fontWeight: 800 }}>{aiTokensSummary?.monthlyAllocationTokens ?? 0}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{t("users.profile.aiTokens.balance.cards.topUp")}</div>
                      <div style={{ fontSize: 20, fontWeight: 800 }}>{aiTokensSummary?.topupBalanceTokens ?? 0}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{t("users.profile.aiTokens.balance.cards.nextRefill")}</div>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>
                        {aiTokensSummary?.nextRefillAt
                          ? new Date(aiTokensSummary.nextRefillAt).toLocaleString()
                          : "-"}
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: 10 }}>
                    <Progress
                      percent={
                        aiTokensSummary?.monthlyAllocationTokens
                          ? Math.min(
                              100,
                              Math.round(
                                ((aiTokensSummary.monthlyBalanceTokens ?? 0) /
                                  aiTokensSummary.monthlyAllocationTokens) *
                                  100
                              )
                            )
                          : 0
                      }
                      status="active"
                      size="small"
                    />
                    <div style={{ marginTop: 4, fontSize: 12, color: "var(--color-text-muted)" }}>
                      {t("users.profile.aiTokens.balance.remainingMonthlyQuota", {
                        count: aiTokensSummary?.monthlyBalanceTokens ?? 0,
                      })}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-md)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 12px",
                      borderBottom: "1px solid var(--color-divider)",
                      background: "color-mix(in srgb, var(--color-surface-2) 72%, transparent)",
                    }}
                  >
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontWeight: 700 }}>
                      <HistoryOutlined />
                      {t("users.profile.aiTokens.statement.title")}
                    </div>
                    <Tag>{t("users.profile.aiTokens.statement.totalRecords", { count: aiTokensTotal ?? 0 })}</Tag>
                  </div>

                  <Table<AiTokenLedgerEntryModel>
                    rowKey="id"
                    loading={isAiTokensLoading}
                    columns={aiTokenColumns}
                    dataSource={aiTokensLedger ?? []}
                    pagination={false}
                    scroll={{ x: 920, y: 320 }}
                    locale={{ emptyText: t("users.profile.aiTokens.statement.empty") }}
                  />
                </div>
              </div>
            </TabPane>
          </ProfileTabs>
        </MainCard>
    </ProfileShell>
  );

  return <BaseTemplate content={content} />;
};

export default ProfileTemplate;

