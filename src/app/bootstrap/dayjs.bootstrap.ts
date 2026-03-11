import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import localeData from "dayjs/plugin/localeData";
import weekOfYear from "dayjs/plugin/weekOfYear";
import weekYear from "dayjs/plugin/weekYear";
import weekday from "dayjs/plugin/weekday";

let isBootstrapped = false;

export function bootstrapDayjs(): void {
  if (isBootstrapped) return;

  dayjs.extend(customParseFormat);
  dayjs.extend(localeData);
  dayjs.extend(weekOfYear);
  dayjs.extend(weekYear);
  dayjs.extend(weekday);

  isBootstrapped = true;
}

