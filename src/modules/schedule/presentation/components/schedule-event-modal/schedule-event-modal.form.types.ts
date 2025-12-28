export type DayPart = "morning" | "afternoon" | "evening";

export type ScheduleEventDraft = {
  title: string;
  description?: string;
  categoryId: string;
  date: string;
  startTime: string;
  endTime: string;
};

export type ScheduleEventModalProps = {
  open: boolean;
  categories: Array<{ id: string; label: string; color: string }>;
  initialDate?: string;
  initialStartTime?: string;
  onClose: () => void;
  onConfirm: (draft: ScheduleEventDraft) => void;
};
