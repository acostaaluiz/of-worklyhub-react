import dayjs, { type Dayjs, type ConfigType } from "dayjs";

export type MaskConfig = {
  phoneMask: string;
  dateFormat: string;
  currencyLocale: string;
  currencyCode: string;
  currencyPrecision: number;
};

export type MoneyFormatOptions = {
  locale?: string;
  currency?: string;
  precision?: number;
};

export type MoneyInputOptions = MoneyFormatOptions & {
  fromCents?: boolean;
};

const DEFAULT_CONFIG: MaskConfig = {
  phoneMask: "(###) ###-####",
  dateFormat: "MM/DD/YYYY",
  currencyLocale: "en-US",
  currencyCode: "USD",
  currencyPrecision: 2,
};

let cachedConfig: MaskConfig | null = null;

function readEnvString(key: string): string | undefined {
  const env = (import.meta as unknown as {
    env?: Record<string, string | number | boolean | undefined>;
  }).env;
  const value = env?.[key];
  return typeof value === "string" && value.trim() ? value : undefined;
}

function readEnvNumber(key: string): number | undefined {
  const raw = readEnvString(key);
  if (!raw) return undefined;
  const num = Number(raw);
  return Number.isFinite(num) ? num : undefined;
}

export function getMaskConfig(): MaskConfig {
  if (cachedConfig) return cachedConfig;

  const phoneMask = readEnvString("VITE_PHONE_MASK") ?? DEFAULT_CONFIG.phoneMask;
  // ensure mask contains placeholder; fall back to default if misconfigured
  const safePhoneMask = phoneMask && phoneMask.includes("#") ? phoneMask : DEFAULT_CONFIG.phoneMask;
  const dateFormat = readEnvString("VITE_DATE_FORMAT") ?? DEFAULT_CONFIG.dateFormat;
  const currencyLocale =
    readEnvString("VITE_CURRENCY_LOCALE") ??
    readEnvString("VITE_LOCALE") ??
    DEFAULT_CONFIG.currencyLocale;
  const currencyCode = readEnvString("VITE_CURRENCY_CODE") ?? DEFAULT_CONFIG.currencyCode;
  const currencyPrecision =
    readEnvNumber("VITE_CURRENCY_PRECISION") ?? DEFAULT_CONFIG.currencyPrecision;

  cachedConfig = {
    phoneMask: safePhoneMask,
    dateFormat,
    currencyLocale,
    currencyCode,
    currencyPrecision,
  };

  return cachedConfig;
}

export function stripMask(value: string): string {
  return value.replace(/\D+/g, "");
}

export function applyMask(value: string, mask: string, placeholder = "#"): string {
  const str = value == null ? "" : String(value);
  const digits = stripMask(str);
  if (!digits) return "";

  // if there are more digits than placeholders in the mask, try to expand
  // a placeholder group (prefer the middle group) so we can fit all digits.
  let useMask = mask;
  // find groups with positions so we can replace the exact occurrence
  const groupsInfo: { start: number; length: number }[] = [];
  for (let i = 0; i < mask.length; i++) {
    if (mask[i] === placeholder) {
      let j = i;
      while (j < mask.length && mask[j] === placeholder) j++;
      groupsInfo.push({ start: i, length: j - i });
      i = j - 1;
    }
  }

  const totalPlaceholders = groupsInfo.reduce((s, g) => s + g.length, 0);
  // Special-case: common BR mobile pattern — when mask is (###) ###-#### (3,3,4)
  // and we have exactly one extra digit (11 total), shift one placeholder
  // from the first group to the second to produce (##) #####-####.
  if (
    // explicit common BR case: original mask groups 3,3,4 and input has 11 digits
    digits.length === 11 &&
    groupsInfo.length === 3 &&
    groupsInfo[0].length === 3 &&
    groupsInfo[1].length === 3 &&
    groupsInfo[2].length === 4
  ) {
    // use (##) #####-####
    useMask = "(##) #####-####";
  } else if (digits.length > totalPlaceholders && groupsInfo.length > 0) {
    const extra = digits.length - totalPlaceholders;
    const groupIndex = groupsInfo.length >= 3 ? 1 : groupsInfo.length - 1;
    const target = groupsInfo[groupIndex];
    const newLen = target.length + extra;
    // build new mask by replacing the specific group's range
    useMask = mask.slice(0, target.start) + placeholder.repeat(newLen) + mask.slice(target.start + target.length);
  }

  let out = "";
  let di = 0;

  for (const ch of useMask) {
    if (ch === placeholder) {
      if (di >= digits.length) break;
      out += digits[di];
      di += 1;
      continue;
    }
    // append separators only while there are remaining digits to place
    if (di >= digits.length) break;
    out += ch;
  }

  return out;
}

export function maskPhone(value?: string | null): string {
  const str = value == null ? "" : String(value);
  if (!str) return "";
  const { phoneMask } = getMaskConfig();
  return applyMask(str, phoneMask);
}

