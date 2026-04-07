import React from "react";
import { BasePage } from "@shared/base/base.page";
import { PlanSelectionTemplate } from "../../templates/plan-selection/plan-selection.template";
import { ConfirmationModal } from "@shared/ui/components/confirmation-modal/confirmation-modal.component";
import { i18n as appI18n } from "@core/i18n";
import { usersService } from "@modules/users/services/user.service";
import { usersAuthService } from "@modules/users/services/auth.service";
import { message } from "antd";
import { navigateTo } from "@core/navigation/navigation.service";
import { billingService } from "@modules/billing/services/billing.service";
import type { BillingPlan } from "@modules/billing/services/billing-api";
import {
  clearAiTokenTopupSelection,
  clearEmployeeAddonSelection,
  setBillingCheckoutKind,
} from "@modules/billing/services/billing-checkout-session";

export class PlanSelectionPage extends BasePage<{}, { initialized: boolean; isLoading: boolean; error?: DataValue; plans?: BillingPlan[]; confirmOpen?: boolean; pendingPlanId?: string; pendingPlanName?: string; recommendedPlanId?: string }> {
  protected override options = {
    title: `${appI18n.t("billing.pageTitles.plans")} | WorklyHub`,
    requiresAuth: true,
  };

  public state: { initialized: boolean; isLoading: boolean; error?: DataValue; plans?: BillingPlan[]; confirmOpen?: boolean; pendingPlanId?: string; pendingPlanName?: string; recommendedPlanId?: string } = {
    initialized: false,
    isLoading: false,
    error: undefined,
    plans: undefined,
    confirmOpen: false,
    pendingPlanId: undefined,
    pendingPlanName: undefined,
    recommendedPlanId: undefined,
  };

  protected override async onInit(): Promise<void> {
    await this.runAsync(async () => {
      const plansRes = await billingService.fetchPlans();
      const plans = plansRes?.plans ?? [];
      const planList = plans ?? [];

      const computeRecommended = (planList: BillingPlan[], rawUserPlan: DataValue) => {
        if (!planList || planList.length === 0) return undefined;

        // normalize list sorted by id
        const sorted = [...planList].sort((a, b) => Number(a.dbId ?? a.id) - Number(b.dbId ?? b.id));

        // try to match by numeric id, or by title/code
        const userVal = rawUserPlan ?? undefined;
        if (userVal == null) return String(sorted[0].id); // recommend starter when no user plan

        const s = String(userVal).toLowerCase();

        // find index by id or title
        let idx = sorted.findIndex((p) => String(p.id) === String(userVal) || String(p.dbId) === String(userVal));
        if (idx === -1) idx = sorted.findIndex((p) => (p.name ?? "").toLowerCase() === s);
        if (idx === -1) idx = sorted.findIndex((p) => (p as DataMap).code === userVal || (p as DataMap).code === s);

        // if found, recommend next tier; if already at highest, keep current
        if (idx >= 0) {
          const next = sorted[idx + 1];
          if (next) return String(next.id);
          // user is on highest plan, recommend staying on it
          return String(sorted[idx].id);
        }

        // try numeric fallback: userVal + 1
        const numeric = Number(userVal);
        if (!isNaN(numeric)) {
          const byId = sorted.find((p) => Number(p.id) === numeric + 1 || Number(p.dbId) === numeric + 1);
          if (byId) return String(byId.id);
        }

        // fallback: find first with highlight or first plan
        const highlighted = sorted.find((p) => !!(p.recommended ?? (p as DataMap).highlight)) ?? sorted[0];
        return highlighted ? String(highlighted.id) : undefined;
      };

      // determine recommended plan based on user's current plan
      let recommendedPlanId: string | undefined = undefined;
      try {
        const profile = usersService.getProfileValue();
        let userPlanId = (profile as DataMap)?.planId ?? (profile as DataMap)?.plan_id ?? (profile as DataMap)?.plan ?? undefined;

        // if not in cache, attempt to fetch from server (best-effort)
        if (userPlanId == null) {
          const session = usersAuthService.getSessionValue();
          if (session?.email) {
            try {
              const fetched = await usersService.fetchByEmail(session.email);
              userPlanId = (fetched as DataMap)?.planId ?? (fetched as DataMap)?.plan_id ?? (fetched as DataMap)?.plan ?? undefined;
            } catch {
              // ignore
            }
          }
        }

        recommendedPlanId = computeRecommended(planList, userPlanId);
      } catch {
        // ignore recommendation errors
      }

      this.setSafeState({ plans: planList, recommendedPlanId });
    }, { swallowError: true });
  }

  protected override renderPage(): React.ReactNode {
    return (
      <>
        <PlanSelectionTemplate plans={this.state.plans} onSelectPlan={this.handleSelectPlan} recommendedPlanId={this.state.recommendedPlanId} />

        <ConfirmationModal
          open={!!this.state.confirmOpen}
          title={appI18n.t("billing.planSelection.confirm.title")}
          description={this.state.pendingPlanName ? appI18n.t("billing.planSelection.confirm.description", { planName: this.state.pendingPlanName }) : undefined}
          confirmLabel={appI18n.t("billing.planSelection.confirm.confirmLabel")}
          cancelLabel={appI18n.t("billing.planSelection.confirm.cancelLabel")}
          onClose={this.handleCloseConfirm}
          onConfirm={this.handleConfirmSelect}
        />
      </>
    );
  }

  private handleSelectPlan = (planId: string, interval?: "monthly" | "yearly") => {
    const plan = this.state.plans?.find((p) => String(p.id) === planId);
    const name = plan?.name ?? planId;
    try {
      sessionStorage.setItem("billing.selectedPlanInterval", interval ?? "monthly");
    } catch {
      // ignore
    }
    this.setSafeState({ confirmOpen: true, pendingPlanId: planId, pendingPlanName: name });
  };

  private handleCloseConfirm = () => {
    this.setSafeState({ confirmOpen: false, pendingPlanId: undefined, pendingPlanName: undefined });
  };

  private handleConfirmSelect = async () => {
    const planId = this.state.pendingPlanId;
    if (!planId) {
      this.handleCloseConfirm();
      return;
    }

    // persist selected plan for checkout page to read
    try {
      setBillingCheckoutKind("plan_subscription");
      clearEmployeeAddonSelection();
      clearAiTokenTopupSelection();
      sessionStorage.setItem("billing.selectedPlanId", String(planId));
      // also ensure interval is present (in case selection step failed to set it)
      const maybeInterval = sessionStorage.getItem("billing.selectedPlanInterval");
      if (!maybeInterval) {
        try {
          sessionStorage.setItem("billing.selectedPlanInterval", "monthly");
        } catch {
          // ignore
        }
      }
    } catch {
      // ignore
    }

    this.setSafeState({ confirmOpen: false, pendingPlanId: undefined, pendingPlanName: undefined });
    message.success(appI18n.t("billing.planSelection.messages.selectedSuccess"));
    try {
      navigateTo("/billing/checkout");
    } catch {
      // ignore navigation errors
    }
  };
}

export default PlanSelectionPage;
