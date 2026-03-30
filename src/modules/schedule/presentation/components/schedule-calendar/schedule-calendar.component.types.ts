import Calendar from "@toast-ui/calendar";
import type { EventObject } from "@toast-ui/calendar";

import type { ScheduleCategory } from "../../../interfaces/schedule-category.model";
import type { InventoryItemLine, ScheduleEvent } from "../../../interfaces/schedule-event.model";
import type { SchedulePopupEvent } from "./schedule-event-popup.component";
import type { ScheduleEventDraft } from "../schedule-event-modal/schedule-event-modal.form.types";
import type { CompanyServiceModel } from "@modules/company/interfaces/service.model";
import type { EmployeeModel } from "@modules/people/interfaces/employee.model";
import type { InventoryItem } from "@modules/inventory/services/inventory-api";
import type { MonthViewHint, ScheduleStatus } from "@modules/schedule/services/schedules-api";
import type { ScheduleWorkspaceSettings } from "@modules/schedule/interfaces/schedule-settings.model";

export type ScheduleCalendarProps = {
  availableServices?: CompanyServiceModel[];
  availableEmployees?: EmployeeModel[];
  availableInventoryItems?: InventoryItem[];
  workspaceId?: string | null;
  onCreate?: (draft: ScheduleEventDraft) => Promise<void>;
  onUpdate?: (args: {
    id: string;
    event: Omit<ScheduleEvent, "id">;
    serviceIds?: string[];
    employeeIds?: string[];
    totalPriceCents?: number;
    workspaceId?: string | null;
    inventoryInputs?: InventoryItemLine[];
    inventoryOutputs?: InventoryItemLine[];
  }) => Promise<void>;
  events?: ScheduleEvent[];
  onRangeChange?: (
    from: string,
    to: string,
    options?: {
      viewMode?: "month" | "week" | "day";
      includeViewHint?: boolean;
    }
  ) => Promise<ScheduleEvent[] | void>;
  monthViewHint?: MonthViewHint | null;
  categories?: ScheduleCategory[] | null;
  statuses?: ScheduleStatus[] | null;
  settings?: ScheduleWorkspaceSettings;
  // internal view mode only; parent no longer controls it
};

export type EventCategoryRef = {
  id?: string;
  code?: string;
  label?: string;
  color?: string;
};

export type EventStatusRef = {
  id?: string;
  code?: string;
  label?: string;
  color?: string;
};

export type EventServiceRef = {
  serviceId?: string;
  id?: string;
  priceCents?: number;
};

export type EventWorkerRef = {
  userUid?: string;
  id?: string;
  email?: string;
  fullName?: string;
};

export type EventInventoryRef = {
  itemId?: string;
  id?: string;
  inventoryItemId?: string;
  item_id?: string;
  productId?: string;
  quantity?: number | string;
};

export type ScheduleEventExtended = ScheduleEvent & {
  category?: EventCategoryRef | null;
  status?: EventStatusRef | null;
  services?: EventServiceRef[] | null;
  workers?: EventWorkerRef[] | null;
  inventoryInputs?: EventInventoryRef[] | null;
  inventoryOutputs?: EventInventoryRef[] | null;
  durationMinutes?: number | null;
};

export type PopupRawData = {
  description?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  durationMinutes?: number | null;
  services?: EventServiceRef[] | null;
  workers?: EventWorkerRef[] | null;
  inventoryInputs?: EventInventoryRef[] | null;
  inventoryOutputs?: EventInventoryRef[] | null;
  inventoryInputsText?: string;
  inventoryOutputsText?: string;
  _bodyHtml?: string;
  status?: EventStatusRef | null;
  category?: EventCategoryRef | null;
  statusColor?: string;
  categoryColor?: string;
};

export type TuiScheduleEvent = EventObject &
  SchedulePopupEvent & {
    raw?: PopupRawData;
    category?: string;
    body?: string;
    color?: string;
    borderColor?: string;
    dragBackgroundColor?: string;
    customStyle?: Record<string, string>;
  };

export type PointerEventLike = {
  clientX?: number;
  clientY?: number;
  touches?: Array<{ clientX?: number; clientY?: number }>;
};

export type CalendarClickPayload = {
  event?: TuiScheduleEvent;
  domEvent?: PointerEventLike | null;
  nativeEvent?: PointerEventLike | null;
};

export type SelectDateTimePayload = {
  start?: Date | string;
};

export type CalendarViewMode = "month" | "week" | "day";

export type CalendarInstance = Calendar & {
  render?: () => void;
  createEvents?: (events: EventObject[]) => void;
  createCalendars?: (
    calendars: Array<{
      id: string;
      name: string;
      backgroundColor?: string;
      borderColor?: string;
      color?: string;
    }>
  ) => void;
  clearCalendars?: () => void;
  setDate?: (date: Date) => void;
  options?: {
    calendars?: Array<{
      id: string;
      name: string;
      backgroundColor?: string;
      borderColor?: string;
      color?: string;
    }>;
  };
};
