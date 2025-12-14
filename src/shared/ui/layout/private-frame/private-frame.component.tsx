import { type PropsWithChildren } from "react";
import { PrivateFrame, PrivatePageShell } from "./private-frame.component.styles";


export function PrivateFrameLayout({ children }: PropsWithChildren) {
  return (
    <PrivatePageShell>
      <div className="container">
        <PrivateFrame>{children}</PrivateFrame>
      </div>
    </PrivatePageShell>
  );
}
