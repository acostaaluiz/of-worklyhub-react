import type { ReactNode } from "react";
import { Form, Tabs, Typography } from "antd";
import type { WizardStep } from "@shared/ui/components/form-step/form-step.component";
import { CheckCheck } from "lucide-react";
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
          if (typeof value !== "number" || !Number.isFinite(value)) return "-";
          return `R$ ${value.toFixed(2)}`;
        };
        const valueOrDash = (value?: DataValue) => {
          const normalized = String(value ?? "").trim();
          return normalized || "-";
        };

        const overviewTab = (
          <SummaryGrid>
            <SummaryFieldCard>
              <SummaryFieldLabel>Full name</SummaryFieldLabel>
              <SummaryFieldValue>{valueOrDash(v.fullName)}</SummaryFieldValue>
            </SummaryFieldCard>
            <SummaryFieldCard>
              <SummaryFieldLabel>Email</SummaryFieldLabel>
              <SummaryFieldValue>{valueOrDash(v.email)}</SummaryFieldValue>
            </SummaryFieldCard>
            <SummaryFieldCard>
              <SummaryFieldLabel>Phone</SummaryFieldLabel>
              <SummaryFieldValue>{valueOrDash(v.phone)}</SummaryFieldValue>
            </SummaryFieldCard>
            <SummaryFieldCard>
              <SummaryFieldLabel>Account type</SummaryFieldLabel>
              <SummaryFieldValue>{valueOrDash(v.accountType)}</SummaryFieldValue>
            </SummaryFieldCard>
            <SummaryFieldCard>
              <SummaryFieldLabel>Company name</SummaryFieldLabel>
              <SummaryFieldValue>{valueOrDash(v.companyName)}</SummaryFieldValue>
            </SummaryFieldCard>
            <SummaryFieldCard>
              <SummaryFieldLabel>Legal name</SummaryFieldLabel>
              <SummaryFieldValue>{valueOrDash(v.legalName)}</SummaryFieldValue>
            </SummaryFieldCard>
          </SummaryGrid>
        );

        const marketTab = (
          <SummaryGrid>
            <SummaryFieldCard>
              <SummaryFieldLabel>Employees</SummaryFieldLabel>
              <SummaryFieldValue>{valueOrDash(v.employees)}</SummaryFieldValue>
            </SummaryFieldCard>
            <SummaryFieldCard>
              <SummaryFieldLabel>Primary service</SummaryFieldLabel>
              <SummaryFieldValue>{valueOrDash(v.primaryService)}</SummaryFieldValue>
            </SummaryFieldCard>
            <SummaryFieldCard>
              <SummaryFieldLabel>Service category</SummaryFieldLabel>
              <SummaryFieldValue>{valueOrDash(v.primaryServiceCategory)}</SummaryFieldValue>
            </SummaryFieldCard>
            <SummaryFieldCard>
              <SummaryFieldLabel>Industry</SummaryFieldLabel>
              <SummaryFieldValue>{valueOrDash(v.industry)}</SummaryFieldValue>
            </SummaryFieldCard>
            <SummaryFieldCard $full>
              <SummaryFieldLabel>Description</SummaryFieldLabel>
              <SummaryFieldValue>{valueOrDash(v.description)}</SummaryFieldValue>
            </SummaryFieldCard>
          </SummaryGrid>
        );

        const servicesTab = services.length <= 0 ? (
          <Typography.Text type="secondary">No launch services informed.</Typography.Text>
        ) : (
          <ServiceCardsGrid>
            {services.map((service: { name?: string; category?: string; durationMinutes?: number; price?: number; capacity?: number; description?: string }, index: number) => (
              <SummaryFieldCard key={`${service.name ?? "service"}-${index}`}>
                <SummaryFieldLabel>{`Service ${index + 1}`}</SummaryFieldLabel>
                <SummaryFieldValue>{valueOrDash(service.name)}</SummaryFieldValue>

                <SummaryFieldLabel style={{ marginTop: 6 }}>Category</SummaryFieldLabel>
                <SummaryFieldValue>{valueOrDash(service.category)}</SummaryFieldValue>

                <SummaryFieldLabel style={{ marginTop: 6 }}>Duration</SummaryFieldLabel>
                <SummaryFieldValue>
                  {service.durationMinutes ? `${service.durationMinutes} min` : "-"}
                </SummaryFieldValue>

                <SummaryFieldLabel style={{ marginTop: 6 }}>Base price</SummaryFieldLabel>
                <SummaryFieldValue>{formatPrice(service.price)}</SummaryFieldValue>

                <SummaryFieldLabel style={{ marginTop: 6 }}>Capacity</SummaryFieldLabel>
                <SummaryFieldValue>{valueOrDash(service.capacity)}</SummaryFieldValue>
              </SummaryFieldCard>
            ))}
          </ServiceCardsGrid>
        );

        return (
          <>
            <Typography.Text type="secondary">
              Review your data before finishing setup.
            </Typography.Text>
            <SummaryTabsWrap>
              <Tabs
                defaultActiveKey="overview"
                items={[
                  { key: "overview", label: "Overview", children: overviewTab },
                  { key: "market", label: "Market", children: marketTab },
                  { key: "services", label: "Services", children: servicesTab },
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
    title: "Summary",
    subtitle: "Confirm details and create your workspace.",
    icon: <CheckCheck size={16} />,
    content,
    fields: [],
  };
}
