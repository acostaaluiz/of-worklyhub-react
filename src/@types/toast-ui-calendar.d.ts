declare module "@toast-ui/calendar" {
  export type CalendarView = "month" | "week" | "day";

  export type CalendarInfo = {
    id: string;
    name: string;
    backgroundColor?: string;
    borderColor?: string;
    color?: string;
  };

  export type EventCategory = "time" | "allday" | "milestone" | "task";

  export type EventObject = {
    id: string;
    calendarId: string;
    title: string;
    category: EventCategory;
    start: Date;
    end: Date;
    isAllDay?: boolean;
    raw?: DataMap;
  };

  export type CalendarTheme = DataMap;

  export type CalendarOptions = {
    defaultView?: CalendarView;
    calendars?: CalendarInfo[];
    events?: EventObject[];
    theme?: CalendarTheme;

    month?: DataMap;
    week?: DataMap;
    day?: DataMap;

    usageStatistics?: boolean;
    useDetailPopup?: boolean;
    useFormPopup?: boolean;
  };

  export type CalendarClickEvent = {
    event?: EventObject;
  };

  export type CalendarSelectDateTimeEvent = DataMap;

  /**
   * Default export = classe real do calendário.
   * O objeto retornado por `new Calendar(...)` é essa instância.
   */
  export default class Calendar {
    constructor(container: HTMLElement, options?: CalendarOptions);

    destroy(): void;

    getDate(): Date;
    prev(): void;
    next(): void;
    today(): void;

    setCalendars(calendars: CalendarInfo[]): void;
    setEvents(events: EventObject[]): void;
    clear(): void;

    on(eventName: "clickEvent", handler: (e: CalendarClickEvent) => void): void;
    on(
      eventName: "selectDateTime",
      handler: (e: CalendarSelectDateTimeEvent) => void
    ): void;
  }
}
