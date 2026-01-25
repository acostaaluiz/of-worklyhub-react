export type SlaFilters = {
  userUid?: string;
  from?: string;
  to?: string;
};

export type SlaRow = {
  key: string;
  userUid: string;
  employeeName: string;
  workDate: string;
  totalMinutes: number;
  totalHours: number;
};

export type SlaEmployeeOption = {
  value: string;
  label: string;
};
