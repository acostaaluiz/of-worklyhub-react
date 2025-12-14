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

export function CompanyIntroductionTemplate(): ReactElement {
  const steps = [
    personalInfoStep(),
    companyInfoStep(),
    servicesInfoStep(),
    summaryStep(),
  ];

  const initialValues: CompanyIntroductionValues = {
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

  const handleFinish = () => {
    // Front-only por enquanto.
    // Próximo passo (quando entrar no E2E): persistir em store e chamar endpoint company/profile.
    return;
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
              onFinish={handleFinish}
            />
          </TemplateShell>
        </PrivateFrameLayout>
      }
    />
  );
}
