import type { BaseProps } from "@shared/base/interfaces/base-props.interface";
import type { CompanyServiceModel } from "@modules/company/interfaces/service.model";
import type { EmployeeModel } from "@modules/people/interfaces/employee.model";

export type DayPart = "morning" | "afternoon" | "evening";

export type ScheduleEventDraft = {
  title: string;
  description?: string;
  categoryId: string;
  date: string;
  startTime: string;
  endTime: string;
  durationMinutes?: number | null;
  // optional extras
  serviceIds?: string[];
  employeeIds?: string[];
  totalPriceCents?: number;
};

export type ScheduleEventModalProps = BaseProps & {
  open: boolean;
  categories: Array<{ id: string; label: string; color: string }>;
  // services available to add (from company workspace)
  availableServices?: CompanyServiceModel[];
  // employees available to link (company staff)
  availableEmployees?: EmployeeModel[];
  initialDate?: string;
  initialStartTime?: string;
  initialDraft?: ScheduleEventDraft & { id?: string };
  onClose: () => void;
  onConfirm: (draft: ScheduleEventDraft) => void;
};
