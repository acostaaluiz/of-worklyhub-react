import { BaseTemplate } from "@shared/base/base.template";
import { PublicFrameLayout } from "@shared/ui/layout/public-frame/public-frame.component";
import { worklyHubLogoUrl } from "@shared/assets/brand";
import { Svg } from "@shared/ui/components/svg/svg.component";

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
} from "../login/login.template.styles";

import { ForgotPasswordForm } from "../../components/forgot-password-form/forgot-password-form.component";

type Props = {
  onSubmit?: (values: { email: string }) => Promise<void>;
  onLogin?: () => void;
};

export function ForgotPasswordTemplate({ onSubmit, onLogin }: Props) {
  return (
    <BaseTemplate
      content={
        <PublicFrameLayout>
          <Grid>
            <LeftPanel aria-label="Password recovery hero panel">
              <div>
                <BrandRow>
                  <BrandMark aria-label="WorklyHub Logo">
                    <Svg src={worklyHubLogoUrl} alt="WorklyHub" size={52} loading="eager" />
                  </BrandMark>
                  <div>
                    <BrandTitle>WorklyHub</BrandTitle>
                    <BrandSubtitle>Operations hub for service businesses</BrandSubtitle>
                  </div>
                </BrandRow>

                <Hero>
                  <HeroTitle>
                    Get back in.
                    <br />
                    Reset your access.
                  </HeroTitle>
                  <HeroDescription>
                    We will send a secure reset link to your inbox if the email is registered.
                  </HeroDescription>
                </Hero>
              </div>

              <TipCard>
                <TipText>
                  Tip: Check your spam folder if the email does not arrive in a few minutes.
                </TipText>
              </TipCard>
            </LeftPanel>

            <RightPanel>
              <ForgotPasswordForm onSubmit={onSubmit} onLogin={onLogin} />
            </RightPanel>
          </Grid>
        </PublicFrameLayout>
      }
    />
  );
}

export default ForgotPasswordTemplate;
