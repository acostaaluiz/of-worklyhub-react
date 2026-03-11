export type WeeklyAvailabilityMinutes = Record<string, number>;

export type EmployeeWeeklyAvailability = {
  employeeId: string;
  minutesByWeekday: WeeklyAvailabilityMinutes;
  updatedAt: string;
};

export type UpsertEmployeeWeeklyAvailabilityInput = {
  employeeId: string;
  minutesByWeekday: WeeklyAvailabilityMinutes;
};

export type EmployeeAvailabilityBlock = {
  id: string;
  workspaceId: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  reason?: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateEmployeeAvailabilityBlockInput = {
  employeeId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  reason?: string;
};

export type EmployeeCapacityDay = {
  date: string;
  weekday: number;
  availabilityMinutes: number;
  blockedMinutes: number;
  scheduledMinutes: number;
  workOrderMinutes: number;
  productiveMinutes: number;
  plannedMinutes: number;
  overloadMinutes: number;
  isOverallocated: boolean;
};

export type EmployeeCapacityRow = {
  employeeId: string;
  employeeName: string;
  weeklyAvailabilityMinutesByWeekday: WeeklyAvailabilityMinutes;
  daily: EmployeeCapacityDay[];
  totalAvailabilityMinutes: number;
  totalBlockedMinutes: number;
  totalScheduledMinutes: number;
  totalWorkOrderMinutes: number;
  totalPlannedMinutes: number;
  totalProductiveMinutes: number;
  totalOverloadMinutes: number;
  utilizationPercent: number;
  conflictDays: number;
};

export type WorkforceCapacitySummary = {
  employeeCount: number;
  totalAvailabilityMinutes: number;
  totalBlockedMinutes: number;
  totalScheduledMinutes: number;
  totalWorkOrderMinutes: number;
  totalPlannedMinutes: number;
  totalProductiveMinutes: number;
  totalOverloadMinutes: number;
  conflictSlots: number;
  conflictRatePercent: number;
};

export type WorkforceCapacitySnapshot = {
  weekStart: string;
  weekEnd: string;
  rows: EmployeeCapacityRow[];
  blocks: EmployeeAvailabilityBlock[];
  summary: WorkforceCapacitySummary;
};
