import type { ReactElement } from "react";
import { BarChart3, BriefcaseBusiness, Building2 } from "lucide-react";
import { useTranslation } from "react-i18next";

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
  mode?: "create" | "edit";
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

export function CompanyIntroductionTemplate({
  onFinish,
  mode = "create",
  categories,
  industries,
  initialValues: initialValuesProp,
  responseModal,
}: Props): ReactElement {
  const { t } = useTranslation();

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

  const isEditMode = mode === "edit";
  const headerTitle = isEditMode
    ? t("company.introduction.template.header.editTitle")
    : t("company.introduction.template.header.title");
  const headerSubtitle = isEditMode
    ? t("company.introduction.template.header.editSubtitle")
    : t("company.introduction.template.header.subtitle");
  const wizardTitle = isEditMode
    ? t("company.introduction.template.wizard.editTitle")
    : t("company.introduction.template.wizard.title");
  const wizardSubtitle = isEditMode
    ? t("company.introduction.template.wizard.editSubtitle")
    : t("company.introduction.template.wizard.subtitle");

  return (
    <BaseTemplate
      content={
        <>
          <TemplateShell>
            <HeaderRow>
              <TemplateTitle>{headerTitle}</TemplateTitle>
              <TemplateSubtitle>
                {headerSubtitle}
              </TemplateSubtitle>

              <HeaderHighlights>
                <HeaderHighlightCard>
                  <HeaderHighlightIcon>
                    <Building2 size={14} />
                  </HeaderHighlightIcon>
                  <div>
                    <HeaderHighlightLabel>{t("company.introduction.template.highlights.identity.label")}</HeaderHighlightLabel>
                    <HeaderHighlightValue>{t("company.introduction.template.highlights.identity.value")}</HeaderHighlightValue>
                  </div>
                </HeaderHighlightCard>

                <HeaderHighlightCard>
                  <HeaderHighlightIcon>
                    <BriefcaseBusiness size={14} />
                  </HeaderHighlightIcon>
                  <div>
                    <HeaderHighlightLabel>{t("company.introduction.template.highlights.catalog.label")}</HeaderHighlightLabel>
                    <HeaderHighlightValue>{t("company.introduction.template.highlights.catalog.value")}</HeaderHighlightValue>
                  </div>
                </HeaderHighlightCard>

                <HeaderHighlightCard>
                  <HeaderHighlightIcon>
                    <BarChart3 size={14} />
                  </HeaderHighlightIcon>
                  <div>
                    <HeaderHighlightLabel>{t("company.introduction.template.highlights.activation.label")}</HeaderHighlightLabel>
                    <HeaderHighlightValue>{t("company.introduction.template.highlights.activation.value")}</HeaderHighlightValue>
                  </div>
                </HeaderHighlightCard>
              </HeaderHighlights>
            </HeaderRow>

            <div className="wizard-wrap" data-cy="company-setup-wizard">
              <FormStepWizard<CompanyIntroductionValues>
                title={wizardTitle}
                subtitle={wizardSubtitle}
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
