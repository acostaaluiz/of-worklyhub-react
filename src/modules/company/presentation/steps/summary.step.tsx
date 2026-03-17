import type { ReactNode } from "react";
import { Form, Tabs, Typography } from "antd";
import type { WizardStep } from "@shared/ui/components/form-step/form-step.component";
import { CheckCheck } from "lucide-react";
import { i18n as appI18n } from "@core/i18n";
import {
  ServiceCardsGrid,
  SummaryFieldCard,
  SummaryFieldLabel,
  SummaryFieldValue,
  SummaryGrid,
  SummaryTabsWrap,
} from "./summary.step.styles";

export function summaryStep(): WizardStep {
  const content: ReactNode = (
    <Form.Item shouldUpdate noStyle>
      {({ getFieldsValue }) => {
        const v = getFieldsValue(true);
        const services = Array.isArray(v.services)
          ? v.services.filter((service: { name?: string }) => Boolean(service?.name))
          : [];

        const formatPrice = (value?: number) => {
          if (typeof value !== "number" || !Number.isFinite(value)) return appI18n.t("company.steps.summary.common.dash");
          return appI18n.t("company.steps.summary.values.price", { value: value.toFixed(2) });
        };
        const valueOrDash = (value?: DataValue) => {
          const normalized = String(value ?? "").trim();
          return normalized || appI18n.t("company.steps.summary.common.dash");
        };

        const overviewTab = (
          <SummaryGrid>
            <SummaryFieldCard>
              <SummaryFieldLabel>{appI18n.t("company.steps.summary.labels.fullName")}</SummaryFieldLabel>
              <SummaryFieldValue>{valueOrDash(v.fullName)}</SummaryFieldValue>
            </SummaryFieldCard>
            <SummaryFieldCard>
              <SummaryFieldLabel>{appI18n.t("company.steps.summary.labels.email")}</SummaryFieldLabel>
              <SummaryFieldValue>{valueOrDash(v.email)}</SummaryFieldValue>
            </SummaryFieldCard>
            <SummaryFieldCard>
              <SummaryFieldLabel>{appI18n.t("company.steps.summary.labels.phone")}</SummaryFieldLabel>
              <SummaryFieldValue>{valueOrDash(v.phone)}</SummaryFieldValue>
            </SummaryFieldCard>
            <SummaryFieldCard>
              <SummaryFieldLabel>{appI18n.t("company.steps.summary.labels.accountType")}</SummaryFieldLabel>
              <SummaryFieldValue>{valueOrDash(v.accountType)}</SummaryFieldValue>
            </SummaryFieldCard>
            <SummaryFieldCard>
              <SummaryFieldLabel>{appI18n.t("company.steps.summary.labels.companyName")}</SummaryFieldLabel>
              <SummaryFieldValue>{valueOrDash(v.companyName)}</SummaryFieldValue>
            </SummaryFieldCard>
            <SummaryFieldCard>
              <SummaryFieldLabel>{appI18n.t("company.steps.summary.labels.legalName")}</SummaryFieldLabel>
              <SummaryFieldValue>{valueOrDash(v.legalName)}</SummaryFieldValue>
            </SummaryFieldCard>
          </SummaryGrid>
        );

        const marketTab = (
          <SummaryGrid>
            <SummaryFieldCard>
              <SummaryFieldLabel>{appI18n.t("company.steps.summary.labels.employees")}</SummaryFieldLabel>
              <SummaryFieldValue>{valueOrDash(v.employees)}</SummaryFieldValue>
            </SummaryFieldCard>
            <SummaryFieldCard>
              <SummaryFieldLabel>{appI18n.t("company.steps.summary.labels.primaryService")}</SummaryFieldLabel>
              <SummaryFieldValue>{valueOrDash(v.primaryService)}</SummaryFieldValue>
            </SummaryFieldCard>
            <SummaryFieldCard>
              <SummaryFieldLabel>{appI18n.t("company.steps.summary.labels.serviceCategory")}</SummaryFieldLabel>
              <SummaryFieldValue>{valueOrDash(v.primaryServiceCategory)}</SummaryFieldValue>
            </SummaryFieldCard>
            <SummaryFieldCard>
              <SummaryFieldLabel>{appI18n.t("company.steps.summary.labels.industry")}</SummaryFieldLabel>
              <SummaryFieldValue>{valueOrDash(v.industry)}</SummaryFieldValue>
            </SummaryFieldCard>
            <SummaryFieldCard $full>
              <SummaryFieldLabel>{appI18n.t("company.steps.summary.labels.description")}</SummaryFieldLabel>
              <SummaryFieldValue>{valueOrDash(v.description)}</SummaryFieldValue>
            </SummaryFieldCard>
          </SummaryGrid>
        );

        const servicesTab = services.length <= 0 ? (
          <Typography.Text type="secondary">{appI18n.t("company.steps.summary.emptyServices")}</Typography.Text>
        ) : (
          <ServiceCardsGrid>
            {services.map((service: { name?: string; category?: string; durationMinutes?: number; price?: number; capacity?: number; description?: string }, index: number) => (
              <SummaryFieldCard key={`${service.name ?? "service"}-${index}`}>
                <SummaryFieldLabel>{appI18n.t("company.steps.summary.values.service", { index: index + 1 })}</SummaryFieldLabel>
                <SummaryFieldValue>{valueOrDash(service.name)}</SummaryFieldValue>

                <SummaryFieldLabel style={{ marginTop: 6 }}>{appI18n.t("company.steps.summary.labels.category")}</SummaryFieldLabel>
                <SummaryFieldValue>{valueOrDash(service.category)}</SummaryFieldValue>

                <SummaryFieldLabel style={{ marginTop: 6 }}>{appI18n.t("company.steps.summary.labels.duration")}</SummaryFieldLabel>
                <SummaryFieldValue>
                  {service.durationMinutes ? appI18n.t("company.steps.summary.values.durationMinutes", { minutes: service.durationMinutes }) : appI18n.t("company.steps.summary.common.dash")}
                </SummaryFieldValue>

                <SummaryFieldLabel style={{ marginTop: 6 }}>{appI18n.t("company.steps.summary.labels.basePrice")}</SummaryFieldLabel>
                <SummaryFieldValue>{formatPrice(service.price)}</SummaryFieldValue>

                <SummaryFieldLabel style={{ marginTop: 6 }}>{appI18n.t("company.steps.summary.labels.capacity")}</SummaryFieldLabel>
                <SummaryFieldValue>{valueOrDash(service.capacity)}</SummaryFieldValue>
              </SummaryFieldCard>
            ))}
          </ServiceCardsGrid>
        );

        return (
          <>
            <Typography.Text type="secondary">
              {appI18n.t("company.steps.summary.helper")}
            </Typography.Text>
            <SummaryTabsWrap>
              <Tabs
                defaultActiveKey="overview"
                items={[
                  { key: "overview", label: appI18n.t("company.steps.summary.tabs.overview"), children: overviewTab },
                  { key: "market", label: appI18n.t("company.steps.summary.tabs.market"), children: marketTab },
                  { key: "services", label: appI18n.t("company.steps.summary.tabs.services"), children: servicesTab },
                ]}
              />
            </SummaryTabsWrap>
          </>
        );
      }}
    </Form.Item>
  );

  return {
    id: "summary",
    title: appI18n.t("company.steps.summary.title"),
    subtitle: appI18n.t("company.steps.summary.subtitle"),
    icon: <CheckCheck size={16} />,
    content,
    fields: [],
  };
}
