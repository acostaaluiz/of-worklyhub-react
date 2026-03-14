export interface EmployeeModel {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  role?: string;
  department?: string;
  accessProfileUid?: string | null;
  invitationStatus?: "active" | "pending_activation";
  invitationSentAt?: string | null;
  activatedAt?: string | null;
  hiredAt?: string;
  salaryCents?: number;
  active: boolean;
  createdAt: string;
}

export type EmployeeStatus = "active" | "inactive" | "on_leave";
