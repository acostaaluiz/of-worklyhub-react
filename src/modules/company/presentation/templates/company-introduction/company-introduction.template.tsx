import type { ReactElement } from "react";
import { BarChart3, BriefcaseBusiness, Building2 } from "lucide-react";

import type { ApplicationCategoryItem, ApplicationIndustryItem } from "@core/application/application-api";
import { maskPhone } from "@core/utils/mask";
import { BaseTemplate } from "@shared/base/base.template";
import { FormStepWizard } from "@shared/ui/components/form-step/form-step.component";
import ResponseModal, { type ResponseVariant } from "@shared/ui/components/response-modal/response-modal.component";

import { companyInfoStep } from "../../steps/company-info.step";
import type { CompanyIntroductionValues } from "../../steps/company-introduction.types";
import { launchServicesStep } from "../../steps/launch-services.step";
import { personalInfoStep } from "../../steps/personal-info.step";
import { servicesInfoStep } from "../../steps/services-info.step";
import { summaryStep } from "../../steps/summary.step";

import {
  HeaderHighlightCard,
  HeaderHighlightIcon,
  HeaderHighlightLabel,
  HeaderHighlights,
  HeaderHighlightValue,
  HeaderRow,
  TemplateShell,
  TemplateSubtitle,
  TemplateTitle,
} from "./company-introduction.template.styles";

type Props = {
  onFinish?: (values: CompanyIntroductionValues) => Promise<void> | void;
  categories?: ApplicationCategoryItem[];
  industries?: ApplicationIndustryItem[];
  initialValues?: CompanyIntroductionValues;
  responseModal?:
    | {
        open: boolean;
        variant?: ResponseVariant;
        title: string;
        description?: string;
        primaryLabel?: string;
        secondaryLabel?: string;
        onClose: () => void;
        onPrimary: () => void;
      }
    | undefined;
};

export function CompanyIntroductionTemplate({ onFinish, categories, industries, initialValues: initialValuesProp, responseModal }: Props): ReactElement {
  const steps = [
    personalInfoStep(),
    companyInfoStep(),
    servicesInfoStep(categories, industries),
    launchServicesStep(categories),
    summaryStep(),
  ];

  const defaultValues: CompanyIntroductionValues = {
    fullName: "",
    email: "",
    phone: "",
    accountType: "individual",
    companyName: "",
    legalName: "",
    employees: undefined,
    primaryService: "",
    primaryServiceCategory: "",
    industry: "",
    description: "",
    services: [{}, {}, {}],
  };

  const initialValues: CompanyIntroductionValues = {
    ...defaultValues,
    ...(initialValuesProp ?? {}),
    phone: maskPhone(initialValuesProp?.phone ?? defaultValues.phone ?? ""),
    services: initialValuesProp?.services ?? defaultValues.services,
  };

  return (
    <BaseTemplate
      content={
        <>
          <TemplateShell>
            <HeaderRow>
              <TemplateTitle>Company setup</TemplateTitle>
              <TemplateSubtitle>
                Configure your workspace foundation in a few guided steps.
              </TemplateSubtitle>

              <HeaderHighlights>
                <HeaderHighlightCard>
                  <HeaderHighlightIcon>
                    <Building2 size={14} />
                  </HeaderHighlightIcon>
                  <div>
                    <HeaderHighlightLabel>Identity</HeaderHighlightLabel>
                    <HeaderHighlightValue>Workspace ownership and profile</HeaderHighlightValue>
                  </div>
                </HeaderHighlightCard>

                <HeaderHighlightCard>
                  <HeaderHighlightIcon>
                    <BriefcaseBusiness size={14} />
                  </HeaderHighlightIcon>
                  <div>
                    <HeaderHighlightLabel>Catalog</HeaderHighlightLabel>
                    <HeaderHighlightValue>Primary service and launch offers</HeaderHighlightValue>
                  </div>
                </HeaderHighlightCard>

                <HeaderHighlightCard>
                  <HeaderHighlightIcon>
                    <BarChart3 size={14} />
                  </HeaderHighlightIcon>
                  <div>
                    <HeaderHighlightLabel>Activation</HeaderHighlightLabel>
                    <HeaderHighlightValue>Improve readiness signals in Home</HeaderHighlightValue>
                  </div>
                </HeaderHighlightCard>
              </HeaderHighlights>
            </HeaderRow>

            <div className="wizard-wrap" data-cy="company-setup-wizard">
              <FormStepWizard<CompanyIntroductionValues>
                title="Setup"
                subtitle="Complete these steps to publish your workspace baseline."
                steps={steps}
                initialValues={initialValues}
                onFinish={onFinish ?? (() => {})}
              />
            </div>

            {responseModal ? (
              <ResponseModal
                open={responseModal.open}
                variant={responseModal.variant}
                title={responseModal.title}
                description={responseModal.description}
                primaryLabel={responseModal.primaryLabel}
                secondaryLabel={responseModal.secondaryLabel}
                onClose={responseModal.onClose}
                onPrimary={responseModal.onPrimary}
              />
            ) : null}
          </TemplateShell>
        </>
      }
    />
  );
}
