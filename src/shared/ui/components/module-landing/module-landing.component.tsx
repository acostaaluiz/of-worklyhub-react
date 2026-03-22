import React from "react";
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
  LandingCardLink,
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
  variant?: "default" | "soft-accent";
};

export function ModuleLanding({
  title,
  description,
  headerIcon,
  items,
  columns = 1,
  variant = "soft-accent",
}: ModuleLandingProps) {
  return (
    <LandingShell $variant={variant}>
      <LandingHeader>
        <div>
          <LandingTitleRow>
            {headerIcon ? (
              <LandingTitleIcon $variant={variant}>{headerIcon}</LandingTitleIcon>
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
          const destination = item.to;
          const isDisabled = item.disabled || !destination;
          const cardContent = (
            <>
              <CardIcon $disabled={isDisabled} $variant={variant}>
                {item.icon}
              </CardIcon>

              <CardContent>
                <CardTitle>{item.title}</CardTitle>
                {item.description ? (
                  <CardDescription>{item.description}</CardDescription>
                ) : null}
                {item.meta ? <CardMeta>{item.meta}</CardMeta> : null}
              </CardContent>

              <CardAction $disabled={isDisabled} $variant={variant}>
                <ChevronRight size={16} />
              </CardAction>
            </>
          );

          if (isDisabled || !destination) {
            return (
              <LandingCard
                key={item.id}
                type="button"
                disabled
                $disabled
                $variant={variant}
                aria-disabled
              >
                {cardContent}
              </LandingCard>
            );
          }

          return (
            <LandingCardLink
              key={item.id}
              to={destination}
              $disabled={false}
              $variant={variant}
            >
              {cardContent}
            </LandingCardLink>
          );
        })}
      </LandingGrid>
    </LandingShell>
  );
}

export default ModuleLanding;
