import type React from "react";
import { BasePage } from "@shared/base/base.page";
import { CompanyIntroductionTemplate } from "../templates/company-introduction/company-introduction.template";
import { applicationService } from "@core/application/application.service";
import type { ApplicationCategoryItem, ApplicationIndustryItem } from "@core/application/application-api";
import { usersService } from "@modules/users/services/user.service";
import { usersAuthService } from "@modules/users/services/auth.service";
import type { CompanyIntroductionValues } from "../templates/company-introduction/../../steps/personal-info.step";
import { loadingService } from "@shared/ui/services/loading.service";
import { message } from "antd";
import { companyService } from "@modules/company/services/company.service";
import type { WorkspaceCreatePayload } from "@modules/company/services/companies-api";
import { navigateTo } from "@core/navigation/navigation.service";

type ResponseModalState = { open: boolean; title: string; description?: string } | undefined;

export class CompanyIntroductionPage extends BasePage<{}, { initialized: boolean; isLoading: boolean; error?: unknown; categories?: ApplicationCategoryItem[]; industries?: ApplicationIndustryItem[]; initialValues?: CompanyIntroductionValues; responseModal?: ResponseModalState }> {
  protected override options = {
    title: "Company setup | WorklyHub",
    requiresAuth: true,
  };

  public state: { initialized: boolean; isLoading: boolean; error?: unknown; categories?: ApplicationCategoryItem[]; industries?: ApplicationIndustryItem[]; initialValues?: CompanyIntroductionValues; responseModal?: ResponseModalState } = {
    isLoading: false,
    initialized: false,
    error: undefined,
    categories: undefined,
    industries: undefined,
    initialValues: undefined,
    responseModal: undefined,
  };

  protected override async onInit(): Promise<void> {
    // if workspace already exists, block access and redirect to home
    try {
      const ws = companyService.getWorkspaceValue();
      if (ws) {
        navigateTo("/home");
        return;
      }
    } catch {
      // ignore
    }

    await this.runAsync(async () => {
      const [categories, industries] = await Promise.all([applicationService.fetchCategories(), applicationService.fetchIndustries()]);

      // attempt to get profile info for initial form values
      const session = usersAuthService.getSessionValue();
      let fullName: string | undefined = undefined;
      const email: string | undefined = session?.email ?? undefined;

      const profile = usersService.getProfileValue();
      if (profile?.name) {
        fullName = profile.name as unknown as string;
      } else if (email) {
        try {
          const fetched = await usersService.fetchByEmail(email);
          // fetched may have different shape; attempt to read `name` or `fullName`
           
          fullName = (fetched as any)?.name ?? (fetched as any)?.fullName ?? undefined;
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
        employees: undefined,
        primaryService: "",
        industry: "",
        description: "",
      };

      this.setSafeState({ categories: categories ?? [], industries: industries ?? [], initialValues });
    }, { setLoading: false, swallowError: true });
  }

  protected handleFinish = async (values: any) => {
    loadingService.show();
    try {
      const session = usersAuthService.getSessionValue();
      const creatorUid = session?.uid ?? "";

      // debug values coming from the form
       
      console.debug("CompanyIntroduction form values:", values);

      // Build payload explicitly so JSON won't drop undefined fields unintentionally
      const payload: Record<string, unknown> = {
        creatorUid,
        accountType: values?.accountType ?? "individual",
        fullName: values?.fullName ?? "",
        email: values?.email ?? "",
        phone: values?.phone ?? undefined,
        tradeName: values?.companyName ?? undefined,
        employeesCount: values?.employees ?? undefined,
        industry: values?.industry ?? undefined,
        primaryService: values?.primaryService ?? undefined,
        description: values?.description ?? undefined,
      };

      // Build services array: prefer explicit `services` from the form if provided,
      // otherwise create one from `primaryService` + `description` when available.
      if (Array.isArray(values?.services) && values.services.length > 0) {
        payload.services = values.services;
      } else if (values?.primaryService) {
        payload.services = [
          {
            name: values.primaryService,
            category: values.primaryServiceCategory ?? "other",
            description: values.description ?? "",
          },
        ];
      } else {
        payload.services = [];
      }

      await companyService.createWorkspace(payload as WorkspaceCreatePayload);
      // refresh workspace and user profile so app state is populated without forcing logout
      try {
        const email = session?.email as string | undefined;
        if (email) {
          // fetch fresh user profile (background) and workspace
          await usersService.fetchByEmail(email).catch(() => {});
          await companyService.fetchWorkspaceByEmail(email).catch(() => {});
        }
      } catch {
        // ignore
      }

      // show response modal and let the user confirm redirect
      this.setSafeState({ responseModal: { open: true, title: "Setup complete", description: "Initial setup finished. You will be redirected to Home." } });
    } catch (err) {
       
      console.error("create workspace failed", err);
      message.error("Failed to create workspace");
    } finally {
      loadingService.hide();
    }
  };

  protected closeResponse = () => {
    this.setSafeState({ responseModal: undefined });
  };

  protected confirmResponse = () => {
    this.setSafeState({ responseModal: undefined });
    navigateTo("/home");
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
