import React from "react";
import { Popover } from "antd";
import { useTranslation } from "react-i18next";
import ServicesCards from "@modules/users/presentation/components/home/services-cards.component";
import MetricsCards from "@modules/users/presentation/components/home/metrics-cards.component";
import {
  BookOpenCheck,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  DollarSign,
  Gauge,
  LayoutGrid,
  Settings2,
  Sparkles,
} from "lucide-react";
import { formatDate } from "@core/utils/mask";
import { formatMoney } from "@core/utils/currency";
import {
  CompanyCard,
  CompanyCards,
  CompanyIcon,
  CompanyLabel,
  CompanyMeta,
  CompanyText,
  CompanyValue,
  ContentSection,
  HeroActions,
  HeroBackdrop,
  HeroButton,
  HeroCopy,
  HeroDescription,
  HeroHighlightCard,
  HeroHighlightIcon,
  HeroHighlightLabel,
  HeroHighlightMeta,
  HeroHighlightValue,
  HeroHighlights,
  HeroIdentity,
  HeroInitials,
  HeroMainRow,
  HeroSection,
  HeroTitle,
  HomeShell,
  MetricsFallback,
  MetricsWrap,
  ReadinessCardTrigger,
  ReadinessTooltipCard,
  ReadinessTooltipFootnote,
  ReadinessTooltipHeader,
  ReadinessTooltipItem,
  ReadinessTooltipList,
  SectionDescription,
  SectionDivider,
  SectionTitle,
  ServicesArea,
} from "./home.template.styles";

type ServiceItem = { id: string; title: string; subtitle?: string; icon?: React.ReactNode };

type Props = {
  name?: string;
  companyName?: string;
  planTitle?: string;
  services: ServiceItem[];
  metrics?: {
    appointmentsToday: number;
    revenueThisMonthCents?: number | null;
    nextAppointment?: { title?: string; date?: string; time?: string };
    overdueWorkOrders?: number;
    inventoryAlerts?: number;
    unreadNotifications?: number;
    highPriorityUnreadNotifications?: number;
  };
  description?: string;
  onEditCompany?: () => void;
  onOpenTutorials?: () => void;
};

