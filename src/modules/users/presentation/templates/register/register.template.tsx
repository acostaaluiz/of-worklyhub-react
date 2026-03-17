import { BaseTemplate } from "@shared/base/base.template";
import { PublicFrameLayout } from "@shared/ui/layout/public-frame/public-frame.component";
import { worklyHubLogoUrl } from "@shared/assets/brand";
import { Svg } from "@shared/ui/components/svg/svg.component";
import { useTranslation } from "react-i18next";

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

import { RegisterForm, type RegisterFormCopy } from "../../components/register-form/register-form.component";
import AuthLanguageSelect from "../../components/auth-language-select/auth-language-select.component";
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
  onSubmit?: (values: {
    name: string;
    email: string;
    password: string;
    confirmPassword?: string;
    acceptTerms?: boolean;
  }) => Promise<void>;
  responseModal?: ResponseModalProps;
  onLogin?: () => void;
};

export function RegisterTemplate({ onSubmit, responseModal, onLogin }: Props) {
  const { t } = useTranslation();
  const copy: RegisterFormCopy = {
    title: t("users.auth.register.form.title"),
    subtitle: t("users.auth.register.form.subtitle"),
    fullNameLabel: t("users.auth.common.fullName.label"),
    fullNameRequired: t("users.auth.common.fullName.required"),
    fullNameMin: t("users.auth.common.fullName.min"),
    fullNamePlaceholder: t("users.auth.common.fullName.placeholder"),
    emailLabel: t("users.auth.common.email.label"),
    emailRequired: t("users.auth.common.email.required"),
    emailInvalid: t("users.auth.common.email.invalid"),
    emailPlaceholder: t("users.auth.common.email.placeholder"),
    passwordLabel: t("users.auth.common.password.label"),
    passwordRequired: t("users.auth.common.password.required"),
    passwordMin: t("users.auth.common.password.min"),
    passwordPlaceholder: t("users.auth.register.form.passwordPlaceholder"),
    confirmPasswordLabel: t("users.auth.register.form.confirmPasswordLabel"),
    confirmPasswordRequired: t("users.auth.register.form.confirmPasswordRequired"),
    confirmPasswordMismatch: t("users.auth.register.form.confirmPasswordMismatch"),
    confirmPasswordPlaceholder: t("users.auth.register.form.confirmPasswordPlaceholder"),
    acceptTermsError: t("users.auth.register.form.acceptTermsError"),
    acceptTermsPrefix: t("users.auth.register.form.acceptTermsPrefix"),
    termsLink: t("users.auth.register.form.termsLink"),
    and: t("users.auth.register.form.and"),
    privacyLink: t("users.auth.register.form.privacyLink"),
    submit: t("users.auth.register.form.submit"),
    continueWith: t("users.auth.common.continueWith"),
    googleAriaLabel: t("users.auth.common.googleAriaLabel"),
    facebookAriaLabel: t("users.auth.common.facebookAriaLabel"),
    alreadyHaveAccount: t("users.auth.register.form.alreadyHaveAccount"),
    signIn: t("users.auth.register.form.signIn"),
  };

  return (
    <BaseTemplate
      content={
        <PublicFrameLayout>
          <Grid>
            <LeftPanel aria-label="Register hero panel">
              <div>
                <BrandRow>
                  <BrandMark aria-label="WorklyHub Logo">
                    <Svg src={worklyHubLogoUrl} alt="WorklyHub" size={52} loading="eager" />
                  </BrandMark>
                  <div>
                    <BrandTitle>WorklyHub</BrandTitle>
                    <BrandSubtitle>
                      {t("users.auth.register.hero.subtitle")}
                    </BrandSubtitle>
                  </div>
                </BrandRow>

                <Hero>
                  <HeroTitle>
                    {t("users.auth.register.hero.titleLine1")}
                    <br />
                    {t("users.auth.register.hero.titleLine2")}
                  </HeroTitle>
                  <HeroDescription>
                    {t("users.auth.register.hero.description")}
                  </HeroDescription>
                </Hero>
              </div>

              <TipCard>
                <TipText>
                  {t("users.auth.register.hero.tip")}
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
                <RegisterForm
                  onSubmit={onSubmit}
                  onLogin={onLogin}
                  copy={copy}
                  languageControl={<AuthLanguageSelect />}
                />
              </div>
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
