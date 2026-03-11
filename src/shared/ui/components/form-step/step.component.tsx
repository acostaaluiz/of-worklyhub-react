import type { ReactElement, ReactNode } from "react";
import {
  StepItem,
  StepMeta,
  StepSubtitle,
  StepTitle,
  StepTitleRow,
} from "./step.component.styles";

export type StepStatus = "done" | "active" | "pending";

type StepProps = {
  index: number;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  status: StepStatus;
  onClick?: () => void;
};

export function Step({
  index,
  title,
  subtitle,
  icon,
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
          <StepTitleRow>
            {icon ? <span className="icon">{icon}</span> : null}
            <StepTitle>{title}</StepTitle>
          </StepTitleRow>
          {subtitle ? <StepSubtitle>{subtitle}</StepSubtitle> : null}
        </div>
      </StepMeta>
    </StepItem>
  );
}
