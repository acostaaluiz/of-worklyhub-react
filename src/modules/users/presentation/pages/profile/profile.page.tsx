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

function toDataMap(value: DataValue | null | undefined): DataMap | null {
  if (!value || typeof value !== "object" || Array.isArray(value) || value instanceof Date) {
    return null;
  }
  return value;
}

function toStringValue(value: DataValue | null | undefined): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function toNumberValue(value: DataValue | null | undefined): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function toAccountTypeValue(
  value: DataValue | null | undefined
): "individual" | "company" | undefined {
  if (value === "individual" || value === "company") return value;
  return undefined;
}

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
    } catch {
      // keep existing photoUrl (or undefined) on error
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
    } catch {
      // keep existing wallpaper on preload failure
    } finally {
      this.setSafeState({ isWallpaperLoading: false });
    }
  }

  private mapWorkspaceToCompany(
    workspace: DataValue,
    fallback?: CompanyModel,
    options?: { preserveWallpaper?: boolean }
  ): { company: CompanyModel; wallpaperCandidate?: string } {
    const ws = toDataMap(workspace) ?? {};
    const cp = toDataMap(ws.company_profile) ?? {};

    const accountType =
      toAccountTypeValue(ws.workspace_type) ??
      toAccountTypeValue(ws.accountType) ??
      fallback?.accountType ??
      "individual";

    const legalName =
      toStringValue(cp.legal_name) ??
      toStringValue(cp.legalName) ??
      toStringValue(ws.legal_name) ??
      toStringValue(ws.legalName) ??
      fallback?.legalName;

    const tradeName =
      toStringValue(cp.trade_name) ??
      toStringValue(cp.tradeName) ??
      toStringValue(ws.trade_name) ??
      toStringValue(ws.tradeName) ??
      toStringValue(ws.name) ??
      toStringValue(ws.companyName) ??
      fallback?.tradeName;

    const employees =
      toNumberValue(cp.employees_count) ??
      toNumberValue(cp.employeesCount) ??
      toNumberValue(ws.employees_count) ??
      toNumberValue(ws.employeesCount) ??
      fallback?.employees;

    const primaryService =
      toStringValue(cp.primary_service) ??
      toStringValue(cp.primaryService) ??
      toStringValue(ws.primary_service) ??
      toStringValue(ws.primaryService) ??
      fallback?.primaryService;

    const industry = toStringValue(cp.industry) ?? toStringValue(ws.industry) ?? fallback?.industry;

    const description = toStringValue(cp.description) ?? toStringValue(ws.description) ?? fallback?.description;

    const wallpaperCandidate =
      toStringValue(cp.wallpaperUrl) ??
      toStringValue(cp.wallpaper_url) ??
      toStringValue(ws.wallpaperUrl) ??
      toStringValue(ws.wallpaper_url) ??
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

            const f = toDataMap(fetched) ?? {};
            personal.fullName = toStringValue(f.name) ?? personal.fullName;
            personal.email = toStringValue(f.email) ?? personal.email;
            // support multiple possible photo fields returned by API
            const photoCandidate =
              toStringValue(f.profilePhotoUrl) ??
              toStringValue(f.profile_photo_url) ??
              toStringValue(f.photoUrl) ??
              toStringValue(f.photo_url) ??
              undefined;
            if (photoCandidate) {
              // defer setting photoUrl until fully loaded to avoid progressive render
              const candidate = photoCandidate;
              // keep preview empty until image fully loaded
              personal.photoUrl = undefined;
              // schedule preload after state updated below
              this.preloadAndSetAvatar(candidate).catch(() => {});
            }
            const phoneValue = toStringValue(f.phone);
            if (phoneValue) personal.phone = phoneValue;

            // map plan if available: resolve planId to title/price using applicationService
            const planId = toNumberValue(f.planId) ?? toNumberValue(f.plan_id) ?? undefined;
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
                  personal.planPrice = `${formatMoney(price, { precision: 0 })}/month`;
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
    } catch {
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
    } catch {
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
      message.error(isAppError(err) ? err.message : "Failed to save company information");
    } finally {
      this.setSafeState({ isSavingCompany: false });
      loadingService.hide();
    }
  };

  protected override renderPage(): React.ReactNode {
    const tabParam = typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("tab")?.toLowerCase()
      : undefined;
    const defaultTab = tabParam === "company" ? "company" : "personal";

    return (
      <div data-cy="users-profile-page">
        <ProfileTemplate
          personal={this.state.personal}
          company={this.state.company}
          categories={this.state.categories}
          industries={this.state.industries}
          defaultTab={defaultTab}
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
      </div>
    );
  }
}

export default ProfilePage;
