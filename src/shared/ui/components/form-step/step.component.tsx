import type { ReactElement } from "react";
import {
  StepItem,
  StepMeta,
  StepSubtitle,
  StepTitle,
} from "./step.component.styles";

export type StepStatus = "done" | "active" | "pending";

type StepProps = {
  index: number;
  title: string;
  subtitle?: string;
  status: StepStatus;
  onClick?: () => void;
};

export function Step({
  index,
  title,
  subtitle,
  status,
  onClick,
}: StepProps): ReactElement {
  return (
    <StepItem
      type="button"
      onClick={onClick}
      $status={status}
      aria-current={status === "active" ? "step" : undefined}
    >
      <StepMeta>
        <span className="badge">{index}</span>
        <div>
          <StepTitle>{title}</StepTitle>
          {subtitle ? <StepSubtitle>{subtitle}</StepSubtitle> : null}
        </div>
      </StepMeta>
    </StepItem>
  );
}
