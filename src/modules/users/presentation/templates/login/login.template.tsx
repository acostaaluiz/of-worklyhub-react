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
} from "./login.template.styles";
import { LoginForm } from "../../components/login-form/login-form.component";

type Props = {
  onSubmit?: (values: { email: string; password: string }) => Promise<void>;
  onRegister?: () => void;
};

export function LoginTemplate({ onSubmit, onRegister }: Props) {
  return (
    <BaseTemplate
      content={
        <PublicFrameLayout>
          <Grid>
            <LeftPanel aria-label="Login hero panel">
              <div>
                <BrandRow>
                  <BrandMark aria-label="WorklyHub Logo">
                    <Svg src={worklyHubLogoUrl} alt="WorklyHub" size={52} loading="eager" />
                  </BrandMark>
                  <div>
                    <BrandTitle>WorklyHub</BrandTitle>
                    <BrandSubtitle>
                      Operations hub for service businesses
                    </BrandSubtitle>
                  </div>
                </BrandRow>

                <Hero>
                  <HeroTitle>
                    Organize your day.
                    <br />
                    Run your business.
                  </HeroTitle>
                  <HeroDescription>
                    Schedule, clients, services and cash flow in one place.
                    Start simple, scale fast.
                  </HeroDescription>
                </Hero>
              </div>

              <TipCard>
                <TipText>
                  Tip: You can switch between light and dark theme anytime.
                </TipText>
              </TipCard>
            </LeftPanel>

            <RightPanel>
              <LoginForm onSubmit={onSubmit} onRegister={onRegister} />
            </RightPanel>
          </Grid>
        </PublicFrameLayout>
      }
    />
  );
}
