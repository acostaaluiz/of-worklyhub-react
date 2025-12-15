import { type PropsWithChildren } from "react";

import { AppHeader } from "@shared/ui/components/header/header.component";
import { AppFooter } from "@shared/ui/components/footer/footer.component";

import {
  PrivateFrame,
  PrivatePageShell,
  ContentShell,
} from "./private-frame.component.styles";

export function PrivateFrameLayout({ children }: PropsWithChildren) {
  return (
    <PrivatePageShell>
      <AppHeader />

      <ContentShell>
        <div className="container">
          <PrivateFrame>{children}</PrivateFrame>
        </div>
      </ContentShell>

      <AppFooter />
    </PrivatePageShell>
  );
}
