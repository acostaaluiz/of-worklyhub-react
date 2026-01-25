import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";

import {
  LandingShell,
  LandingHeader,
  LandingTitleRow,
  LandingTitle,
  LandingTitleIcon,
  LandingDescription,
  LandingGrid,
  LandingCard,
  CardIcon,
  CardContent,
  CardTitle,
  CardDescription,
  CardMeta,
  CardAction,
} from "./module-landing.component.styles";

export type ModuleLandingItem = {
  id: string;
  title: string;
  description?: string;
  to?: string;
  icon?: React.ReactNode;
  meta?: string;
  disabled?: boolean;
};

export type ModuleLandingProps = {
  title: string;
  description?: string;
  headerIcon?: React.ReactNode;
  items: ModuleLandingItem[];
  columns?: number;
};

export function ModuleLanding({
  title,
  description,
  headerIcon,
  items,
  columns = 1,
}: ModuleLandingProps) {
  const navigate = useNavigate();

  return (
    <LandingShell>
      <LandingHeader>
        <div>
          <LandingTitleRow>
            {headerIcon ? (
              <LandingTitleIcon>{headerIcon}</LandingTitleIcon>
            ) : null}
            <LandingTitle>{title}</LandingTitle>
          </LandingTitleRow>
          {description ? (
            <LandingDescription>{description}</LandingDescription>
          ) : null}
        </div>
      </LandingHeader>

      <LandingGrid $columns={columns}>
        {items.map((item) => {
          const isDisabled = item.disabled || !item.to;

          return (
            <LandingCard
              key={item.id}
              type="button"
              $disabled={isDisabled}
              aria-disabled={isDisabled}
              onClick={() => {
                if (!isDisabled && item.to) navigate(item.to);
              }}
            >
              <CardIcon $disabled={isDisabled}>{item.icon}</CardIcon>

              <CardContent>
                <CardTitle>{item.title}</CardTitle>
                {item.description ? (
                  <CardDescription>{item.description}</CardDescription>
                ) : null}
                {item.meta ? <CardMeta>{item.meta}</CardMeta> : null}
              </CardContent>

              <CardAction $disabled={isDisabled}>
                <ChevronRight size={16} />
              </CardAction>
            </LandingCard>
          );
        })}
      </LandingGrid>
    </LandingShell>
  );
}

export default ModuleLanding;
