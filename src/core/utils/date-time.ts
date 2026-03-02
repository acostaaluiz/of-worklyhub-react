import dayjs, { type ConfigType, type Dayjs } from "dayjs";

export const APP_DATE_FORMAT = "YYYY-MM-DD";
export const APP_TIME_FORMAT = "HH:mm";
export const APP_DATE_TIME_FORMAT = `${APP_DATE_FORMAT} ${APP_TIME_FORMAT}`;

function parse(value?: ConfigType | null): Dayjs | null {
  if (!value) return null;
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed : null;
}

export function toDayjsValue(value?: ConfigType | null): Dayjs | null {
  return parse(value);
}

export function toIsoDateTimeValue(value?: Dayjs | null): string | null {
  if (!value) return null;
  return value.toISOString();
}

export function formatAppDate(value?: ConfigType | null, fallback = ""): string {
  const parsed = parse(value);
  if (!parsed) return fallback;
  return parsed.format(APP_DATE_FORMAT);
}

export function formatAppTime(value?: ConfigType | null, fallback = ""): string {
  const parsed = parse(value);
  if (!parsed) return fallback;
  return parsed.format(APP_TIME_FORMAT);
}

export function formatAppDateTime(value?: ConfigType | null, fallback = ""): string {
  const parsed = parse(value);
  if (!parsed) return fallback;
  return parsed.format(APP_DATE_TIME_FORMAT);
}

