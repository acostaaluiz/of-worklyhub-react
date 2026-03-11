import React from "react";
import { Popover } from "antd";
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

function formatNext(next?: { title?: string; date?: string; time?: string }) {
  if (!next) return "No upcoming appointment";
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
  const initials = initialsFrom(companyName);
  const readinessSignals = [
    {
      key: "company-name",
      label: "Company name configured",
      completed: Boolean(companyName),
    },
    {
      key: "company-description",
      label: "Company description configured",
      completed: Boolean(description),
    },
    {
      key: "plan",
      label: "Active plan detected",
      completed: Boolean(planTitle),
    },
    {
      key: "next-appointment",
      label: "At least one upcoming appointment",
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
        <span className="title">Setup checklist</span>
        <span className="meta">
          {readinessCount}/{readinessTotal} complete
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
          ? "All setup signals are complete."
          : `${missingReadinessSignals.length} pending item(s) to reach 100%.`}
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
            <HeroTitle>{name ? `Welcome, ${name}` : "Welcome"}</HeroTitle>
            <HeroDescription>
              Start your day with priority signals and jump into the modules that
              keep your operation moving.
            </HeroDescription>
          </HeroCopy>

          <HeroActions>
            {onOpenTutorials ? (
              <HeroButton onClick={onOpenTutorials} $variant="ghost">
                <BookOpenCheck size={16} />
                Tutorials
              </HeroButton>
            ) : null}
            <HeroButton onClick={onEditCompany} $variant="primary">
              <Settings2 size={16} />
              Edit company
            </HeroButton>
          </HeroActions>
        </HeroMainRow>

        <HeroHighlights>
          <HeroHighlightCard>
            <HeroHighlightIcon>
              <CalendarDays size={16} />
            </HeroHighlightIcon>
            <HeroHighlightMeta>
              <HeroHighlightLabel>Today load</HeroHighlightLabel>
              <HeroHighlightValue>
                {metrics?.appointmentsToday ?? 0} appointments
              </HeroHighlightValue>
            </HeroHighlightMeta>
          </HeroHighlightCard>

          <HeroHighlightCard>
            <HeroHighlightIcon>
              <DollarSign size={16} />
            </HeroHighlightIcon>
            <HeroHighlightMeta>
              <HeroHighlightLabel>Revenue pulse</HeroHighlightLabel>
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
              <HeroHighlightLabel>Next appointment</HeroHighlightLabel>
              <HeroHighlightValue>
                {formatNext(metrics?.nextAppointment)}
              </HeroHighlightValue>
            </HeroHighlightMeta>
          </HeroHighlightCard>
        </HeroHighlights>
      </HeroSection>

      <ContentSection $delay="1">
        <SectionTitle>Indicators</SectionTitle>
        <SectionDescription>
          Watch risks and pending signals without duplicating top-line KPIs.
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
        <SectionTitle>Company snapshot</SectionTitle>
        <SectionDescription>
          Quick context before you start executing.
        </SectionDescription>

        <CompanyCards>
          <CompanyCard className="surface">
            <CompanyIcon>
              <Briefcase size={16} />
            </CompanyIcon>
            <CompanyMeta>
              <CompanyLabel>Company</CompanyLabel>
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
                  <CompanyLabel>Setup readiness</CompanyLabel>
                  <CompanyValue>{readinessPercent}% ready</CompanyValue>
                  <CompanyText>
                    {readinessCount}/{readinessTotal} key workspace signals configured
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
              <CompanyLabel>Plan</CompanyLabel>
              <CompanyValue>{planTitle ?? "--"}</CompanyValue>
            </CompanyMeta>
          </CompanyCard>
        </CompanyCards>
      </ContentSection>

      <ContentSection $delay="3">
        <SectionTitle>Choose a module to start</SectionTitle>
        <SectionDescription>
          Jump straight into the core workflows of your day.
        </SectionDescription>
        <ServicesArea>
          <ServicesCards services={services ?? []} />
        </ServicesArea>
      </ContentSection>
    </HomeShell>
  );
}
