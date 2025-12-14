import type { ReactElement } from "react";
import type { IconProps } from "./icon.interface";
import { IconBox } from "./icon.styles";

export function Icon({
  icon: Lucide,
  size = "md",
  color = "default",
  strokeWidth,
  "aria-label": ariaLabel,
}: IconProps): ReactElement {
  const resolvedColor =
    color === "muted" ? "var(--icon-color-muted)" : "var(--icon-color)";

  return (
    <IconBox $size={size} aria-label={ariaLabel}>
      <Lucide
        color={resolvedColor}
        strokeWidth={
          strokeWidth ??
          Number(
            getComputedStyle(document.documentElement).getPropertyValue(
              "--icon-stroke"
            ) || 2
          )
        }
      />
    </IconBox>
  );
}
