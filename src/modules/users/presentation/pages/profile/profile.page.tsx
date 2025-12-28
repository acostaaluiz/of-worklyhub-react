import React from "react";
import { BasePage } from "@shared/base/base.page";
import ProfileTemplate from "@modules/users/presentation/templates/profile/profile.template";
import ProfileInfo from "@modules/users/presentation/components/profile/profile.component";
import { usersAuthService } from "@modules/users/services/auth.service";

export class ProfilePage extends BasePage {
  protected override options = { title: "Profile | WorklyHub", requiresAuth: true };

  protected override renderPage(): React.ReactNode {
    const session = usersAuthService.getSessionValue();
    return (
      <ProfileTemplate>
        <ProfileInfo session={session} />
      </ProfileTemplate>
    );
  }
}

export default ProfilePage;
