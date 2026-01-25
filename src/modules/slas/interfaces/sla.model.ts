export type SlaApiItem = {
  id: string;
  workspace_id: string;
  user_uid: string;
  event_id: string;
  work_date: string; // YYYY-MM-DD
  duration_minutes: number;
  created_at: string;
};

export type SlaRecord = {
  id: string;
  workspaceId: string;
  userUid: string;
  eventId: string;
  workDate: string; // YYYY-MM-DD
  durationMinutes: number;
  createdAt: string;
};

export type SlaSummary = {
  userUid: string;
  workDate: string;
  totalMinutes: number;
  totalHours: number;
};

export type SlaQuery = {
  userUid?: string;
  eventId?: string;
  from?: string;
  to?: string;
};
