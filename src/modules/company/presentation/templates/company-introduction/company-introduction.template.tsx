import type { ReactElement } from "react";

import { BaseTemplate } from "@shared/base/base.template";
import { PrivateFrameLayout } from "@shared/ui/layout/private-frame/private-frame.component";

import { FormStepWizard } from "@shared/ui/components/form-step/form-step.component";

import {
  TemplateShell,
  HeaderRow,
  TemplateSubtitle,
  TemplateTitle,
} from "./company-introduction.template.styles";

import { personalInfoStep } from "../../steps/personal-info.step";
import { companyInfoStep } from "../../steps/company-info.step";
import { servicesInfoStep } from "../../steps/services-info.step";
import { summaryStep } from "../../steps/summary.step";

import type { CompanyIntroductionValues } from "../../steps/personal-info.step";
import type { ApplicationCategoryItem, ApplicationIndustryItem } from "@core/application/application-api";
import ResponseModal, { type ResponseVariant } from "@shared/ui/components/response-modal/response-modal.component";

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
    summaryStep(),
  ];

  const defaultValues: CompanyIntroductionValues = {
    fullName: "",
    email: "",
    phone: "",
    accountType: "individual",
    companyName: "",
    employees: undefined,
    primaryService: "",
    industry: "",
    description: "",
  };

  const initialValues: CompanyIntroductionValues = {
    ...defaultValues,
    ...(initialValuesProp ?? {}),
  };

  return (
    <BaseTemplate
      content={
        <PrivateFrameLayout>
          <TemplateShell>
            <HeaderRow>
              <TemplateTitle>Company setup</TemplateTitle>
              <TemplateSubtitle>
                Let’s configure your profile so WorklyHub can tailor the
                experience to your business.
              </TemplateSubtitle>
            </HeaderRow>

            <FormStepWizard<CompanyIntroductionValues>
              title="Setup"
              subtitle="Complete these steps to personalize your workspace."
              steps={steps}
              initialValues={initialValues}
              onFinish={onFinish}
            />
            {/** Response modal is rendered inside the template so pages can control it */}
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
        </PrivateFrameLayout>
      }
    />
  );
}
