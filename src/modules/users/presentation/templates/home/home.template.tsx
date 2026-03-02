import React from "react";
import ServicesCards from "@modules/users/presentation/components/home/services-cards.component";
import MetricsCards from "@modules/users/presentation/components/home/metrics-cards.component";
import { Briefcase, Box, CalendarDays, DollarSign, LayoutGrid, Sparkles } from "lucide-react";
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
  servicesCount?: number;
  metrics?: {
    appointmentsToday: number;
    revenueThisMonthCents?: number | null;
    nextAppointment?: { title?: string; date?: string; time?: string };
  };
  description?: string;
  onEditCompany?: () => void;
  onOpenTutorials?: () => void;
  onOpenModules?: () => void;
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
  servicesCount,
  metrics,
  description,
  onEditCompany,
  onOpenTutorials,
  onOpenModules,
}: Props) {
  const initials = initialsFrom(companyName);

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
                Tutorials
              </HeroButton>
            ) : null}
            {onOpenModules ? (
              <HeroButton onClick={onOpenModules} $variant="ghost">
                All modules
              </HeroButton>
            ) : null}
            <HeroButton onClick={onEditCompany} $variant="primary">
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
          Operational health in real time.
        </SectionDescription>

        <MetricsWrap>
          {metrics ? (
            <MetricsCards
              appointmentsToday={metrics.appointmentsToday}
              revenueThisMonthCents={metrics.revenueThisMonthCents}
              nextAppointment={metrics.nextAppointment}
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

          <CompanyCard className="surface">
            <CompanyIcon>
              <Box size={16} />
            </CompanyIcon>
            <CompanyMeta>
              <CompanyLabel>Available modules</CompanyLabel>
              <CompanyValue>{servicesCount ?? services?.length ?? 0}</CompanyValue>
            </CompanyMeta>
          </CompanyCard>

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

      <ContentSection $delay="3" $grow>
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
