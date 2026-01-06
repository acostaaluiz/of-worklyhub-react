import React from "react";
import { BasePage } from "@shared/base/base.page";
import ProfileTemplate, { type PersonalModel, type CompanyModel } from "@modules/users/presentation/templates/profile/profile.template";
import { usersAuthService } from "@modules/users/services/auth.service";
import { usersService } from "@modules/users/services/user.service";
import { companyService } from "@modules/company/services/company.service";
import AvatarUploadModal from "@shared/ui/components/avatar-upload/avatar-upload.modal";
import { message } from "antd";

type State = {
  isLoading: boolean;
  initialized: boolean;
  personal: PersonalModel;
  company?: CompanyModel;
  avatarModalOpen?: boolean;
  isUploadingAvatar?: boolean;
  isSavingPersonal?: boolean;
  isSavingCompany?: boolean;
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
    isUploadingAvatar: false,
    isSavingPersonal: false,
    isSavingCompany: false,
  };

  protected override async onInit(): Promise<void> {
    await this.runAsync(async () => {
      const session = usersAuthService.getSessionValue();

      const personal: PersonalModel = {
        fullName: (session?.name as string) ?? "",
        email: session?.email ?? "",
        phone: undefined,
        photoUrl: session?.photoUrl ?? undefined,
      };

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
            if ((f as any).photoUrl) personal.photoUrl = (f as any).photoUrl;
            if ((f as any).phone) personal.phone = (f as any).phone;
          }
        } catch {
          // ignore fetch errors
        }

        // fetch workspace for this user by email
        try {
          const workspace = await companyService.fetchWorkspaceByEmail(session.email);
          if (workspace) {
            console.log(`workspace fetched for email ${session.email}:`, workspace);
            // API uses snake_case keys; map them to our CompanyModel shape
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
              } as CompanyModel;

            this.setSafeState({ personal, company });
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

  private handleCloseAvatar = () => this.setSafeState({ avatarModalOpen: false, isUploadingAvatar: false });

  private handleUploadAvatar = async (file: File) => {
    this.setSafeState({ isUploadingAvatar: true });
    try {
      // UI-only: create object URL to preview uploaded image
      const url = URL.createObjectURL(file);
      this.setSafeState({ personal: { ...this.state.personal, photoUrl: url } });
      message.success("Profile photo updated (local preview)");
    } catch (err) {
      message.error("Failed to upload photo");
    } finally {
      this.setSafeState({ isUploadingAvatar: false, avatarModalOpen: false });
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
          onSavePersonal={this.handleSavePersonal}
          onSaveCompany={this.handleSaveCompany}
        />

        <AvatarUploadModal open={!!this.state.avatarModalOpen} onClose={this.handleCloseAvatar} onUpload={this.handleUploadAvatar} isUploading={!!this.state.isUploadingAvatar} />
      </>
    );
  }
}

export default ProfilePage;
