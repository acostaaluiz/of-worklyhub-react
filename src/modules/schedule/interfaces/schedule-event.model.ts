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
  durationMinutes?: number | null;
  // optional full category object when returned by backend
  category?: {
    id: string;
    code?: string;
    label?: string;
  } | null;
};