export function unmaskPhone(value?: string | null): string {
  const str = value == null ? "" : String(value);
  if (!str) return "";
  return stripMask(str);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getSeparators(locale: string): { group: string; decimal: string } {
  try {
    const parts = new Intl.NumberFormat(locale).formatToParts(1234567.89);
    const group = parts.find((p) => p.type === "group")?.value ?? ",";
    const decimal = parts.find((p) => p.type === "decimal")?.value ?? ".";
    return { group, decimal };
  } catch {
    return { group: ",", decimal: "." };
  }
}

export function parseMoney(value: string, options?: MoneyFormatOptions): number {
  const cfg = getMaskConfig();
  const locale = options?.locale ?? cfg.currencyLocale;
  const { group, decimal } = getSeparators(locale);

  const normalized = value
    .replace(new RegExp(escapeRegExp(group), "g"), "")
    .replace(new RegExp(escapeRegExp(decimal), "g"), ".")
    .replace(/[^0-9.-]/g, "");

  const num = Number(normalized);
  return Number.isFinite(num) ? num : 0;
}

export function formatMoney(value: number, options?: MoneyFormatOptions): string {
  const cfg = getMaskConfig();
  const locale = options?.locale ?? cfg.currencyLocale;
  const currency = options?.currency ?? cfg.currencyCode;
  const precision = options?.precision ?? cfg.currencyPrecision;

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: precision,
      maximumFractionDigits: precision,
    }).format(value);
  } catch {
    return value.toFixed(precision);
  }
}

export function formatMoneyCompact(value: number, options?: MoneyFormatOptions): string {
  const cfg = getMaskConfig();
  const locale = options?.locale ?? cfg.currencyLocale;
  const currency = options?.currency ?? cfg.currencyCode;
  const precision = options?.precision ?? 0;

  try {
    const nfOptions: Intl.NumberFormatOptions = {
      style: "currency",
      currency,
      notation: "compact",
      minimumFractionDigits: precision,
      maximumFractionDigits: precision,
    };

    return new Intl.NumberFormat(locale, nfOptions).format(value);
  } catch {
    return formatMoney(value, { ...options, precision });
  }
}

export function formatNumberCompact(value: number, localeOverride?: string): string {
  const cfg = getMaskConfig();
  const locale = localeOverride ?? cfg.currencyLocale;
  try {
    const nfOptions: Intl.NumberFormatOptions = {
      notation: "compact",
      maximumFractionDigits: 0,
    };

    return new Intl.NumberFormat(locale, nfOptions).format(value);
  } catch {
    return String(value);
  }
}

export function formatMoneyFromCents(cents: number, options?: MoneyFormatOptions): string {
  const cfg = getMaskConfig();
  const precision = options?.precision ?? cfg.currencyPrecision;
  return formatMoney(cents / Math.pow(10, precision), options);
}

export function parseMoneyToCents(value: string, options?: MoneyFormatOptions): number {
  const cfg = getMaskConfig();
  const precision = options?.precision ?? cfg.currencyPrecision;
  const parsed = parseMoney(value, options);
  return Math.round(parsed * Math.pow(10, precision));
}

export function moneyToCents(value: number, options?: MoneyFormatOptions): number {
  const cfg = getMaskConfig();
  const precision = options?.precision ?? cfg.currencyPrecision;
  return Math.round(value * Math.pow(10, precision));
}

export function centsToMoney(value: number, options?: MoneyFormatOptions): number {
  const cfg = getMaskConfig();
  const precision = options?.precision ?? cfg.currencyPrecision;
  return value / Math.pow(10, precision);
}

export function getMoneyInput(options?: MoneyInputOptions) {
  const cfg = getMaskConfig();
  const precision = options?.precision ?? cfg.currencyPrecision;
  const fromCents = options?.fromCents ?? false;
  const step = fromCents ? 1 : 1 / Math.pow(10, precision);

  return {
    formatter: (value?: string | number) => {
      if (value == null || value === "") return "";
      const numeric = typeof value === "number" ? value : Number(value);
      if (!Number.isFinite(numeric)) return "";
      return fromCents
        ? formatMoneyFromCents(numeric, options)
        : formatMoney(numeric, options);
    },
    parser: (value?: string) => {
      if (value == null || value.trim() === "") return "";
      return fromCents ? parseMoneyToCents(value, options) : parseMoney(value, options);
    },
    precision: fromCents ? 0 : precision,
    step,
  };
}

export function getDateFormat(): string {
  return getMaskConfig().dateFormat;
}

export function getShortDateFormat(): string {
  const fmt = getDateFormat();
  const withoutYear = fmt.replace(/[\s./-]*YYYY[\s./-]*/g, "").trim();
  return withoutYear || fmt;
}

export function formatDate(value?: string | Date | Dayjs | null, format?: string): string {
  if (!value) return "";
  const fmt = format ?? getDateFormat();
  const parsed = dayjs(value as ConfigType);
  return parsed.isValid() ? parsed.format(fmt) : String(value);
}

export function formatDateShort(value?: string | Date | Dayjs | null): string {
  return formatDate(value, getShortDateFormat());
}

export function formatDateTime(value?: string | Date | Dayjs | null, format?: string): string {
  if (!value) return "";
  const fmt = format ?? `${getDateFormat()} HH:mm`;
  const parsed = dayjs(value as ConfigType);
  return parsed.isValid() ? parsed.format(fmt) : String(value);
}

export default {
  getMaskConfig,
  getDateFormat,
  getShortDateFormat,
  formatDate,
  formatDateShort,
  formatDateTime,
  applyMask,
  stripMask,
  maskPhone,
  unmaskPhone,
  parseMoney,
  parseMoneyToCents,
  moneyToCents,
  centsToMoney,
  formatMoney,
  formatMoneyCompact,
  formatNumberCompact,
  formatMoneyFromCents,
  getMoneyInput,
};
