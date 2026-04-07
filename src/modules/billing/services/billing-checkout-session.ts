import type { BillingCycle } from "./billing-api";

export type BillingCheckoutKind =
  | "plan_subscription"
  | "employee_addon"
  | "ai_token_topup";

export type EmployeeAddonSelection = {
  quantity: number;
  interval: BillingCycle;
  planName: string;
  currency: string;
  unitPriceCents: number;
  baseEmployees: number;
  addonEmployees: number;
  activeEmployees: number;
  totalEmployees: number;
};

export type AiTokenTopupSelection = {
  packageId: string;
  tokens: number;
  currency: string;
  priceCents: number;
};

const CHECKOUT_KIND_KEY = "billing.checkoutKind";
const EMPLOYEE_ADDON_KEY = "billing.employeeAddonSelection";
const AI_TOKEN_TOPUP_KEY = "billing.aiTokenTopupSelection";
const CHECKOUT_SESSION_UPDATED_EVENT = "worklyhub:billing-checkout-session-updated";

function asPositiveInt(value: unknown, fallback: number): number {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  const normalized = Math.trunc(numeric);
  return normalized > 0 ? normalized : fallback;
}

function notifyCheckoutSessionUpdated(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(CHECKOUT_SESSION_UPDATED_EVENT));
}

export function onBillingCheckoutSessionChange(
  listener: () => void
): () => void {
  if (typeof window === "undefined") return () => undefined;
  const handler = () => listener();
  window.addEventListener(CHECKOUT_SESSION_UPDATED_EVENT, handler);
  return () => {
    window.removeEventListener(CHECKOUT_SESSION_UPDATED_EVENT, handler);
  };
}

export function setBillingCheckoutKind(kind: BillingCheckoutKind): void {
  try {
    sessionStorage.setItem(CHECKOUT_KIND_KEY, kind);
    notifyCheckoutSessionUpdated();
  } catch {
    // no-op
  }
}

export function getBillingCheckoutKind(): BillingCheckoutKind {
  try {
    const raw = sessionStorage.getItem(CHECKOUT_KIND_KEY);
    if (raw === "employee_addon") return "employee_addon";
    if (raw === "ai_token_topup") return "ai_token_topup";
    return "plan_subscription";
  } catch {
    return "plan_subscription";
  }
}

export function setEmployeeAddonSelection(selection: EmployeeAddonSelection): void {
  try {
    sessionStorage.setItem(EMPLOYEE_ADDON_KEY, JSON.stringify(selection));
    notifyCheckoutSessionUpdated();
  } catch {
    // no-op
  }
}

export function getEmployeeAddonSelection(): EmployeeAddonSelection | null {
  try {
    const raw = sessionStorage.getItem(EMPLOYEE_ADDON_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<EmployeeAddonSelection>;
    const quantity = asPositiveInt(parsed.quantity, 1);
    const interval: BillingCycle =
      parsed.interval === "yearly" ? "yearly" : "monthly";
    const planName = String(parsed.planName ?? "").trim();
    const currency = String(parsed.currency ?? "USD").trim() || "USD";
    const unitPriceCents = asPositiveInt(parsed.unitPriceCents, 0);
    const baseEmployees = Math.max(0, Math.trunc(Number(parsed.baseEmployees ?? 0)));
    const addonEmployees = Math.max(0, Math.trunc(Number(parsed.addonEmployees ?? 0)));
    const activeEmployees = Math.max(0, Math.trunc(Number(parsed.activeEmployees ?? 0)));
    const totalEmployees = Math.max(
      baseEmployees + addonEmployees,
      Math.trunc(Number(parsed.totalEmployees ?? 0))
    );

    if (!planName) return null;

    return {
      quantity,
      interval,
      planName,
      currency,
      unitPriceCents,
      baseEmployees,
      addonEmployees,
      activeEmployees,
      totalEmployees,
    };
  } catch {
    return null;
  }
}

export function clearEmployeeAddonSelection(): void {
  try {
    sessionStorage.removeItem(EMPLOYEE_ADDON_KEY);
    notifyCheckoutSessionUpdated();
  } catch {
    // no-op
  }
}

export function setAiTokenTopupSelection(selection: AiTokenTopupSelection): void {
  try {
    sessionStorage.setItem(AI_TOKEN_TOPUP_KEY, JSON.stringify(selection));
    notifyCheckoutSessionUpdated();
  } catch {
    // no-op
  }
}

export function getAiTokenTopupSelection(): AiTokenTopupSelection | null {
  try {
    const raw = sessionStorage.getItem(AI_TOKEN_TOPUP_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AiTokenTopupSelection>;
    const packageId = String(parsed.packageId ?? "").trim();
    const tokens = asPositiveInt(parsed.tokens, 0);
    const currency = String(parsed.currency ?? "USD").trim() || "USD";
    const priceCents = asPositiveInt(parsed.priceCents, 0);
    if (!packageId || tokens <= 0 || priceCents <= 0) return null;

    return {
      packageId,
      tokens,
      currency,
      priceCents,
    };
  } catch {
    return null;
  }
}

export function clearAiTokenTopupSelection(): void {
  try {
    sessionStorage.removeItem(AI_TOKEN_TOPUP_KEY);
    notifyCheckoutSessionUpdated();
  } catch {
    // no-op
  }
}
