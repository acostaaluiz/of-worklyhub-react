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
type SetupMode = "create" | "edit";

type CompanyIntroductionState = {
  initialized: boolean;
  isLoading: boolean;
  error?: DataValue;
  setupMode: SetupMode;
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

function asRecord(value: DataValue | null | undefined): DataMap | null {
  if (!value || typeof value !== "object" || Array.isArray(value) || value instanceof Date) return null;
  return value;
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

function asNumber(value: unknown): number | undefined {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
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
    setupMode: "create",
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

  private resolveSetupMode(workspace: DataValue | null | undefined): SetupMode {
    return asRecord(workspace) ? "edit" : "create";
  }

  private resolveInitialValues(params: {
    workspace?: DataMap | null;
    fullName?: string;
    email?: string;
  }): CompanyIntroductionValues {
    const workspace = params.workspace ?? null;
    const profile = asRecord(workspace?.company_profile as DataValue) ?? asRecord(workspace?.companyProfile as DataValue);
    const firstService = Array.isArray(workspace?.services) ? asRecord((workspace?.services as DataValue[])[0]) : null;

    const companyName =
      asString(workspace?.tradeName) ??
      asString(workspace?.trade_name) ??
      asString(profile?.trade_name) ??
      asString(profile?.tradeName) ??
      asString(workspace?.name) ??
      "";

    const legalName =
      asString(profile?.legal_name) ??
      asString(profile?.legalName) ??
      asString(workspace?.legalName) ??
      "";

    const employees =
      asNumber(workspace?.employeesCount) ??
      asNumber(profile?.employees_count) ??
      asNumber(profile?.employeesCount);

    const primaryService =
      asString(workspace?.primaryService) ??
      asString(profile?.primary_service) ??
      asString(profile?.primaryService) ??
      asString(firstService?.name) ??
      "";

    const primaryServiceCategory =
      asString(workspace?.primaryServiceCategory) ??
      asString(firstService?.category) ??
      "";

    const accountTypeRaw =
      asString(workspace?.accountType) ??
      asString(workspace?.workspace_type) ??
      asString(profile?.accountType);

    const accountType: "individual" | "company" =
      accountTypeRaw === "company" || companyName || legalName ? "company" : "individual";

    const firstServiceDraft =
      primaryService || primaryServiceCategory
        ? {
            name: primaryService || undefined,
            category: primaryServiceCategory || undefined,
          }
        : {};

    const resolvedFullName =
      params.fullName ??
      asString(workspace?.fullName) ??
      asString(workspace?.name) ??
      "";

    const resolvedEmail =
      params.email ??
      asString(workspace?.email) ??
      "";

    return {
      fullName: resolvedFullName,
      email: resolvedEmail,
      phone: asString(workspace?.phone) ?? undefined,
      accountType,
      companyName,
      legalName,
      employees,
      primaryService,
      primaryServiceCategory,
      industry:
        asString(workspace?.industry) ??
        asString(profile?.industry) ??
        "",
      description:
        asString(workspace?.description) ??
        asString(profile?.description) ??
        "",
      services: [firstServiceDraft, {}, {}],
    };
  }

  protected override async onInit(): Promise<void> {
    await this.runAsync(
      async () => {
        const categories = applicationService.getCategoriesValue() ?? [];
        const industries = applicationService.getIndustriesValue() ?? [];

        const workspace = asRecord(companyService.getWorkspaceValue() as DataValue);
        const setupMode = this.resolveSetupMode(workspace);

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

        const initialValues = this.resolveInitialValues({
          workspace,
          fullName,
          email,
        });

        this.setSafeState({
          setupMode,
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
      const isEditMode = this.state.setupMode === "edit";
      const session = usersAuthService.getSessionValue();

      if (isEditMode && companyService.getWorkspaceValue()) {
        await companyService.updateWorkspaceProfile({
          accountType: values.accountType ?? "individual",
          legalName: values.legalName ?? undefined,
          tradeName: values.companyName ?? undefined,
          employeesCount: toPositiveInteger(values.employees),
          industry: values.industry ?? undefined,
          primaryService: values.primaryService ?? undefined,
          description: values.description ?? undefined,
        });
      } else {
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
      }

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
          title: appI18n.t(
            isEditMode
              ? "company.introduction.response.updateComplete.title"
              : "company.introduction.response.setupComplete.title"
          ),
          description: appI18n.t(
            isEditMode
              ? "company.introduction.response.updateComplete.description"
              : "company.introduction.response.setupComplete.description"
          ),
        },
      });
    } catch (error) {
      const isEditMode = this.state.setupMode === "edit";
      console.error(isEditMode ? "update workspace failed" : "create workspace failed", error);
      message.error(
        appI18n.t(
          isEditMode
            ? "company.introduction.messages.updateWorkspaceFailed"
            : "company.introduction.messages.createWorkspaceFailed"
        )
      );
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
        mode={this.state.setupMode}
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
