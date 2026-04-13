import React from "react";
import { i18n as appI18n } from "@core/i18n";
import type { BillingCycle } from "@modules/billing/services/billing-api";

import { ToggleContainer, ToggleButton } from "./billing-cycle-toggle.component.styles";

type BillingCycleToggleProps = {
  value: BillingCycle;
  onChange: (value: BillingCycle) => void;
  compact?: boolean;
  fullWidth?: boolean;
  monthlyLabel?: string;
  yearlyLabel?: string;
  dataCyPrefix?: string;
};

export function BillingCycleToggle({
  value,
  onChange,
  compact = false,
  fullWidth = false,
  monthlyLabel,
  yearlyLabel,
  dataCyPrefix = "billing-cycle-toggle",
}: BillingCycleToggleProps): React.ReactNode {
  const monthlyText =
    monthlyLabel ?? appI18n.t("billing.orderSummary.cycle.monthly");
  const yearlyText =
    yearlyLabel ?? appI18n.t("billing.orderSummary.cycle.yearly");

  return (
    <ToggleContainer $fullWidth={fullWidth} data-cy={dataCyPrefix}>
      <ToggleButton
        type="button"
        $active={value === "monthly"}
        $compact={compact}
        onClick={() => onChange("monthly")}
        data-cy={`${dataCyPrefix}-monthly`}
      >
        {monthlyText}
      </ToggleButton>
      <ToggleButton
        type="button"
        $active={value === "yearly"}
        $compact={compact}
        onClick={() => onChange("yearly")}
        data-cy={`${dataCyPrefix}-yearly`}
      >
        {yearlyText}
      </ToggleButton>
    </ToggleContainer>
  );
}

export default BillingCycleToggle;
