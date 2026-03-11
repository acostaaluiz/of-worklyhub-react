import React from "react";
jest.mock("./work-order-form.component", () => ({
  WorkOrderForm: () => null,
}));

import { WorkOrderForm } from "./work-order-form.component";

describe("WorkOrderForm", () => {
  it("creates element with WorkOrderForm type", () => {
    const element = (
      <WorkOrderForm
        workspaceId="ws-1"
        statuses={[]}
        onSubmit={jest.fn()}
      />
    );

    expect(element.type).toBe(WorkOrderForm);
  });
});
