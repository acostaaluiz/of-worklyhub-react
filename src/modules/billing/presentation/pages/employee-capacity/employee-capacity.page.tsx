import React from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  InputNumber,
  Row,
  Segmented,
  Space,
  Statistic,
  Typography,
  message,
} from "antd";

import { i18n as appI18n } from "@core/i18n";
import { formatMoney } from "@core/utils/currency";
import { navigateTo } from "@core/navigation/navigation.service";
import { BasePage } from "@shared/base/base.page";
import { BaseTemplate } from "@shared/base/base.template";
import { billingService } from "@modules/billing/services/billing.service";
import type {
  BillingCycle,
  WorkspaceEmployeeCapacity,
} from "@modules/billing/services/billing-api";
import {
  clearAiTokenTopupSelection,
  clearEmployeeAddonSelection,
  setBillingCheckoutKind,
  setEmployeeAddonSelection,
} from "@modules/billing/services/billing-checkout-session";

type State = {
  initialized: boolean;
  isLoading: boolean;
  error?: DataValue;
  capacity?: WorkspaceEmployeeCapacity;
  quantity: number;
  interval: BillingCycle;
};

const YEARLY_MULTIPLIER = 12;

export class EmployeeCapacityPage extends BasePage<{}, State> {
  protected override options = {
    title: `${appI18n.t("billing.pageTitles.employeeCapacity")} | WorklyHub`,
    requiresAuth: true,
  };

  public state: State = {
    initialized: false,
    isLoading: false,
    error: undefined,
    capacity: undefined,
    quantity: 1,
    interval: "monthly",
  };

  protected override async onInit(): Promise<void> {
    await this.runAsync(async () => {
      const capacity = await billingService.fetchWorkspaceEmployeeCapacity();
      this.setSafeState({ capacity });
    });
  }

  private getUnitPriceCents(capacity: WorkspaceEmployeeCapacity): number {
    return this.state.interval === "yearly"
      ? capacity.pricing.addonUnitPriceCents.yearly
      : capacity.pricing.addonUnitPriceCents.monthly;
  }

  private getTotalPriceCents(capacity: WorkspaceEmployeeCapacity): number {
    return this.getUnitPriceCents(capacity) * this.state.quantity;
  }

  private getProjectedTotalEmployees(capacity: WorkspaceEmployeeCapacity): number {
    return capacity.limits.totalEmployees + this.state.quantity;
  }

  private handleContinueCheckout = () => {
    const capacity = this.state.capacity;
    if (!capacity) {
      message.error(appI18n.t("billing.employeeCapacity.messages.loadError"));
      return;
    }

    const unitPriceCents = this.getUnitPriceCents(capacity);
    setBillingCheckoutKind("employee_addon");
    clearAiTokenTopupSelection();
    setEmployeeAddonSelection({
      quantity: this.state.quantity,
      interval: this.state.interval,
      planName: capacity.plan.name,
      currency: capacity.plan.currency,
      unitPriceCents,
      baseEmployees: capacity.limits.baseEmployees,
      addonEmployees: capacity.limits.addonEmployees,
      activeEmployees: capacity.limits.activeEmployees,
      totalEmployees: capacity.limits.totalEmployees,
    });

    try {
      sessionStorage.removeItem("billing.selectedPlanId");
    } catch {
      // no-op
    }

    navigateTo("/billing/checkout");
  };

  private handleBackToPlans = () => {
    clearEmployeeAddonSelection();
    clearAiTokenTopupSelection();
    setBillingCheckoutKind("plan_subscription");
    navigateTo("/billing/plans");
  };

