export interface EmployeeModel {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  role?: string;
  department?: string;
  hiredAt?: string;
  salaryCents?: number;
  active: boolean;
  createdAt: string;
}

export type EmployeeStatus = "active" | "inactive" | "on_leave";
