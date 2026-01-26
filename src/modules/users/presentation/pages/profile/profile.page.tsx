import React from "react";
import { message } from "antd";
import { applicationService } from "@core/application/application.service";
import type { ApplicationCategoryItem, ApplicationIndustryItem } from "@core/application/application-api";
import { isAppError } from "@core/errors/is-app-error";
import { formatMoney, maskPhone, unmaskPhone } from "@core/utils/mask";
import { BasePage } from "@shared/base/base.page";
import AvatarUploadModal from "@shared/ui/components/avatar-upload/avatar-upload.modal";
import { loadingService } from "@shared/ui/services/loading.service";
import { companyService } from "@modules/company/services/company.service";
import { usersAuthService } from "@modules/users/services/auth.service";
import { usersService } from "@modules/users/services/user.service";
import ProfileTemplate, { type PersonalModel, type CompanyModel } from "@modules/users/presentation/templates/profile/profile.template";

type State = {
  isLoading: boolean;
  initialized: boolean;
  personal: PersonalModel;
  company?: CompanyModel;
  avatarModalOpen?: boolean;
  wallpaperModalOpen?: boolean;
  isUploadingAvatar?: boolean;
  isUploadingWallpaper?: boolean;
  isSavingPersonal?: boolean;
  isSavingCompany?: boolean;
  isAvatarLoading?: boolean;
  isWallpaperLoading?: boolean;
  categories?: ApplicationCategoryItem[];
  industries?: ApplicationIndustryItem[];
};

export class ProfilePage extends BasePage<{}, State> {
  protected override options = { title: "Profile | WorklyHub", requiresAuth: true };

  public state: State = {
    isLoading: false,
    initialized: false,
    personal: {
      fullName: "",
      email: "",
      phone: undefined,
      photoUrl: undefined,
    },
    company: undefined,
    avatarModalOpen: false,
    wallpaperModalOpen: false,
    isUploadingAvatar: false,
    isUploadingWallpaper: false,
    isSavingPersonal: false,
    isSavingCompany: false,
    isAvatarLoading: false,
    isWallpaperLoading: false,
    categories: undefined,
    industries: undefined,
  };

