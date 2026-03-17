import React from "react";
import { Typography } from "antd";
import { i18n as appI18n } from "@core/i18n";

import { BasePage } from "@shared/base/base.page";
import { navigateTo } from "@core/navigation/navigation.service";
import { LegalTemplate } from "../../templates/legal/legal.template";
import { LegalSection } from "../../templates/legal/legal.template.styles";

export class TermsPage extends BasePage {
  protected override options = {
    title: `${appI18n.t("users.pageTitles.terms")} | WorklyHub`,
    requiresAuth: false,
  };

  protected override renderPage(): React.ReactNode {
    return (
      <LegalTemplate
        title="Terms of Service"
        description="These terms govern your use of WorklyHub and its services."
        updatedAt="February 24, 2026"
        onBack={() => navigateTo("/register")}
      >
        <LegalSection>
          <Typography.Title level={4} style={{ margin: 0 }}>
            1. Acceptance of terms
          </Typography.Title>
          <Typography.Paragraph>
            By creating an account or using WorklyHub, you agree to these Terms of Service and our Privacy Policy.
          </Typography.Paragraph>
        </LegalSection>

        <LegalSection>
          <Typography.Title level={4} style={{ margin: 0 }}>
            2. Accounts and access
          </Typography.Title>
          <Typography.Paragraph>
            You are responsible for maintaining the confidentiality of your credentials and for all activity under your account.
          </Typography.Paragraph>
        </LegalSection>

        <LegalSection>
          <Typography.Title level={4} style={{ margin: 0 }}>
            3. Acceptable use
          </Typography.Title>
          <Typography.Paragraph>
            You agree not to misuse the platform, interfere with the service, or access data that does not belong to your workspace.
          </Typography.Paragraph>
        </LegalSection>

        <LegalSection>
          <Typography.Title level={4} style={{ margin: 0 }}>
            4. Billing and subscriptions
          </Typography.Title>
          <Typography.Paragraph>
            Paid plans are billed according to the selected cycle. You may upgrade, downgrade, or cancel as allowed by your plan.
          </Typography.Paragraph>
        </LegalSection>

        <LegalSection>
          <Typography.Title level={4} style={{ margin: 0 }}>
            5. Data ownership
          </Typography.Title>
          <Typography.Paragraph>
            You retain ownership of the data you input. You grant WorklyHub permission to process that data to deliver the service.
          </Typography.Paragraph>
        </LegalSection>

        <LegalSection>
          <Typography.Title level={4} style={{ margin: 0 }}>
            6. Termination
          </Typography.Title>
          <Typography.Paragraph>
            We may suspend or terminate access if these terms are violated or if required by law.
          </Typography.Paragraph>
        </LegalSection>

        <LegalSection>
          <Typography.Title level={4} style={{ margin: 0 }}>
            7. Contact
          </Typography.Title>
          <Typography.Paragraph>
            If you have questions about these terms, contact us at support@worklyhub.com.
          </Typography.Paragraph>
        </LegalSection>
      </LegalTemplate>
    );
  }
}

export default TermsPage;
