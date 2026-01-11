import React from "react";
import { BasePage } from "@shared/base/base.page";
import ProfileTemplate, { type PersonalModel, type CompanyModel } from "@modules/users/presentation/templates/profile/profile.template";
import { usersAuthService } from "@modules/users/services/auth.service";
import { usersService } from "@modules/users/services/user.service";
import { companyService } from "@modules/company/services/company.service";
import { applicationService } from "@core/application/application.service";
import AvatarUploadModal from "@shared/ui/components/avatar-upload/avatar-upload.modal";
import { message } from "antd";

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

  protected override async onInit(): Promise<void> {
    await this.runAsync(async () => {
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
                  personal.planPrice = (price as number).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }) + "/month";
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
            const ws: any = cached;
            const cp: any = ws.company_profile ?? {};
            const company = {
              accountType:
                (ws.workspace_type as "individual" | "company") ??
                (ws.accountType as "individual" | "company") ??
                "individual",
              companyName:
                (ws.name as string) ?? (ws.companyName as string) ?? (cp.name as string) ?? undefined,
              tradeName:
                (cp.trade_name as string) ?? (cp.tradeName as string) ?? (ws.trade_name as string) ?? (ws.tradeName as string) ?? undefined,
              employees:
                (cp.employees_count as number) ?? (cp.employeesCount as number) ?? (ws.employees_count as number) ?? (ws.employeesCount as number) ?? undefined,
              primaryService:
                (cp.primary_service as string) ?? (cp.primaryService as string) ?? (ws.primary_service as string) ?? (ws.primaryService as string) ?? undefined,
              industry: (cp.industry as string) ?? (ws.industry as string) ?? undefined,
              description: (cp.description as string) ?? (ws.description as string) ?? undefined,
              // delay wallpaper until fully loaded to avoid partial render
              wallpaperUrl: undefined as any,
            } as CompanyModel;

            this.setSafeState({ personal, company });
            // if there is a wallpaper candidate, preload and set when ready
            const wallpaperCandidate =
              (cp.wallpaperUrl as string) ?? (cp.wallpaper_url as string) ?? (ws.wallpaperUrl as string) ?? (ws.wallpaper_url as string) ?? undefined;
            if (wallpaperCandidate) this.preloadAndSetWallpaper(wallpaperCandidate).catch(() => {});
            return;
          }

          // if no cached workspace, fetch from API
          const workspace = await companyService.fetchWorkspaceByEmail(session.email);
          if (workspace) {
            console.log(`workspace fetched for email ${session.email}:`, workspace);
            const ws: any = workspace;
            const cp: any = ws.company_profile ?? {};
            const company = {
              accountType:
                (ws.workspace_type as "individual" | "company") ??
                (ws.accountType as "individual" | "company") ??
                "individual",
              companyName:
                (ws.name as string) ?? (ws.companyName as string) ?? (cp.name as string) ?? undefined,
              tradeName:
                (cp.trade_name as string) ?? (cp.tradeName as string) ?? (ws.trade_name as string) ?? (ws.tradeName as string) ?? undefined,
              employees:
                (cp.employees_count as number) ?? (cp.employeesCount as number) ?? (ws.employees_count as number) ?? (ws.employeesCount as number) ?? undefined,
              primaryService:
                (cp.primary_service as string) ?? (cp.primaryService as string) ?? (ws.primary_service as string) ?? (ws.primaryService as string) ?? undefined,
              industry: (cp.industry as string) ?? (ws.industry as string) ?? undefined,
              description: (cp.description as string) ?? (ws.description as string) ?? undefined,
              wallpaperUrl: undefined as any,
            } as CompanyModel;

            this.setSafeState({ personal, company });
            const wallpaperCandidate =
              (cp.wallpaperUrl as string) ?? (cp.wallpaper_url as string) ?? (ws.wallpaperUrl as string) ?? (ws.wallpaper_url as string) ?? undefined;
            if (wallpaperCandidate) this.preloadAndSetWallpaper(wallpaperCandidate).catch(() => {});
            return;
          }
        } catch {
          // ignore
        }
      }

      // fallback: set personal only
      this.setSafeState({ personal, company: undefined });
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
        const ws: any = cached;
        const cp: any = ws.company_profile ?? {};
        const company = {
          accountType:
            (ws.workspace_type as "individual" | "company") ??
            (ws.accountType as "individual" | "company") ??
            "individual",
          companyName:
            (ws.name as string) ?? (ws.companyName as string) ?? (cp.name as string) ?? undefined,
          tradeName:
            (cp.trade_name as string) ?? (cp.tradeName as string) ?? (ws.trade_name as string) ?? (ws.tradeName as string) ?? undefined,
          employees:
            (cp.employees_count as number) ?? (cp.employeesCount as number) ?? (ws.employees_count as number) ?? (ws.employeesCount as number) ?? undefined,
          primaryService:
            (cp.primary_service as string) ?? (cp.primaryService as string) ?? (ws.primary_service as string) ?? (ws.primaryService as string) ?? undefined,
          industry: (cp.industry as string) ?? (ws.industry as string) ?? undefined,
          description: (cp.description as string) ?? (ws.description as string) ?? undefined,
          wallpaperUrl: undefined as any,
        } as any;

        this.setSafeState({ company });
        const wallpaperCandidate =
          (cp.wallpaperUrl as string) ?? (cp.wallpaper_url as string) ?? (ws.wallpaperUrl as string) ?? (ws.wallpaper_url as string) ?? undefined;
        if (wallpaperCandidate) await this.preloadAndSetWallpaper(wallpaperCandidate);
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
    await this.runAsync(async () => {
      this.setSafeState({ personal: values, isSavingPersonal: true });
      // UI-only: simulate save
      await new Promise((r) => setTimeout(r, 600));
      message.success("Personal information saved");
    }, { setLoading: false }).finally(() => this.setSafeState({ isSavingPersonal: false }));
  };

  private handleSaveCompany = async (values: CompanyModel) => {
    await this.runAsync(async () => {
      this.setSafeState({ company: values, isSavingCompany: true });
      // UI-only: simulate save
      await new Promise((r) => setTimeout(r, 600));
      message.success("Company information saved");
    }, { setLoading: false }).finally(() => this.setSafeState({ isSavingCompany: false }));
  };

  protected override renderPage(): React.ReactNode {
    return (
      <>
        <ProfileTemplate
          personal={this.state.personal}
          company={this.state.company}
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