  private preloadImage = (url: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!url) return reject(new Error("no-url"));
      try {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("failed-to-load"));
        img.src = url;
      } catch (err) {
        reject(err);
      }
    });
  };

  private async preloadAndSetAvatar(url?: string) {
    if (!url) return;
    this.setSafeState({ isAvatarLoading: true });
    try {
      await this.preloadImage(url);
      this.setSafeState({ personal: { ...this.state.personal, photoUrl: url } });
    } catch (err) {
      // keep existing photoUrl (or undefined) on error
      console.error("Avatar preload failed", err);
    } finally {
      this.setSafeState({ isAvatarLoading: false });
    }
  }

  private async preloadAndSetWallpaper(url?: string) {
    if (!url) return;
    this.setSafeState({ isWallpaperLoading: true });
    try {
      await this.preloadImage(url);
      const existing = this.state.company ?? ({} as CompanyModel);
      this.setSafeState({ company: { ...existing, wallpaperUrl: url } });
    } catch (err) {
      console.error("Wallpaper preload failed", err);
    } finally {
      this.setSafeState({ isWallpaperLoading: false });
    }
  }

  private mapWorkspaceToCompany(
    workspace: unknown,
    fallback?: CompanyModel,
    options?: { preserveWallpaper?: boolean }
  ): { company: CompanyModel; wallpaperCandidate?: string } {
    const ws: any = workspace ?? {};
    const cp: any = ws.company_profile ?? {};

    const accountType =
      (ws.workspace_type as "individual" | "company") ??
      (ws.accountType as "individual" | "company") ??
      fallback?.accountType ??
      "individual";

    const legalName =
      (cp.legal_name as string) ??
      (cp.legalName as string) ??
      (ws.legal_name as string) ??
      (ws.legalName as string) ??
      fallback?.legalName;

    const tradeName =
      (cp.trade_name as string) ??
      (cp.tradeName as string) ??
      (ws.trade_name as string) ??
      (ws.tradeName as string) ??
      (ws.name as string) ??
      (ws.companyName as string) ??
      fallback?.tradeName;

    const employees =
      (cp.employees_count as number) ??
      (cp.employeesCount as number) ??
      (ws.employees_count as number) ??
      (ws.employeesCount as number) ??
      fallback?.employees;

    const primaryService =
      (cp.primary_service as string) ??
      (cp.primaryService as string) ??
      (ws.primary_service as string) ??
      (ws.primaryService as string) ??
      fallback?.primaryService;

    const industry = (cp.industry as string) ?? (ws.industry as string) ?? fallback?.industry;

    const description = (cp.description as string) ?? (ws.description as string) ?? fallback?.description;

    const wallpaperCandidate =
      (cp.wallpaperUrl as string) ??
      (cp.wallpaper_url as string) ??
      (ws.wallpaperUrl as string) ??
      (ws.wallpaper_url as string) ??
      fallback?.wallpaperUrl;

    const company: CompanyModel = {
      accountType,
      legalName,
      tradeName,
      employees,
      primaryService,
      industry,
      description,
      wallpaperUrl: options?.preserveWallpaper ? fallback?.wallpaperUrl : undefined,
    };

    return { company, wallpaperCandidate };
  }

  protected override async onInit(): Promise<void> {
    await this.runAsync(async () => {
      let categories = applicationService.getCategoriesValue() ?? undefined;
      let industries = applicationService.getIndustriesValue() ?? undefined;

      if (!categories) {
        try {
          categories = (await applicationService.fetchCategories()) ?? undefined;
        } catch {
          categories = undefined;
        }
      }

      if (!industries) {
        try {
          industries = (await applicationService.fetchIndustries()) ?? undefined;
        } catch {
          industries = undefined;
        }
      }

      this.setSafeState({ categories, industries });
      const session = usersAuthService.getSessionValue();

      const personal: PersonalModel = {
        fullName: (session?.name as string) ?? "",
        email: session?.email ?? "",
        phone: undefined,
        photoUrl: undefined,
      };
      // if session has a photo, preload before assigning to avoid progressive render
      if (session?.photoUrl) this.preloadAndSetAvatar(session.photoUrl).catch(() => {});

      // try fetch user profile from usersService if email available
      if (session?.email) {
        try {
          const fetched = await usersService.fetchByEmail(session.email);
          if (fetched) {
            // map known fields
            // UserProfileResponse has `name` and `email` at minimum
            // preserve existing photoUrl if not provided

            const f = fetched as any;
            personal.fullName = (f.name as string) ?? personal.fullName;
            personal.email = (f.email as string) ?? personal.email;
            // support multiple possible photo fields returned by API
            const photoCandidates = (f as any).profilePhotoUrl ?? (f as any).profile_photo_url ?? (f as any).photoUrl ?? (f as any).photo_url ?? undefined;
            if (photoCandidates) {
              // defer setting photoUrl until fully loaded to avoid progressive render
              const candidate = photoCandidates as string;
              // keep preview empty until image fully loaded
              personal.photoUrl = undefined as any;
              // schedule preload after state updated below
              this.preloadAndSetAvatar(candidate).catch(() => {});
            }
            if ((f as any).phone) personal.phone = (f as any).phone;

            // map plan if available: resolve planId to title/price using applicationService
            const planId = (f as any).planId ?? (f as any).plan_id ?? undefined;
            if (planId != null) {
              try {
                let plans = applicationService.getPlansValue();
                if (!plans) {
                  plans = (await applicationService.fetchPlans()) ?? [];
                }
                const found = (plans ?? []).find((p) => Number(p.id) === Number(planId));
                if (found) {
                  const price = found.monthly_amount ?? found.yearly_amount ?? 0;
                  personal.planId = Number(found.id);
                  personal.planName = found.title;
                  personal.planPrice = `${formatMoney(price as number, { precision: 0 })}/month`;
                } else {
                  personal.planId = Number(planId);
                }
              } catch {
                // ignore plan mapping errors
                personal.planId = Number(planId);
              }
            }
          }
        } catch {
          // ignore fetch errors
        }

        // try to reuse cached workspace to avoid duplicate API calls
        try {
          const cached = companyService.getWorkspaceValue();
          if (cached) {
            const mapped = this.mapWorkspaceToCompany(cached, undefined, { preserveWallpaper: false });
            this.setSafeState({ personal, company: mapped.company, categories, industries });
            if (mapped.wallpaperCandidate) this.preloadAndSetWallpaper(mapped.wallpaperCandidate).catch(() => {});
            return;
          }

          // if no cached workspace, fetch from API
          const workspace = await companyService.fetchWorkspaceByEmail(session.email);
          if (workspace) {
            console.log(`workspace fetched for email ${session.email}:`, workspace);
            const mapped = this.mapWorkspaceToCompany(workspace, undefined, { preserveWallpaper: false });
            this.setSafeState({ personal, company: mapped.company, categories, industries });
            if (mapped.wallpaperCandidate) this.preloadAndSetWallpaper(mapped.wallpaperCandidate).catch(() => {});
            return;
          }
        } catch {
          // ignore
        }
      }

      // fallback: set personal only
      this.setSafeState({ personal, company: undefined, categories, industries });
    });
  }

  private handleOpenAvatar = () => this.setSafeState({ avatarModalOpen: true });

  private handleOpenWallpaper = () => this.setSafeState({ wallpaperModalOpen: true });

  private handleCloseAvatar = () => this.setSafeState({ avatarModalOpen: false, isUploadingAvatar: false });

  private handleCloseWallpaper = () => this.setSafeState({ wallpaperModalOpen: false, isUploadingWallpaper: false });

  private handleUploadAvatar = async (fileOrFiles: File | File[]) => {
    const files = Array.isArray(fileOrFiles) ? fileOrFiles : [fileOrFiles];
    if (files.length === 0) return;
    this.setSafeState({ isUploadingAvatar: true });

    try {
      // Only support single-file profile photo (maxFiles=1)
      const file = files[0];

      // Do not forward server upload progress to modal. Modal shows device->browser progress;
      // server upload is indicated by a spinner only.
      const path = await usersService.uploadProfilePhoto(file);

      // preload and set only after fully loaded
      await this.preloadAndSetAvatar(path);
      message.success("Photo uploaded successfully");
    } catch (err) {
      console.error(err);
      message.error("Failed to upload photo");
    } finally {
      this.setSafeState({ isUploadingAvatar: false, avatarModalOpen: false });
    }
  };

  private handleUploadWallpaper = async (fileOrFiles: File | File[]) => {
    const files = Array.isArray(fileOrFiles) ? fileOrFiles : [fileOrFiles];
    if (files.length === 0) return;
    this.setSafeState({ isUploadingWallpaper: true });

    try {
      const file = files[0];
      await companyService.uploadWorkspaceWallpaper(file);

      // update company preview from cached workspace if available
      const cached = companyService.getWorkspaceValue();
      if (cached) {
        const mapped = this.mapWorkspaceToCompany(cached, this.state.company, { preserveWallpaper: false });
        this.setSafeState({ company: mapped.company });
        if (mapped.wallpaperCandidate) await this.preloadAndSetWallpaper(mapped.wallpaperCandidate);
      }

      message.success("Wallpaper uploaded successfully");
    } catch (err) {
      console.error(err);
      message.error("Failed to upload wallpaper");
    } finally {
      this.setSafeState({ isUploadingWallpaper: false, wallpaperModalOpen: false });
    }
  };

  private handleSavePersonal = async (values: PersonalModel) => {
    this.setSafeState({ isSavingPersonal: true });
    loadingService.show();

    try {
      const payloadPhone = values.phone ? unmaskPhone(values.phone) : undefined;
      const updated = await usersService.updateProfile({
        fullName: values.fullName,
        email: values.email,
        phone: payloadPhone,
      });

      const nextPhone = maskPhone(updated.phone ?? values.phone ?? "");
      const nextPersonal: PersonalModel = {
        ...values,
        fullName: updated.name ?? values.fullName,
        email: updated.email ?? values.email,
        phone: nextPhone || undefined,
        photoUrl: this.state.personal.photoUrl,
        planId: updated.planId ?? this.state.personal.planId,
        planName: this.state.personal.planName,
        planPrice: this.state.personal.planPrice,
      };

      this.setSafeState({ personal: nextPersonal });
      message.success("Personal information saved");
    } catch (err) {
      console.error(err);
      message.error(isAppError(err) ? err.message : "Failed to save personal information");
    } finally {
      this.setSafeState({ isSavingPersonal: false });
      loadingService.hide();
    }
  };

  private handleSaveCompany = async (values: CompanyModel) => {
    this.setSafeState({ isSavingCompany: true });
    loadingService.show();

    try {
      const updatedWorkspace = await companyService.updateWorkspaceProfile({
        accountType: values.accountType,
        legalName: values.legalName,
        tradeName: values.tradeName,
        employeesCount: values.employees,
        industry: values.industry,
        primaryService: values.primaryService,
        description: values.description,
      });

      if (updatedWorkspace) {
        const fallback: CompanyModel = { ...values, wallpaperUrl: this.state.company?.wallpaperUrl };
        const mapped = this.mapWorkspaceToCompany(updatedWorkspace, fallback, { preserveWallpaper: true });
        this.setSafeState({ company: mapped.company });
        if (mapped.wallpaperCandidate && mapped.wallpaperCandidate !== mapped.company.wallpaperUrl) {
          await this.preloadAndSetWallpaper(mapped.wallpaperCandidate);
        }
      } else {
        this.setSafeState({ company: values });
      }

      message.success("Company information saved");
    } catch (err) {
      console.error(err);
      message.error(isAppError(err) ? err.message : "Failed to save company information");
    } finally {
      this.setSafeState({ isSavingCompany: false });
      loadingService.hide();
    }
  };

  protected override renderPage(): React.ReactNode {
    return (
      <>
        <ProfileTemplate
          personal={this.state.personal}
          company={this.state.company}
          categories={this.state.categories}
          industries={this.state.industries}
          isAvatarLoading={this.state.isAvatarLoading}
          isWallpaperLoading={this.state.isWallpaperLoading}
          isSavingPersonal={this.state.isSavingPersonal}
          isSavingCompany={this.state.isSavingCompany}
          onOpenAvatar={this.handleOpenAvatar}
          onOpenWallpaper={this.handleOpenWallpaper}
          onSavePersonal={this.handleSavePersonal}
          onSaveCompany={this.handleSaveCompany}
        />

        <AvatarUploadModal
          open={!!this.state.avatarModalOpen}
          title="Upload profile photo"
          subtitle="Select or drag an image to update your profile photo"
          onClose={this.handleCloseAvatar}
          onUpload={this.handleUploadAvatar}
          isUploading={!!this.state.isUploadingAvatar}
          maxFiles={1}
        />

        <AvatarUploadModal
          open={!!this.state.wallpaperModalOpen}
          title="Upload wallpaper"
          subtitle="Select or drag an image to update your company wallpaper"
          onClose={this.handleCloseWallpaper}
          onUpload={this.handleUploadWallpaper}
          isUploading={!!this.state.isUploadingWallpaper}
          maxFiles={1}
        />
      </>
    );
  }
}

export default ProfilePage;
