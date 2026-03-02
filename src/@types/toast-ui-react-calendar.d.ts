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

    theme?: DataMap;
    month?: DataMap;
    week?: DataMap;
    day?: DataMap;

    usageStatistics?: boolean;
    useDetailPopup?: boolean;
    useFormPopup?: boolean;

    onClickEvent?: (e: DataMap) => void;
    onSelectDateTime?: (e: DataMap) => void;
  };

  export type ToastCalendarRef = {
    getInstance: () => TuiCalendarInstance;
  };

  const Calendar: ComponentType<ToastCalendarProps>;
  export default Calendar;
}