function initialsFrom(name?: string) {
  if (!name) return "--";
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatNext(
  next: { title?: string; date?: string; time?: string } | undefined,
  t: (key: string) => string
) {
  if (!next) return t("home.hero.highlights.nextAppointment.empty");
  const date = formatDate(next.date, "DD/MM");
  const time = next.time ? ` ${next.time}` : "";
  return `${date}${time}`.trim();
}

export default function UsersHomeTemplate({
  name,
  companyName,
  planTitle,
  services,
  metrics,
  description,
  onEditCompany,
  onOpenTutorials,
}: Props) {
  const { t } = useTranslation();
  const initials = initialsFrom(companyName);
  const readinessSignals = [
    {
      key: "company-name",
      label: t("home.readiness.signals.companyNameConfigured"),
      completed: Boolean(companyName),
    },
    {
      key: "company-description",
      label: t("home.readiness.signals.companyDescriptionConfigured"),
      completed: Boolean(description),
    },
    {
      key: "plan",
      label: t("home.readiness.signals.activePlanDetected"),
      completed: Boolean(planTitle),
    },
    {
      key: "next-appointment",
      label: t("home.readiness.signals.upcomingAppointment"),
      completed: Boolean(metrics?.nextAppointment),
    },
  ];
  const readinessTotal = readinessSignals.length;
  const readinessCount = readinessSignals.filter((signal) => signal.completed).length;
  const readinessPercent = Math.round((readinessCount / readinessTotal) * 100);
  const missingReadinessSignals = readinessSignals.filter((signal) => !signal.completed);
  const readinessTooltipContent = (
    <ReadinessTooltipCard>
      <ReadinessTooltipHeader>
        <span className="title">{t("home.readiness.tooltip.title")}</span>
        <span className="meta">
          {t("home.readiness.tooltip.progress", {
            completed: readinessCount,
            total: readinessTotal,
          })}
        </span>
      </ReadinessTooltipHeader>

      <ReadinessTooltipList>
        {readinessSignals.map((signal) => (
          <ReadinessTooltipItem key={signal.key} $completed={signal.completed}>
            {signal.completed ? <CheckCircle2 size={14} /> : <CircleAlert size={14} />}
            <span>{signal.label}</span>
          </ReadinessTooltipItem>
        ))}
      </ReadinessTooltipList>

      <ReadinessTooltipFootnote $completed={missingReadinessSignals.length <= 0}>
        {missingReadinessSignals.length <= 0
          ? t("home.readiness.tooltip.complete")
          : t("home.readiness.tooltip.pending", { count: missingReadinessSignals.length })}
      </ReadinessTooltipFootnote>
    </ReadinessTooltipCard>
  );

  return (
    <HomeShell>
      <HeroSection>
        <HeroBackdrop aria-hidden>
          <span className="orb-a" />
          <span className="orb-b" />
        </HeroBackdrop>

        <HeroMainRow>
          <HeroIdentity>
            <HeroInitials>{initials}</HeroInitials>
          </HeroIdentity>

          <HeroCopy>
            <HeroTitle>
              {name ? t("home.hero.titleWithName", { name }) : t("home.hero.title")}
            </HeroTitle>
            <HeroDescription>
              {t("home.hero.description")}
            </HeroDescription>
          </HeroCopy>

          <HeroActions>
            {onOpenTutorials ? (
              <HeroButton onClick={onOpenTutorials} $variant="ghost">
                <BookOpenCheck size={16} />
                {t("home.hero.actions.tutorials")}
              </HeroButton>
            ) : null}
            <HeroButton onClick={onEditCompany} $variant="primary">
              <Settings2 size={16} />
              {t("home.hero.actions.editCompany")}
            </HeroButton>
          </HeroActions>
        </HeroMainRow>

        <HeroHighlights>
          <HeroHighlightCard>
            <HeroHighlightIcon>
              <CalendarDays size={16} />
            </HeroHighlightIcon>
            <HeroHighlightMeta>
              <HeroHighlightLabel>{t("home.hero.highlights.todayLoad.label")}</HeroHighlightLabel>
              <HeroHighlightValue>
                {t("home.hero.highlights.todayLoad.value", {
                  count: metrics?.appointmentsToday ?? 0,
                })}
              </HeroHighlightValue>
            </HeroHighlightMeta>
          </HeroHighlightCard>

          <HeroHighlightCard>
            <HeroHighlightIcon>
              <DollarSign size={16} />
            </HeroHighlightIcon>
            <HeroHighlightMeta>
              <HeroHighlightLabel>{t("home.hero.highlights.revenuePulse.label")}</HeroHighlightLabel>
              <HeroHighlightValue>
                {formatMoney(metrics?.revenueThisMonthCents ?? null)}
              </HeroHighlightValue>
            </HeroHighlightMeta>
          </HeroHighlightCard>

          <HeroHighlightCard>
            <HeroHighlightIcon>
              <Sparkles size={16} />
            </HeroHighlightIcon>
            <HeroHighlightMeta>
              <HeroHighlightLabel>{t("home.hero.highlights.nextAppointment.label")}</HeroHighlightLabel>
              <HeroHighlightValue>
                {formatNext(metrics?.nextAppointment, t)}
              </HeroHighlightValue>
            </HeroHighlightMeta>
          </HeroHighlightCard>
        </HeroHighlights>
      </HeroSection>

      <ContentSection $delay="1">
        <SectionTitle>{t("home.sections.indicators.title")}</SectionTitle>
        <SectionDescription>
          {t("home.sections.indicators.description")}
        </SectionDescription>

        <MetricsWrap>
          {metrics ? (
            <MetricsCards
              overdueWorkOrders={metrics.overdueWorkOrders}
              inventoryAlerts={metrics.inventoryAlerts}
              unreadNotifications={metrics.unreadNotifications}
              highPriorityUnreadNotifications={metrics.highPriorityUnreadNotifications}
            />
          ) : (
            <MetricsFallback />
          )}
        </MetricsWrap>
        <SectionDivider />
      </ContentSection>

      <ContentSection $delay="2">
        <SectionTitle>{t("home.sections.companySnapshot.title")}</SectionTitle>
        <SectionDescription>
          {t("home.sections.companySnapshot.description")}
        </SectionDescription>

        <CompanyCards>
          <CompanyCard className="surface">
            <CompanyIcon>
              <Briefcase size={16} />
            </CompanyIcon>
            <CompanyMeta>
              <CompanyLabel>{t("home.companyCards.company.label")}</CompanyLabel>
              <CompanyValue>{companyName ?? "--"}</CompanyValue>
              {description ? <CompanyText>{description}</CompanyText> : null}
            </CompanyMeta>
          </CompanyCard>

          <Popover content={readinessTooltipContent} placement="top" trigger={["hover"]}>
            <ReadinessCardTrigger>
              <CompanyCard className="surface">
                <CompanyIcon>
                  <Gauge size={16} />
                </CompanyIcon>
                <CompanyMeta>
                  <CompanyLabel>{t("home.companyCards.readiness.label")}</CompanyLabel>
                  <CompanyValue>{t("home.companyCards.readiness.value", { percent: readinessPercent })}</CompanyValue>
                  <CompanyText>
                    {t("home.companyCards.readiness.meta", {
                      configured: readinessCount,
                      total: readinessTotal,
                    })}
                  </CompanyText>
                </CompanyMeta>
              </CompanyCard>
            </ReadinessCardTrigger>
          </Popover>

          <CompanyCard className="surface">
            <CompanyIcon>
              <LayoutGrid size={16} />
            </CompanyIcon>
            <CompanyMeta>
              <CompanyLabel>{t("home.companyCards.plan.label")}</CompanyLabel>
              <CompanyValue>{planTitle ?? "--"}</CompanyValue>
            </CompanyMeta>
          </CompanyCard>
        </CompanyCards>
      </ContentSection>

      <ContentSection $delay="3">
        <SectionTitle>{t("home.sections.modules.title")}</SectionTitle>
        <SectionDescription>
          {t("home.sections.modules.description")}
        </SectionDescription>
        <ServicesArea>
          <ServicesCards services={services ?? []} />
        </ServicesArea>
      </ContentSection>
    </HomeShell>
  );
}
