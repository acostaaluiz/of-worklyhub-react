import { useState, type ReactElement, type ReactNode } from "react";
import { Button, Form } from "antd";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";

import { Step } from "./step.component";
import {
  ContentDescription,
  ContentHeader,
  ContentTitle,
  FooterRow,
  RightActions,
  StepsList,
  WizardContent,
  WizardContentBody,
  WizardGrid,
  WizardShell,
  WizardSidebar,
  WizardSidebarHeader,
  WizardSidebarSubtitle,
  WizardSidebarTitle,
} from "./form-step.component.styles";

export type WizardStep = {
  id: string;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  content: ReactNode;
  fields?: Array<string | number | (string | number)[]>;
};

type FormStepWizardProps<TValues extends object> = {
  title: string;
  subtitle?: string;
  steps: WizardStep[];
  initialValues: TValues;
  onFinish: (values: TValues) => void;
  allowJumpAhead?: boolean;
};

export function FormStepWizard<TValues extends object>({
  title,
  subtitle,
  steps,
  initialValues,
  onFinish,
  allowJumpAhead = false,
}: FormStepWizardProps<TValues>): ReactElement {
  const [form] = Form.useForm<TValues>();
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const activeStep = steps[currentIndex];
  const canGoBack = currentIndex > 0;
  const isLast = currentIndex === steps.length - 1;

  const statusFor = (index: number) => {
    if (index < currentIndex) return "done" as const;
    if (index === currentIndex) return "active" as const;
    return "pending" as const;
  };

  const validateCurrentStep = async () => {
    const fields = activeStep.fields;

    if (fields?.length) {
      await form.validateFields(fields);
      return;
    }

    await form.validateFields();
  };

  const handleNext = async () => {
    await validateCurrentStep();
    setCurrentIndex((value) => Math.min(value + 1, steps.length - 1));
  };

  const handleBack = () => setCurrentIndex((value) => Math.max(value - 1, 0));

  const handleSubmit = async () => {
    await validateCurrentStep();
    await form.validateFields();
    const values = form.getFieldsValue(true) as TValues;
    onFinish(values);
  };

  const handleStepClick = async (index: number) => {
    if (index === currentIndex) return;

    const isForward = index > currentIndex;
    if (isForward && !allowJumpAhead) return;

    if (isForward) {
      await validateCurrentStep();
    }

    setCurrentIndex(index);
  };

  return (
    <WizardShell>
      <Form<TValues>
        form={form}
        layout="vertical"
        initialValues={initialValues}
        requiredMark={false}
        style={{ width: "100%", height: "100%" }}
      >
        <WizardGrid>
          <WizardSidebar aria-label="Steps navigation">
            <WizardSidebarHeader>
              <WizardSidebarTitle>{title}</WizardSidebarTitle>
              {subtitle ? (
                <WizardSidebarSubtitle>{subtitle}</WizardSidebarSubtitle>
              ) : null}
            </WizardSidebarHeader>

            <StepsList>
              {steps.map((step, index) => (
                <Step
                  key={step.id}
                  index={index + 1}
                  title={step.title}
                  subtitle={step.subtitle}
                  icon={step.icon}
                  status={statusFor(index)}
                  onClick={() => handleStepClick(index)}
                />
              ))}
            </StepsList>
          </WizardSidebar>

          <WizardContent aria-label="Step content" data-cy={`wizard-step-${activeStep.id}`}>
            <ContentHeader>
              <ContentTitle>{activeStep.title}</ContentTitle>
              {activeStep.subtitle ? (
                <ContentDescription>{activeStep.subtitle}</ContentDescription>
              ) : null}
            </ContentHeader>

            <WizardContentBody>{activeStep.content}</WizardContentBody>

            <FooterRow>
              <Button
                size="large"
                onClick={handleBack}
                disabled={!canGoBack}
                icon={<ChevronLeft size={18} />}
                data-cy="wizard-back-button"
              >
                Back
              </Button>

              <RightActions>
                {!isLast ? (
                  <Button
                    type="primary"
                    size="large"
                    onClick={handleNext}
                    icon={<ChevronRight size={18} />}
                    data-cy="wizard-next-button"
                  >
                    Next step
                  </Button>
                ) : (
                  <Button
                    type="primary"
                    size="large"
                    onClick={handleSubmit}
                    icon={<Check size={18} />}
                    data-cy="wizard-finish-button"
                  >
                    Finish
                  </Button>
                )}
              </RightActions>
            </FooterRow>
          </WizardContent>
        </WizardGrid>
      </Form>
    </WizardShell>
  );
}
