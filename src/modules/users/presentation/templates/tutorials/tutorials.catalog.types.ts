export type TutorialModuleId =
  | "billing"
  | "clients"
  | "company"
  | "dashboard"
  | "finance"
  | "growth"
  | "inventory"
  | "people"
  | "sla"
  | "schedule"
  | "services"
  | "work-order";

export type TutorialSlideContent = {
  title: string;
  summary: string;
  bullets: string[];
  expectedResult: string;
};

export type TutorialModuleContent = {
  id: TutorialModuleId;
  title: string;
  subtitle: string;
  slides: TutorialSlideContent[];
};

