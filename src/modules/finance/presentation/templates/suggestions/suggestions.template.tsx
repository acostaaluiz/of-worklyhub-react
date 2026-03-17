import { Button, Space, Tag, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ClipboardList,
  Lightbulb,
  ReceiptText,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { i18n as appI18n } from "@core/i18n";
import { BaseTemplate } from "@shared/base/base.template";
import { ServicesFinanceList } from "@modules/finance/presentation/components/services-finance-list/services-finance-list.component";
import { FinanceKpis } from "@modules/finance/presentation/components/finance-kpis/finance-kpis.component";
import {
  AsideColumn,
  CardBody,
  CardHeader,
  CardShell,
  ContentGrid,
  GuideBullet,
  GuideItem,
  GuideList,
  HeroCard,
  HeroStats,
  HeroText,
  HeroTitleIcon,
  HeroTitleWrap,
  HeroTop,
  KpiCardBody,
  MainColumn,
  SectionIcon,
  SectionTitleRow,
  SuggestionsRoot,
} from "./suggestions.template.styles";

export function SuggestionsTemplate() {
        const navigate = useNavigate();

  return (
    <BaseTemplate
      content={
        <SuggestionsRoot>
          <HeroCard>
            <HeroTop>
              <HeroTitleWrap>
                <HeroTitleIcon>
                  <Sparkles size={20} />
                </HeroTitleIcon>
                <HeroText>
                  <Typography.Title level={2} style={{ margin: 0 }}>
                    {appI18n.t("legacyInline.finance.presentation_templates_suggestions_suggestions_template.k001")}
                  </Typography.Title>
                  <Typography.Text type="secondary">
                    {appI18n.t("legacyInline.finance.presentation_templates_suggestions_suggestions_template.k002")}
                  </Typography.Text>
                </HeroText>
              </HeroTitleWrap>

              <HeroStats>
                <Tag icon={<Sparkles size={12} />}>{appI18n.t("legacyInline.finance.presentation_templates_suggestions_suggestions_template.k003")}</Tag>
                <Tag icon={<TrendingUp size={12} />}>{appI18n.t("legacyInline.finance.presentation_templates_suggestions_suggestions_template.k004")}</Tag>
                <Tag icon={<ReceiptText size={12} />}>{appI18n.t("legacyInline.finance.presentation_templates_suggestions_suggestions_template.k005")}</Tag>
              </HeroStats>
            </HeroTop>
          </HeroCard>

          <ContentGrid>
            <MainColumn>
              <CardShell>
                <CardHeader>
                  <SectionTitleRow>
                    <SectionIcon>
                      <TrendingUp size={14} />
                    </SectionIcon>
                    <Typography.Title level={5} style={{ margin: 0 }}>
                      {appI18n.t("legacyInline.finance.presentation_templates_suggestions_suggestions_template.k006")}
                    </Typography.Title>
                  </SectionTitleRow>
                  <Typography.Text type="secondary">
                    {appI18n.t("legacyInline.finance.presentation_templates_suggestions_suggestions_template.k007")}
                  </Typography.Text>
                </CardHeader>
                <KpiCardBody>
                  <FinanceKpis />
                </KpiCardBody>
              </CardShell>

              <CardShell>
                <CardHeader>
                  <SectionTitleRow>
                    <SectionIcon>
                      <ClipboardList size={14} />
                    </SectionIcon>
                    <Typography.Title level={5} style={{ margin: 0 }}>
                      {appI18n.t("legacyInline.finance.presentation_templates_suggestions_suggestions_template.k008")}
                    </Typography.Title>
                  </SectionTitleRow>
                  <Typography.Text type="secondary">
                    {appI18n.t("legacyInline.finance.presentation_templates_suggestions_suggestions_template.k009")}
                  </Typography.Text>
                </CardHeader>
                <CardBody>
                  <ServicesFinanceList />
                </CardBody>
              </CardShell>
            </MainColumn>

            <AsideColumn>
              <CardShell style={{ flex: 1 }}>
                <CardHeader>
                  <SectionTitleRow>
                    <SectionIcon>
                      <Lightbulb size={14} />
                    </SectionIcon>
                    <Typography.Title level={5} style={{ margin: 0 }}>
                      {appI18n.t("legacyInline.finance.presentation_templates_suggestions_suggestions_template.k010")}
                    </Typography.Title>
                  </SectionTitleRow>
                  <Typography.Text type="secondary">
                    {appI18n.t("legacyInline.finance.presentation_templates_suggestions_suggestions_template.k011")}
                  </Typography.Text>
                </CardHeader>
                <CardBody>
                  <GuideList>
                    <GuideItem>
                      <GuideBullet>
                        <Sparkles size={11} />
                      </GuideBullet>
                      {appI18n.t("legacyInline.finance.presentation_templates_suggestions_suggestions_template.k012")}
                    </GuideItem>
                    <GuideItem>
                      <GuideBullet>
                        <TrendingUp size={11} />
                      </GuideBullet>
                      {appI18n.t("legacyInline.finance.presentation_templates_suggestions_suggestions_template.k013")}
                    </GuideItem>
                    <GuideItem>
                      <GuideBullet>
                        <ReceiptText size={11} />
                      </GuideBullet>
                      {appI18n.t("legacyInline.finance.presentation_templates_suggestions_suggestions_template.k014")}
                    </GuideItem>
                  </GuideList>
                </CardBody>
              </CardShell>

              <CardShell>
                <CardHeader>
                  <SectionTitleRow>
                    <SectionIcon>
                      <ArrowRight size={14} />
                    </SectionIcon>
                    <Typography.Title level={5} style={{ margin: 0 }}>
                      {appI18n.t("legacyInline.finance.presentation_templates_suggestions_suggestions_template.k015")}
                    </Typography.Title>
                  </SectionTitleRow>
                </CardHeader>
                <CardBody>
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <Button
                      type="default"
                      icon={<ArrowRight size={14} />}
                      onClick={() => navigate("/finance/services")}
                    >
                      {appI18n.t("legacyInline.finance.presentation_templates_suggestions_suggestions_template.k016")}
                    </Button>
                    <Button
                      type="default"
                      icon={<ArrowRight size={14} />}
                      onClick={() => navigate("/finance/entries")}
                    >
                      {appI18n.t("legacyInline.finance.presentation_templates_suggestions_suggestions_template.k017")}
                    </Button>
                  </Space>
                </CardBody>
              </CardShell>
            </AsideColumn>
          </ContentGrid>
        </SuggestionsRoot>
      }
    />
  );
}

export default SuggestionsTemplate;
