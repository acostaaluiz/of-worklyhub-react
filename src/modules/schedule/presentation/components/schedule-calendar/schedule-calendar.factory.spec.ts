import {
  buildCalendarTemplates,
  normalizeCssColor,
} from "./schedule-calendar.factory";

describe("schedule-calendar.factory", () => {
  it("normalizes safe color values", () => {
    expect(normalizeCssColor("#abc")).toBe("#aabbcc");
    expect(normalizeCssColor("rgb(255, 0, 128)")).toBe("#ff0080");
    expect(normalizeCssColor("var(--color-primary)")).toBe(
      "var(--color-primary)"
    );
  });

  it("rejects unsafe interpolated color strings", () => {
    expect(
      normalizeCssColor('red; background:url("javascript:alert(1)")')
    ).toBeUndefined();
  });

  it("uses safe fallback colors in HTML templates when raw color is unsafe", () => {
    const templates = buildCalendarTemplates();
    const html = templates.monthGridEvent({
      title: "Event",
      raw: {
        categoryColor: 'red; background:url("javascript:alert(1)")',
      },
      backgroundColor: "#123456",
      color: "#ffffff",
    } as never);

    expect(html).toContain("background:#123456");
    expect(html).not.toContain("javascript:");
  });
});

