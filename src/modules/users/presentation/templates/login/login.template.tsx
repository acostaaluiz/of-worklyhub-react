import { BaseTemplate } from "@shared/base/base.template";
import { PublicFrameLayout } from "@shared/ui/layout/public-frame/public-frame.component";
import { worklyHubLogoUrl } from "@shared/assets/brand";
import { Svg } from "@shared/ui/components/svg/svg.component";
import { useTranslation } from "react-i18next";
import AuthLanguageSelect from "../../components/auth-language-select/auth-language-select.component";

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
import { LoginForm, type LoginFormCopy } from "../../components/login-form/login-form.component";

type Props = {
  onSubmit?: (values: { email: string; password: string }) => Promise<void>;
  onRegister?: () => void;
  onForgotPassword?: () => void;
};

export function LoginTemplate({ onSubmit, onRegister, onForgotPassword }: Props) {
  const { t } = useTranslation();
  const copy: LoginFormCopy = {
    title: t("users.auth.login.form.title"),
    subtitle: t("users.auth.login.form.subtitle"),
    emailLabel: t("users.auth.common.email.label"),
    emailRequired: t("users.auth.common.email.required"),
    emailInvalid: t("users.auth.common.email.invalid"),
    emailPlaceholder: t("users.auth.common.email.placeholder"),
    passwordLabel: t("users.auth.common.password.label"),
    passwordRequired: t("users.auth.common.password.required"),
    passwordMin: t("users.auth.common.password.min"),
    passwordPlaceholder: t("users.auth.login.form.passwordPlaceholder"),
    forgotPassword: t("users.auth.login.form.forgotPassword"),
    submit: t("users.auth.login.form.submit"),
    continueWith: t("users.auth.common.continueWith"),
    googleAriaLabel: t("users.auth.common.googleAriaLabel"),
    facebookAriaLabel: t("users.auth.common.facebookAriaLabel"),
    notMember: t("users.auth.login.form.notMember"),
    registerNow: t("users.auth.login.form.registerNow"),
  };

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
                      {t("users.auth.login.hero.subtitle")}
                    </BrandSubtitle>
                  </div>
                </BrandRow>

                <Hero>
                  <HeroTitle>
                    {t("users.auth.login.hero.titleLine1")}
                    <br />
                    {t("users.auth.login.hero.titleLine2")}
                  </HeroTitle>
                  <HeroDescription>
                    {t("users.auth.login.hero.description")}
                  </HeroDescription>
                </Hero>
              </div>

              <TipCard>
                <TipText>
                  {t("users.auth.login.hero.tip")}
                </TipText>
              </TipCard>
            </LeftPanel>

            <RightPanel>
              <div
                style={{
                  width: "100%",
                  maxWidth: 460,
                }}
              >
                <LoginForm
                  onSubmit={onSubmit}
                  onRegister={onRegister}
                  onForgotPassword={onForgotPassword}
                  copy={copy}
                  languageControl={<AuthLanguageSelect />}
                />
              </div>
            </RightPanel>
          </Grid>
        </PublicFrameLayout>
      }
    />
  );
}
