export type FormatMoneyOptions = {
  locale?: string;
  currency?: string;
  showSymbol?: boolean;
};

export function formatMoney(cents?: number | null, opts?: FormatMoneyOptions): string {
  if (cents == null) return "—";
  const locale = opts?.locale ?? "pt-BR";
  const currency = opts?.currency ?? "BRL";

  try {
    const formatter = new Intl.NumberFormat(locale, { style: "currency", currency });
    // cents -> units
    const units = cents / 100;
    return formatter.format(units);
  } catch (err) {
    // fallback simple format
    return `R$ ${(cents / 100).toFixed(2)}`;
  }
}

export function formatMoneyPlain(cents?: number | null): string {
  if (cents == null) return "—";
  return `${(cents / 100).toFixed(2)}`;
}

export default { formatMoney, formatMoneyPlain };
