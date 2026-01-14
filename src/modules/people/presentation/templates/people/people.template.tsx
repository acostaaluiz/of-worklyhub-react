import React from "react";
import { BaseTemplate } from "@shared/base/base.template";

export function PeopleTemplate(props: { title?: string; children?: React.ReactNode }) {
  const { title = "People", children } = props;
  return (
    <BaseTemplate
      content={
        <>
          <div style={{ padding: 16 }}>
            <h2 style={{ margin: 0 }}>{title}</h2>
            <div style={{ marginTop: 16 }}>{children}</div>
          </div>
        </>
      }
    />
  );
}

export default PeopleTemplate;
