import React from "react";
import { Typography } from "antd";
import { i18n as appI18n } from "@core/i18n";

import { BasePage } from "@shared/base/base.page";
import { navigateTo } from "@core/navigation/navigation.service";
import { LegalTemplate } from "../../templates/legal/legal.template";
import { LegalSection } from "../../templates/legal/legal.template.styles";

export class PrivacyPage extends BasePage {
  protected override options = {
    title: `${appI18n.t("users.pageTitles.privacy")} | WorklyHub`,
    requiresAuth: false,
  };

  protected override renderPage(): React.ReactNode {
    return (
      <LegalTemplate
        title="Privacy Policy"
        description="This policy explains how we collect and use your information."
        updatedAt="February 24, 2026"
        onBack={() => navigateTo("/register")}
      >
        <LegalSection>
          <Typography.Title level={4} style={{ margin: 0 }}>
            1. Information we collect
          </Typography.Title>
          <Typography.Paragraph>
            We collect account data (name, email), workspace data you provide, and usage data needed to operate the platform.
          </Typography.Paragraph>
        </LegalSection>

        <LegalSection>
          <Typography.Title level={4} style={{ margin: 0 }}>
            2. How we use information
          </Typography.Title>
          <Typography.Paragraph>
            We use your information to provide, secure, and improve the service, and to communicate essential updates.
          </Typography.Paragraph>
        </LegalSection>

        <LegalSection>
          <Typography.Title level={4} style={{ margin: 0 }}>
            3. Sharing
          </Typography.Title>
          <Typography.Paragraph>
            We only share data with service providers required to deliver the product or when legally required.
          </Typography.Paragraph>
        </LegalSection>

        <LegalSection>
          <Typography.Title level={4} style={{ margin: 0 }}>
            4. Security
          </Typography.Title>
          <Typography.Paragraph>
            We apply reasonable safeguards to protect your data, but no system can guarantee absolute security.
          </Typography.Paragraph>
        </LegalSection>

        <LegalSection>
          <Typography.Title level={4} style={{ margin: 0 }}>
            5. Data retention
          </Typography.Title>
          <Typography.Paragraph>
            We retain data as long as your account is active or as needed to comply with legal obligations.
          </Typography.Paragraph>
        </LegalSection>

        <LegalSection>
          <Typography.Title level={4} style={{ margin: 0 }}>
            6. Your choices
          </Typography.Title>
          <Typography.Paragraph>
            You can update profile information in the app or request deletion by contacting support.
          </Typography.Paragraph>
        </LegalSection>

        <LegalSection>
          <Typography.Title level={4} style={{ margin: 0 }}>
            7. Contact
          </Typography.Title>
          <Typography.Paragraph>
            If you have questions about this policy, contact us at support@worklyhub.com.
          </Typography.Paragraph>
        </LegalSection>
      </LegalTemplate>
    );
  }
}

export default PrivacyPage;
