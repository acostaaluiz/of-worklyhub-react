import type React from "react";
import { message } from "antd";
import type {
  ApplicationCategoryItem,
  ApplicationIndustryItem,
} from "@core/application/application-api";
import { i18n as appI18n } from "@core/i18n";
import { applicationService } from "@core/application/application.service";
import { navigateTo } from "@core/navigation/navigation.service";
import { parseMoneyToCents, unmaskPhone } from "@core/utils/mask";
import { BasePage } from "@shared/base/base.page";
import { loadingService } from "@shared/ui/services/loading.service";
import { companyService } from "@modules/company/services/company.service";
import type { WorkspaceCreatePayload } from "@modules/company/services/companies-api";
import { usersAuthService } from "@modules/users/services/auth.service";
import { usersOverviewService } from "@modules/users/services/overview.service";
import { isActivePlan } from "@modules/users/services/plan-status";
import { usersService } from "@modules/users/services/user.service";
import type { CompanyIntroductionValues } from "../steps/company-introduction.types";
import { CompanyIntroductionTemplate } from "../templates/company-introduction/company-introduction.template";

type ResponseModalState = { open: boolean; title: string; description?: string } | undefined;

type CompanyIntroductionState = {
  initialized: boolean;
  isLoading: boolean;
  error?: DataValue;
  categories?: ApplicationCategoryItem[];
  industries?: ApplicationIndustryItem[];
  initialValues?: CompanyIntroductionValues;
  responseModal?: ResponseModalState;
};

function toPositiveInteger(value: unknown): number | undefined {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return undefined;
  if (parsed <= 0) return undefined;
  return Math.round(parsed);
}

function normalizeWorkspaceServices(values: CompanyIntroductionValues): NonNullable<WorkspaceCreatePayload["services"]> {
  const baseServices = Array.isArray(values.services) ? values.services : [];

  const normalized = baseServices
    .map((service, index) => {
      const trimmedName = String(service?.name ?? "").trim();
      const fallbackName = index === 0 ? String(values.primaryService ?? "").trim() : "";
      const name = trimmedName || fallbackName;
      if (!name) return null;

      const rawPrice = service?.price;
      const priceCents =
        rawPrice != null && String(rawPrice).trim().length > 0
          ? parseMoneyToCents(String(rawPrice))
          : undefined;

      return {
        name,
        category: String(service?.category ?? "").trim() || (index === 0 ? values.primaryServiceCategory : undefined),
        description: String(service?.description ?? "").trim() || (index === 0 ? values.description : undefined),
        durationMinutes: toPositiveInteger(service?.durationMinutes),
        priceCents,
        capacity: toPositiveInteger(service?.capacity),
      };
    })
    .filter((service): service is NonNullable<typeof service> => Boolean(service));

  if (normalized.length > 0) return normalized;

  const fallbackPrimary = String(values.primaryService ?? "").trim();
  if (!fallbackPrimary) return [];

  return [
    {
      name: fallbackPrimary,
      category: values.primaryServiceCategory,
      description: values.description,
    },
  ];
}

export class CompanyIntroductionPage extends BasePage<{}, CompanyIntroductionState> {
  protected override options = {
    title: `${appI18n.t("company.pageTitles.introduction")} | WorklyHub`,
    requiresAuth: true,
  };

  public state: CompanyIntroductionState = {
    isLoading: false,
    initialized: false,
    error: undefined,
    categories: undefined,
    industries: undefined,
    initialValues: undefined,
    responseModal: undefined,
  };

  private resolveSessionEmail(): string | undefined {
    const session = usersAuthService.getSessionValue();
    const fromSession = session?.email;
    if (typeof fromSession === "string" && fromSession.trim().length > 0) return fromSession.trim();

    const claims =
      session?.claims && typeof session.claims === "object" && !Array.isArray(session.claims)
        ? (session.claims as DataMap)
        : undefined;
    const fromClaims = claims?.email;
    if (typeof fromClaims === "string" && fromClaims.trim().length > 0) return fromClaims.trim();

    return undefined;
  }

