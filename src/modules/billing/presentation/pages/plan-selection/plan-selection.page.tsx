import React from "react";
import { BasePage } from "@shared/base/base.page";
import { PlanSelectionTemplate } from "../../templates/plan-selection/plan-selection.template";
import { applicationService } from "@core/application/application.service";
import type { ApplicationPlanItem } from "@core/application/application-api";
import { ConfirmationModal } from "@shared/ui/components/confirmation-modal/confirmation-modal.component";
import { usersService } from "@modules/users/services/user.service";
import { usersAuthService } from "@modules/users/services/auth.service";
import { message } from "antd";
import { navigateTo } from "@core/navigation/navigation.service";

export class PlanSelectionPage extends BasePage<{}, { initialized: boolean; isLoading: boolean; error?: unknown; plans?: ApplicationPlanItem[]; confirmOpen?: boolean; pendingPlanId?: string; pendingPlanName?: string; recommendedPlanId?: string }> {
  protected override options = {
    title: "Plans | WorklyHub",
    requiresAuth: true,
  };

  public state: { initialized: boolean; isLoading: boolean; error?: unknown; plans?: ApplicationPlanItem[]; confirmOpen?: boolean; pendingPlanId?: string; pendingPlanName?: string; recommendedPlanId?: string } = {
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
      const plans = await applicationService.fetchPlans();
      const planList = plans ?? [];

      const computeRecommended = (planList: ApplicationPlanItem[], rawUserPlan: unknown) => {
        if (!planList || planList.length === 0) return undefined;

        // normalize list sorted by id
        const sorted = [...planList].sort((a, b) => Number(a.id) - Number(b.id));

        // try to match by numeric id, or by title/code
        const userVal = rawUserPlan ?? undefined;
        if (userVal == null) return String(sorted[0].id); // recommend starter when no user plan

        const s = String(userVal).toLowerCase();

        // find index by id or title
        let idx = sorted.findIndex((p) => String(p.id) === String(userVal));
        if (idx === -1) idx = sorted.findIndex((p) => (p.title ?? "").toLowerCase() === s);
        if (idx === -1) idx = sorted.findIndex((p) => (p as any).code === userVal || (p as any).code === s);

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
          const byId = sorted.find((p) => Number(p.id) === numeric + 1);
          if (byId) return String(byId.id);
        }

        // fallback: find first with highlight or first plan
        const highlighted = sorted.find((p) => !!(p as any).highlight) ?? sorted[0];
        return highlighted ? String(highlighted.id) : undefined;
      };

      // determine recommended plan based on user's current plan
      let recommendedPlanId: string | undefined = undefined;
      try {
        const profile = usersService.getProfileValue();
        let userPlanId = (profile as any)?.planId ?? (profile as any)?.plan_id ?? (profile as any)?.plan ?? undefined;

        // if not in cache, attempt to fetch from server (best-effort)
        if (userPlanId == null) {
          const session = usersAuthService.getSessionValue();
          if (session?.email) {
            try {
              const fetched = await usersService.fetchByEmail(session.email);
              userPlanId = (fetched as any)?.planId ?? (fetched as any)?.plan_id ?? (fetched as any)?.plan ?? undefined;
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
    }, { setLoading: false, swallowError: true });
  }

  protected override renderPage(): React.ReactNode {
    return (
      <>
        <PlanSelectionTemplate plans={this.state.plans} onSelectPlan={this.handleSelectPlan} recommendedPlanId={this.state.recommendedPlanId} />

        <ConfirmationModal
          open={!!this.state.confirmOpen}
          title={this.state.pendingPlanName ? `Confirm plan selection` : "Confirm"}
          description={this.state.pendingPlanName ? `Do you really want to select the ${this.state.pendingPlanName} plan?` : undefined}
          confirmLabel="Yes"
          cancelLabel="No"
          onClose={this.handleCloseConfirm}
          onConfirm={this.handleConfirmSelect}
        />
      </>
    );
  }

  private handleSelectPlan = (planId: string, interval?: "monthly" | "yearly") => {
    const plan = this.state.plans?.find((p) => String(p.id) === planId);
    const name = plan?.title ?? planId;
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

    const session = usersAuthService.getSessionValue();
    const email = session?.email;
    if (!email) {
      message.error("Unable to determine your email. Please sign in again.");
      this.handleCloseConfirm();
      return;
    }

    await this.runAsync(async () => {
      // call users service to set plan (API expects numeric plan id)
      await usersService.setPlan(email, Number(planId));
      // refresh profile
      try {
        await usersService.fetchByEmail(email);
      } catch {
        // ignore
      }
      // recompute recommendation immediately using updated profile
      try {
        const planList = this.state.plans ?? [];
        const profile = usersService.getProfileValue();
        const userPlanId = (profile as any)?.planId ?? (profile as any)?.plan_id ?? (profile as any)?.plan ?? undefined;

        const sorted = [...planList].sort((a, b) => Number(a.id) - Number(b.id));
        let rec: string | undefined = undefined;
        if (sorted.length > 0) {
          if (userPlanId == null) {
            rec = String(sorted[0].id);
          } else {
            const s = String(userPlanId).toLowerCase();
            let idx = sorted.findIndex((p) => String(p.id) === String(userPlanId));
            if (idx === -1) idx = sorted.findIndex((p) => (p.title ?? "").toLowerCase() === s);
            if (idx === -1) idx = sorted.findIndex((p) => (p as any).code === userPlanId || (p as any).code === s);
            if (idx >= 0) {
              const next = sorted[idx + 1];
              if (next) rec = String(next.id);
              else rec = String(sorted[idx].id);
            }
            if (!rec) {
              const numeric = Number(userPlanId);
              if (!isNaN(numeric)) {
                const byId = sorted.find((p) => Number(p.id) === numeric + 1);
                if (byId) rec = String(byId.id);
              }
            }
            if (!rec) {
              const highlighted = sorted.find((p) => !!(p as any).highlight) ?? sorted[0];
              rec = highlighted ? String(highlighted.id) : undefined;
            }
          }
        }
        this.setSafeState({ confirmOpen: false, pendingPlanId: undefined, pendingPlanName: undefined, recommendedPlanId: rec });
      } catch {
        this.setSafeState({ confirmOpen: false, pendingPlanId: undefined, pendingPlanName: undefined });
      }
      message.success("Plan updated successfully");
      // navigate to checkout so user can continue with payment flow
      try {
        navigateTo("/billing/checkout");
      } catch {
        // ignore navigation errors
      }
    });
  };
}

export default PlanSelectionPage;
