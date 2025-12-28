declare module "@toast-ui/react-calendar" {
  import type { ComponentType } from "react";

  type Props = {
    height?: string | number;
    view?: "month" | "week" | "day";
    calendars?: any[];
    events?: any[];
    theme?: any;
    month?: any;
    week?: any;
    day?: any;
    usageStatistics?: boolean;
    useDetailPopup?: boolean;
    useFormPopup?: boolean;
    onClickEvent?: (e: any) => void;
    onSelectDateTime?: (e: any) => void;
    ref?: any;
  };

  const Calendar: ComponentType<Props> & {
    prototype: {
      getInstance?: () => any;
    };
  };

  export default Calendar;
}
