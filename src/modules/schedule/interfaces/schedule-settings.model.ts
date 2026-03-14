export type ScheduleDefaultDayPart = "morning" | "afternoon" | "evening";
export type ScheduleConfirmationPolicy = "required" | "optional";
export type ScheduleNoShowPolicy = "none" | "flag" | "charge";

export interface ScheduleWorkspaceSettings {
  defaultDurationMinutes: number;
  defaultDayPart: ScheduleDefaultDayPart;
  defaultCategoryId?: string | null;
  requireDescription: boolean;
  requireService: boolean;
  requireEmployee: boolean;
  autoSelectFirstService: boolean;
  autoSelectFirstEmployee: boolean;
  enableInventoryTracking: boolean;
  confirmationPolicy: ScheduleConfirmationPolicy;
  reminderEnabled: boolean;
  reminderLeadMinutes: number;
  noShowPolicy: ScheduleNoShowPolicy;
  noShowFeePercent: number;
}

export interface ScheduleWorkspaceSettingsBundle {
  workspaceId: string;
  settings: ScheduleWorkspaceSettings;
  source: "database" | "defaults";
  updatedAt?: string;
}
