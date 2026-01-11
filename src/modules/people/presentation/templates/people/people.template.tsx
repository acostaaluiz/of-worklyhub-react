import React from "react";
import { BaseTemplate } from "@shared/base/base.template";
import { PrivateFrameLayout } from "@shared/ui/layout/private-frame/private-frame.component";

export function PeopleTemplate(props: { title?: string; children?: React.ReactNode }) {
  const { title = "People", children } = props;
  return (
    <BaseTemplate
      content={
        <PrivateFrameLayout>
          <div style={{ padding: 16 }}>
            <h2 style={{ margin: 0 }}>{title}</h2>
            <div style={{ marginTop: 16 }}>{children}</div>
          </div>
        </PrivateFrameLayout>
      }
    />
  );
}

export default PeopleTemplate;
