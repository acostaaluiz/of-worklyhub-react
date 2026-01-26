export type FinanceValueStatus = "positive" | "negative" | "alert";

export type FinanceValueContext =
  | "in"
  | "out"
  | "income"
  | "expense"
  | "fixed"
  | "neutral";

type FinanceValueRuleConfig = {
  alertMin: number;
  alertMax: number;
};

const DEFAULT_RULE: FinanceValueRuleConfig = {
  alertMin: 0,
  alertMax: 0,
};

const NEGATIVE_CONTEXTS = new Set<FinanceValueContext>(["out", "expense", "fixed"]);

let cachedConfig: FinanceValueRuleConfig | null = null;

function readEnvNumber(key: string): number | undefined {
  const env = (import.meta as unknown as {
    env?: Record<string, string | number | boolean | undefined>;
  }).env;
  const value = env?.[key];
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function normalizeBounds(minValue: number, maxValue: number): FinanceValueRuleConfig {
  if (minValue <= maxValue) return { alertMin: minValue, alertMax: maxValue };
  return { alertMin: maxValue, alertMax: minValue };
}

export function getFinanceValueRuleConfig(): FinanceValueRuleConfig {
  if (cachedConfig) return cachedConfig;

  const alertMin = readEnvNumber("VITE_FINANCE_ALERT_MIN") ?? DEFAULT_RULE.alertMin;
  const alertMax = readEnvNumber("VITE_FINANCE_ALERT_MAX") ?? DEFAULT_RULE.alertMax;

  cachedConfig = normalizeBounds(alertMin, alertMax);
  return cachedConfig;
}

export function getFinanceSignedValue(value: number, context?: FinanceValueContext): number {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  if (numeric < 0) return numeric;
  if (context && NEGATIVE_CONTEXTS.has(context)) return -numeric;
  return numeric;
}

export function getFinanceValueStatus(
  value: number,
  options?: Partial<FinanceValueRuleConfig> & { context?: FinanceValueContext }
): FinanceValueStatus {
  const cfg = getFinanceValueRuleConfig();
  const bounds = normalizeBounds(
    options?.alertMin ?? cfg.alertMin,
    options?.alertMax ?? cfg.alertMax
  );

  const signed = getFinanceSignedValue(value, options?.context);
  if (signed > bounds.alertMax) return "positive";
  if (signed < bounds.alertMin) return "negative";
  return "alert";
}

export function financeStatusToCssVar(status: FinanceValueStatus): string {
  switch (status) {
    case "positive":
      return "var(--color-finance-positive)";
    case "negative":
      return "var(--color-finance-negative)";
    case "alert":
    default:
      return "var(--color-finance-alert)";
  }
}

export function getFinanceValueColor(
  value: number,
  options?: Partial<FinanceValueRuleConfig> & { context?: FinanceValueContext }
): string {
  return financeStatusToCssVar(getFinanceValueStatus(value, options));
}
