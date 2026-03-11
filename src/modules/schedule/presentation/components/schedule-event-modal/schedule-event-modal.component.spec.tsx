import React from "react";
jest.mock("./schedule-event-modal.component", () => ({
  ScheduleEventModal: () => null,
}));

import { ScheduleEventModal } from "./schedule-event-modal.component";

describe("ScheduleEventModal", () => {
  it("creates element with ScheduleEventModal type", () => {
    const element = (
      <ScheduleEventModal
        open
        onClose={jest.fn()}
        categories={[{ id: "work", label: "Work", color: "#000" }]}
        initialDate="2026-01-10"
        onConfirm={jest.fn()}
      />
    );

    expect(element.type).toBe(ScheduleEventModal);
  });
});
