export type ScheduleEventId = string;

export type ScheduleCategoryId = string;

export type ScheduleEvent = {
  id: ScheduleEventId;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  categoryId: ScheduleCategoryId;
  description?: string;
};
