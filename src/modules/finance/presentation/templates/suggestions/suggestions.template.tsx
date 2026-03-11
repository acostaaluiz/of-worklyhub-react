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
                    Price suggestions
                  </Typography.Title>
                  <Typography.Text type="secondary">
                    Improve service pricing with guidance from recent finance performance.
                  </Typography.Text>
                </HeroText>
              </HeroTitleWrap>

              <HeroStats>
                <Tag icon={<Sparkles size={12} />}>Smart hints</Tag>
                <Tag icon={<TrendingUp size={12} />}>Margin focused</Tag>
                <Tag icon={<ReceiptText size={12} />}>Service based</Tag>
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
                      Finance snapshot
                    </Typography.Title>
                  </SectionTitleRow>
                  <Typography.Text type="secondary">
                    Quick view of income, expense, profit, and margin before applying suggestions.
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
                      Suggested services
                    </Typography.Title>
                  </SectionTitleRow>
                  <Typography.Text type="secondary">
                    Review each service recommendation and apply it as a finance entry when needed.
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
                      How to use
                    </Typography.Title>
                  </SectionTitleRow>
                  <Typography.Text type="secondary">
                    Apply these suggestions to reduce pricing gaps and improve profitability.
                  </Typography.Text>
                </CardHeader>
                <CardBody>
                  <GuideList>
                    <GuideItem>
                      <GuideBullet>
                        <Sparkles size={11} />
                      </GuideBullet>
                      Compare current versus suggested value for each service.
                    </GuideItem>
                    <GuideItem>
                      <GuideBullet>
                        <TrendingUp size={11} />
                      </GuideBullet>
                      Prioritize high-volume services where margin changes have bigger impact.
                    </GuideItem>
                    <GuideItem>
                      <GuideBullet>
                        <ReceiptText size={11} />
                      </GuideBullet>
                      Register adjustments in finance entries to keep reports aligned.
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
                      Quick actions
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
                      Open services performance
                    </Button>
                    <Button
                      type="default"
                      icon={<ArrowRight size={14} />}
                      onClick={() => navigate("/finance/entries")}
                    >
                      Open finance entries
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