  protected override renderPage(): React.ReactNode {
    const capacity = this.state.capacity;

    return (
      <BaseTemplate
        content={
          <div data-cy="billing-employee-capacity-page">
            <Card className="surface">
              <Space direction="vertical" size={20} style={{ width: "100%" }}>
                <div>
                  <Typography.Title level={2} style={{ margin: 0 }}>
                    {appI18n.t("billing.employeeCapacity.title")}
                  </Typography.Title>
                  <Typography.Text type="secondary">
                    {appI18n.t("billing.employeeCapacity.subtitle")}
                  </Typography.Text>
                </div>

                {!capacity ? null : (
                  <>
                    <Alert
                      type="info"
                      showIcon
                      message={appI18n.t("billing.employeeCapacity.planInfo", {
                        plan: capacity.plan.name,
                      })}
                      description={appI18n.t("billing.employeeCapacity.capacityInfo", {
                        base: capacity.limits.baseEmployees,
                        extra: capacity.limits.addonEmployees,
                        total: capacity.limits.totalEmployees,
                        used: capacity.limits.activeEmployees,
                        remaining: capacity.limits.remainingEmployees,
                      })}
                    />

                    <Row gutter={[12, 12]}>
                      <Col xs={24} md={12} lg={6}>
                        <Card size="small">
                          <Statistic
                            title={appI18n.t("billing.employeeCapacity.cards.base")}
                            value={capacity.limits.baseEmployees}
                          />
                        </Card>
                      </Col>
                      <Col xs={24} md={12} lg={6}>
                        <Card size="small">
                          <Statistic
                            title={appI18n.t("billing.employeeCapacity.cards.extra")}
                            value={capacity.limits.addonEmployees}
                          />
                        </Card>
                      </Col>
                      <Col xs={24} md={12} lg={6}>
                        <Card size="small">
                          <Statistic
                            title={appI18n.t("billing.employeeCapacity.cards.used")}
                            value={capacity.limits.activeEmployees}
                          />
                        </Card>
                      </Col>
                      <Col xs={24} md={12} lg={6}>
                        <Card size="small">
                          <Statistic
                            title={appI18n.t("billing.employeeCapacity.cards.available")}
                            value={capacity.limits.remainingEmployees}
                          />
                        </Card>
                      </Col>
                    </Row>

                    <Card size="small">
                      <Space
                        direction="vertical"
                        size={14}
                        style={{ width: "100%" }}
                      >
                        <Typography.Text strong>
                          {appI18n.t("billing.employeeCapacity.selector.title")}
                        </Typography.Text>

                        <Segmented
                          value={this.state.interval}
                          onChange={(value) =>
                            this.setSafeState({
                              interval: value as BillingCycle,
                            })
                          }
                          options={[
                            {
                              label: appI18n.t(
                                "billing.employeeCapacity.selector.interval.monthly"
                              ),
                              value: "monthly",
                            },
                            {
                              label: appI18n.t(
                                "billing.employeeCapacity.selector.interval.yearly"
                              ),
                              value: "yearly",
                            },
                          ]}
                        />

                        <Space
                          direction="horizontal"
                          size={12}
                          align="center"
                          style={{ flexWrap: "wrap" }}
                        >
                          <Typography.Text>
                            {appI18n.t("billing.employeeCapacity.selector.quantity")}
                          </Typography.Text>
                          <InputNumber
                            min={1}
                            max={50}
                            value={this.state.quantity}
                            onChange={(value) =>
                              this.setSafeState({
                                quantity:
                                  typeof value === "number" && value > 0
                                    ? Math.trunc(value)
                                    : 1,
                              })
                            }
                          />
                        </Space>

                        <Alert
                          type="success"
                          showIcon
                          message={appI18n.t(
                            "billing.employeeCapacity.selector.pricingTitle",
                            {
                              unitPrice: formatMoney(this.getUnitPriceCents(capacity), {
                                currency: capacity.plan.currency,
                              }),
                            }
                          )}
                          description={appI18n.t(
                            "billing.employeeCapacity.selector.pricingDescription",
                            {
                              quantity: this.state.quantity,
                              totalPrice: formatMoney(this.getTotalPriceCents(capacity), {
                                currency: capacity.plan.currency,
                              }),
                              totalEmployees:
                                this.getProjectedTotalEmployees(capacity),
                              interval:
                                this.state.interval === "yearly"
                                  ? appI18n.t(
                                      "billing.employeeCapacity.selector.interval.yearly"
                                    )
                                  : appI18n.t(
                                      "billing.employeeCapacity.selector.interval.monthly"
                                    ),
                              yearlyMultiplier: YEARLY_MULTIPLIER,
                            }
                          )}
                        />
                      </Space>
                    </Card>

                    <Row justify="space-between" gutter={[12, 12]}>
                      <Col>
                        <Button size="large" onClick={this.handleBackToPlans}>
                          {appI18n.t("billing.employeeCapacity.actions.back")}
                        </Button>
                      </Col>
                      <Col>
                        <Button
                          type="primary"
                          size="large"
                          onClick={this.handleContinueCheckout}
                        >
                          {appI18n.t(
                            "billing.employeeCapacity.actions.continue"
                          )}
                        </Button>
                      </Col>
                    </Row>
                  </>
                )}
              </Space>
            </Card>
          </div>
        }
      />
    );
  }
}

export default EmployeeCapacityPage;
