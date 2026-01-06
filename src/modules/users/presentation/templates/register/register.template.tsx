import { BaseTemplate } from "@shared/base/base.template";
import { PublicFrameLayout } from "@shared/ui/layout/public-frame/public-frame.component";

import {
  Grid,
  LeftPanel,
  RightPanel,
  BrandRow,
  BrandMark,
  BrandTitle,
  BrandSubtitle,
  Hero,
  HeroTitle,
  HeroDescription,
  TipCard,
  TipText,
} from "./register.template.styles";

import { RegisterForm } from "../../components/register-form/register-form.component";
import ResponseModal, { type ResponseVariant } from "@shared/ui/components/response-modal/response-modal.component";

type ResponseModalProps =
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

type Props = {
  onSubmit?: (values: { name: string; email: string; password: string }) => Promise<void>;
  responseModal?: ResponseModalProps;
  onLogin?: () => void;
};

export function RegisterTemplate({ onSubmit, responseModal, onLogin }: Props) {
  return (
    <BaseTemplate
      content={
        <PublicFrameLayout>
          <Grid>
            <LeftPanel aria-label="Register hero panel">
              <div>
                <BrandRow>
                  <BrandMark aria-label="WorklyHub Logo">WH</BrandMark>
                  <div>
                    <BrandTitle>WorklyHub</BrandTitle>
                    <BrandSubtitle>
                      Operations hub for service businesses
                    </BrandSubtitle>
                  </div>
                </BrandRow>

                <Hero>
                  <HeroTitle>
                    Create your account.
                    <br />
                    Start in minutes.
                  </HeroTitle>
                  <HeroDescription>
                    Manage clients, services, schedules and cash flow in one
                    place. Build your workflow with speed and clarity.
                  </HeroDescription>
                </Hero>
              </div>

              <TipCard>
                <TipText>
                  Tip: Use a strong password and keep your account secure.
                </TipText>
              </TipCard>
            </LeftPanel>

            <RightPanel>
              <RegisterForm onSubmit={onSubmit} onLogin={onLogin} />
            </RightPanel>
          </Grid>

          {/* Response modal is rendered inside the template so pages can control it */}
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
        </PublicFrameLayout>
      }
    />
  );
}
