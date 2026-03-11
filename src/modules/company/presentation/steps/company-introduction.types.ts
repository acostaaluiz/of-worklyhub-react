export type CompanySetupServiceDraft = {
  name?: string;
  category?: string;
  description?: string;
  durationMinutes?: number;
  price?: number;
  capacity?: number;
};

export type CompanyIntroductionValues = {
  fullName: string;
  email: string;
  phone?: string;

  accountType: "individual" | "company";
  companyName?: string;
  legalName?: string;
  employees?: number;

  primaryService?: string;
  primaryServiceCategory?: string;
  industry?: string;
  description?: string;
  services?: CompanySetupServiceDraft[];
};
