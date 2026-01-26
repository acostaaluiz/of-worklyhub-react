import { getMaskConfig } from "./mask";

export type FormatMoneyOptions = {
  locale?: string;
  currency?: string;
  showSymbol?: boolean;
};

export function formatMoney(cents?: number | null, opts?: FormatMoneyOptions): string {
  if (cents == null) return "—";
  const cfg = getMaskConfig();
  const locale = opts?.locale ?? cfg.currencyLocale ?? "en-US";
  const currency = opts?.currency ?? cfg.currencyCode ?? "USD";
  const precision = cfg.currencyPrecision ?? 2;
  const divisor = Math.pow(10, precision);

  try {
    const formatter = new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: precision,
      maximumFractionDigits: precision,
    });
    // cents -> units
    const units = cents / divisor;
    return formatter.format(units);
  } catch (err) {
    // fallback simple format
    return `${currency} ${(cents / divisor).toFixed(precision)}`;
  }
}

export function formatMoneyPlain(cents?: number | null): string {
  if (cents == null) return "—";
  const cfg = getMaskConfig();
  const precision = cfg.currencyPrecision ?? 2;
  const divisor = Math.pow(10, precision);
  return `${(cents / divisor).toFixed(precision)}`;
}

export default { formatMoney, formatMoneyPlain };