  private async resolvePostSetupRoute(): Promise<string> {
    try {
      const overview = await usersOverviewService.fetchOverview(true);
      if (isActivePlan(overview?.profile)) return "/home";
    } catch {
      // fallback to local profile when overview is unavailable
    }

    const localProfile = usersService.getProfileValue();
    if (isActivePlan(localProfile)) return "/home";

    return "/billing/plans";
  }

  protected override async onInit(): Promise<void> {
    try {
      const workspace = companyService.getWorkspaceValue();
      if (workspace) {
        const nextRoute = await this.resolvePostSetupRoute();
        navigateTo(nextRoute);
        return;
      }
    } catch {
      // ignore
    }

    await this.runAsync(
      async () => {
        const categories = applicationService.getCategoriesValue() ?? [];
        const industries = applicationService.getIndustriesValue() ?? [];

        const session = usersAuthService.getSessionValue();
        const email = session?.email ?? undefined;
        let fullName: string | undefined;

        const profile = usersService.getProfileValue();
        if (profile?.name) {
          fullName = typeof profile.name === "string" ? profile.name : String(profile.name ?? "");
        } else if (email) {
          try {
            const fetched = (await usersService.fetchByEmail(email)) as
              | {
                  name?: string;
                  fullName?: string;
                }
              | null;
            fullName = fetched?.name ?? fetched?.fullName ?? undefined;
          } catch {
            // ignore
          }
        }

        const initialValues: CompanyIntroductionValues = {
          fullName: fullName ?? "",
          email: email ?? "",
          phone: undefined,
          accountType: "individual",
          companyName: "",
          legalName: "",
          employees: undefined,
          primaryService: "",
          primaryServiceCategory: "",
          industry: "",
          description: "",
          services: [{}, {}, {}],
        };

        this.setSafeState({
          categories: categories ?? [],
          industries: industries ?? [],
          initialValues,
        });
      },
      { swallowError: true }
    );
  }

  protected handleFinish = async (values: CompanyIntroductionValues) => {
    loadingService.show();
    try {
      const session = usersAuthService.getSessionValue();
      const creatorUid = session?.uid ?? "";

      const payload: WorkspaceCreatePayload = {
        creatorUid,
        accountType: values.accountType ?? "individual",
        fullName: values.fullName ?? "",
        email: values.email ?? "",
        phone: values.phone ? unmaskPhone(values.phone) : undefined,
        tradeName: values.companyName ?? undefined,
        legalName: values.legalName ?? undefined,
        employeesCount: toPositiveInteger(values.employees),
        industry: values.industry ?? undefined,
        primaryService: values.primaryService ?? undefined,
        description: values.description ?? undefined,
        services: normalizeWorkspaceServices(values),
      };

      await companyService.createWorkspace(payload);

      try {
        const email = session?.email;
        if (email) {
          await usersService.fetchByEmail(email).catch(() => {});
          await companyService.fetchWorkspaceByEmail(email).catch(() => {});
        }
      } catch {
        // ignore
      }

      this.setSafeState({
        responseModal: {
          open: true,
          title: appI18n.t("company.introduction.response.setupComplete.title"),
          description: appI18n.t("company.introduction.response.setupComplete.description"),
        },
      });
    } catch (error) {
      console.error("create workspace failed", error);
      message.error(appI18n.t("company.introduction.messages.createWorkspaceFailed"));
    } finally {
      loadingService.hide();
    }
  };

  protected closeResponse = () => {
    this.setSafeState({ responseModal: undefined });
  };

  protected confirmResponse = async () => {
    this.setSafeState({ responseModal: undefined });
    const sessionEmail = this.resolveSessionEmail();
    if (sessionEmail) {
      await companyService.fetchWorkspaceByEmail(sessionEmail).catch(() => {});
    }
    const nextRoute = await this.resolvePostSetupRoute();
    navigateTo(nextRoute);
  };

  protected override renderPage(): React.ReactNode {
    const response = this.state.responseModal;

    return (
      <CompanyIntroductionTemplate
        onFinish={this.handleFinish}
        categories={this.state.categories}
        industries={this.state.industries}
        initialValues={this.state.initialValues}
        responseModal={
          response
            ? {
                open: response.open,
                title: response.title,
                description: response.description,
                onClose: this.closeResponse,
                onPrimary: this.confirmResponse,
              }
            : undefined
        }
      />
    );
  }
}

export default CompanyIntroductionPage;
