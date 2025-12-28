import React from "react";
import { PrivateFrameLayout } from "@shared/ui/layout/private-frame/private-frame.component";

type Props = {
  children?: React.ReactNode;
};

export default function UsersHomeTemplate({ children }: Props) {
  return <PrivateFrameLayout>{children}</PrivateFrameLayout>;
}
