export type PeopleDefaultLandingTab = "employees" | "capacity";

export interface EmployeeAccessProfile {
  uid: string;
  name: string;
  description?: string | null;
  allowedModules: string[];
  isSystem?: boolean;
}

export interface EmployeeAccessSettings {
  enabled: boolean;
  defaultProfileUid?: string | null;
  profiles: EmployeeAccessProfile[];
}

export interface PeopleWorkspaceSettings {
  defaultRole?: string | null;
  defaultDepartment?: string | null;
  defaultSalaryCents?: number | null;
  requireEmail: boolean;
  requirePhone: boolean;
  requireDepartment: boolean;
  requireSalary: boolean;
  defaultLandingTab: PeopleDefaultLandingTab;
  employeeAccess: EmployeeAccessSettings;
}

export interface PeopleWorkspaceSettingsBundle {
  workspaceId: string;
  settings: PeopleWorkspaceSettings;
  source: "database" | "defaults";
  updatedAt?: string;
}
