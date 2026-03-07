import React from "react";
import { WorkOrderList } from "./work-order-list.component";

describe("WorkOrderList", () => {
  it("creates element with WorkOrderList type", () => {
    const element = (
      <WorkOrderList
        orders={[]}
        statuses={[]}
        filters={{}}
        onChangeFilters={jest.fn()}
        onApplyFilters={jest.fn()}
        onResetFilters={jest.fn()}
        onLoadMore={jest.fn()}
        onSelect={jest.fn()}
        onCreate={jest.fn()}
        onDelete={jest.fn()}
        onRefresh={jest.fn()}
      />
    );

    expect(element.type).toBe(WorkOrderList);
  });
});
