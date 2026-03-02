declare module "@toast-ui/react-calendar" {
  import type { ComponentType } from "react";

  type Props = {
    height?: string | number;
    view?: "month" | "week" | "day";
    calendars?: DataMap[];
    events?: DataMap[];
    theme?: DataMap;
    month?: DataMap;
    week?: DataMap;
    day?: DataMap;
    usageStatistics?: boolean;
    useDetailPopup?: boolean;
    useFormPopup?: boolean;
    onClickEvent?: (e: DataMap) => void;
    onSelectDateTime?: (e: DataMap) => void;
    ref?: DataValue;
  };

  const Calendar: ComponentType<Props> & {
    prototype: {
      getInstance?: () => DataValue;
    };
  };

  export default Calendar;
}
