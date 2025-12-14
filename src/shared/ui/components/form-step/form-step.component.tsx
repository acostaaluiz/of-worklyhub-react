import { useState, type ReactElement, type ReactNode } from "react";
import { Button, Form } from "antd";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";

import { Step } from "./step.component";
import {
  ContentDescription,
  ContentHeader,
  ContentTitle,
  FooterRow,
  RightActions,
  StepsList,
  WizardContent,
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
  content: ReactNode;
  fields?: string[];
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
      await form.validateFields(fields as any);
      return;
    }

    await form.validateFields();
  };

  const handleNext = async () => {
    await validateCurrentStep();
    setCurrentIndex((v) => Math.min(v + 1, steps.length - 1));
  };

  const handleBack = () => setCurrentIndex((v) => Math.max(v - 1, 0));

  const handleSubmit = async () => {
    await validateCurrentStep();
    const values = await form.validateFields();
    onFinish(values as TValues);
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
        style={{ width: "100%" }}
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
              {steps.map((s, idx) => (
                <Step
                  key={s.id}
                  index={idx + 1}
                  title={s.title}
                  subtitle={s.subtitle}
                  status={statusFor(idx)}
                  onClick={() => handleStepClick(idx)}
                />
              ))}
            </StepsList>
          </WizardSidebar>

          <WizardContent aria-label="Step content">
            <ContentHeader>
              <ContentTitle>{activeStep.title}</ContentTitle>
              {activeStep.subtitle ? (
                <ContentDescription>{activeStep.subtitle}</ContentDescription>
              ) : null}
            </ContentHeader>

            {activeStep.content}

            <FooterRow>
              <Button
                size="large"
                onClick={handleBack}
                disabled={!canGoBack}
                icon={<ChevronLeft size={18} />}
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
                  >
                    Next step
                  </Button>
                ) : (
                  <Button
                    type="primary"
                    size="large"
                    onClick={handleSubmit}
                    icon={<Check size={18} />}
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
