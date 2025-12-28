declare module "@toast-ui/react-calendar" {
  import type { ComponentType } from "react";
  import type {
    Calendar as TuiCalendarInstance,
    EventObject,
  } from "@toast-ui/calendar";

  export type ToastCalendarView = "month" | "week" | "day";

  export type ToastCalendarProps = {
    height?: string | number;
    view?: ToastCalendarView;

    calendars?: Array<{
      id: string;
      name: string;
      backgroundColor?: string;
      borderColor?: string;
      color?: string;
    }>;

    events?: EventObject[];

    theme?: unknown;
    month?: unknown;
    week?: unknown;
    day?: unknown;

    usageStatistics?: boolean;
    useDetailPopup?: boolean;
    useFormPopup?: boolean;

    onClickEvent?: (e: any) => void;
    onSelectDateTime?: (e: any) => void;
  };

  export type ToastCalendarRef = {
    getInstance: () => TuiCalendarInstance;
  };

  const Calendar: ComponentType<ToastCalendarProps>;
  export default Calendar;
}
