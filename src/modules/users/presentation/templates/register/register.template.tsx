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

export function RegisterTemplate() {
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
              <RegisterForm />
            </RightPanel>
          </Grid>
        </PublicFrameLayout>
      }
    />
  );
}
