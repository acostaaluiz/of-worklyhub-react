import React from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Divider,
  Row,
  Space,
  Typography,
  message,
} from "antd";
import { CheckCircle2, Sparkles } from "lucide-react";

import { i18n as appI18n } from "@core/i18n";
import { formatMoney } from "@core/utils/currency";
import { navigateTo } from "@core/navigation/navigation.service";
import { BasePage } from "@shared/base/base.page";
import { BaseTemplate } from "@shared/base/base.template";
import {
  clearEmployeeAddonSelection,
  setAiTokenTopupSelection,
  setBillingCheckoutKind,
} from "@modules/billing/services/billing-checkout-session";

type AiTokenPackageOption = {
  id: string;
  tokens: number;
  currency: string;
  priceCents: number;
};

type State = {
  initialized: boolean;
  isLoading: boolean;
  selectedPackageId: string;
};

const PACKAGE_OPTIONS: AiTokenPackageOption[] = [
  { id: "tokens_1000", tokens: 1000, currency: "USD", priceCents: 1000 },
  { id: "tokens_2500", tokens: 2500, currency: "USD", priceCents: 2400 },
  { id: "tokens_5000", tokens: 5000, currency: "USD", priceCents: 4500 },
  { id: "tokens_10000", tokens: 10000, currency: "USD", priceCents: 8500 },
  { id: "tokens_20000", tokens: 20000, currency: "USD", priceCents: 16000 },
];

export class AiTokenPackagesPage extends BasePage<{}, State> {
  protected override options = {
    title: `${appI18n.t("billing.pageTitles.aiTokenTopup")} | WorklyHub`,
    requiresAuth: true,
  };

  public state: State = {
    initialized: false,
    isLoading: false,
    selectedPackageId: "tokens_5000",
  };

  private getSelectedPackage(): AiTokenPackageOption | undefined {
    return PACKAGE_OPTIONS.find(
      (entry) => entry.id === this.state.selectedPackageId
    );
  }

  private handleContinueCheckout = () => {
    const selectedPackage = this.getSelectedPackage();
    if (!selectedPackage) {
      message.error(appI18n.t("billing.aiTokenTopup.messages.selectPackage"));
      return;
    }

    setBillingCheckoutKind("ai_token_topup");
    clearEmployeeAddonSelection();
    setAiTokenTopupSelection({
      packageId: selectedPackage.id,
      tokens: selectedPackage.tokens,
      currency: selectedPackage.currency,
      priceCents: selectedPackage.priceCents,
    });

    try {
      sessionStorage.removeItem("billing.selectedPlanId");
      sessionStorage.removeItem("billing.selectedPlanInterval");
    } catch {
      // no-op
    }

    navigateTo("/billing/checkout");
  };

  private handleBackToAiTab = () => {
    navigateTo("/users?tab=ai-tokens");
  };

  protected override renderPage(): React.ReactNode {
    const selectedPackage = this.getSelectedPackage();

    return (
      <BaseTemplate
        content={
          <Card className="surface" data-cy="billing-ai-token-topup-page">
            <Space direction="vertical" size={20} style={{ width: "100%" }}>
              <div>
                <Typography.Title level={2} style={{ margin: 0 }}>
                  {appI18n.t("billing.aiTokenTopup.title")}
                </Typography.Title>
                <Typography.Text type="secondary">
                  {appI18n.t("billing.aiTokenTopup.subtitle")}
                </Typography.Text>
              </div>

              <Alert
                type="info"
                showIcon
                icon={<Sparkles size={16} />}
                message={appI18n.t("billing.aiTokenTopup.info.title")}
                description={appI18n.t("billing.aiTokenTopup.info.description")}
              />

              <Row gutter={[12, 12]}>
                {PACKAGE_OPTIONS.map((entry) => {
                  const isSelected = entry.id === this.state.selectedPackageId;
                  return (
                    <Col xs={24} md={12} lg={8} key={entry.id}>
                      <Card
                        hoverable
                        onClick={() =>
                          this.setSafeState({ selectedPackageId: entry.id })
                        }
                        style={{
                          borderColor: isSelected
                            ? "var(--color-primary)"
                            : "var(--color-border)",
                          boxShadow: isSelected
                            ? "0 0 0 1px color-mix(in srgb, var(--color-primary) 45%, transparent)"
                            : "none",
                          cursor: "pointer",
                        }}
                      >
                        <Space
                          direction="vertical"
                          size={8}
                          style={{ width: "100%" }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: 8,
                            }}
                          >
                            <Typography.Text strong>
                              {appI18n.t("billing.aiTokenTopup.package.tokens", {
                                count: entry.tokens,
                              })}
                            </Typography.Text>
                            {isSelected ? (
                              <CheckCircle2
                                size={16}
                                style={{ color: "var(--color-primary)" }}
                              />
                            ) : null}
                          </div>

                          <Typography.Title
                            level={4}
                            style={{ margin: 0 }}
                          >
                            {formatMoney(entry.priceCents, {
                              currency: entry.currency,
                            })}
                          </Typography.Title>

                          <Typography.Text type="secondary">
                            {appI18n.t("billing.aiTokenTopup.package.pricePerToken", {
                              value: formatMoney(
                                Math.round(entry.priceCents / entry.tokens),
                                { currency: entry.currency }
                              ),
                            })}
                          </Typography.Text>
                        </Space>
                      </Card>
                    </Col>
                  );
                })}
              </Row>

              <Divider style={{ margin: 0 }} />

              <Alert
                type="success"
                showIcon
                message={appI18n.t("billing.aiTokenTopup.summary.title", {
                  tokens: selectedPackage?.tokens ?? 0,
                })}
                description={appI18n.t("billing.aiTokenTopup.summary.description", {
                  price: selectedPackage
                    ? formatMoney(selectedPackage.priceCents, {
                        currency: selectedPackage.currency,
                      })
                    : formatMoney(0),
                })}
              />

              <Row justify="space-between" gutter={[12, 12]}>
                <Col>
                  <Button size="large" onClick={this.handleBackToAiTab}>
                    {appI18n.t("billing.aiTokenTopup.actions.back")}
                  </Button>
                </Col>
                <Col>
                  <Button
                    type="primary"
                    size="large"
                    onClick={this.handleContinueCheckout}
                  >
                    {appI18n.t("billing.aiTokenTopup.actions.continue")}
                  </Button>
                </Col>
              </Row>
            </Space>
          </Card>
        }
      />
    );
  }
}

export default AiTokenPackagesPage;
