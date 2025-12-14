import { type PropsWithChildren } from "react";
import { PublicFrame, PublicPageShell } from "./public-frame.component.styles";

export function PublicFrameLayout({ children }: PropsWithChildren) {
  return (
    <PublicPageShell>
      <div className="container">
        <PublicFrame>{children}</PublicFrame>
      </div>
    </PublicPageShell>
  );
}
