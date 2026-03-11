import React from "react";
import { MotionConfig } from "framer-motion";
import { BookOpenCheck, Compass, LayoutGrid } from "lucide-react";

import { navigateTo } from "@core/navigation/navigation.service";
import { BaseComponent } from "@shared/base/base.component";
import type { BaseProps } from "@shared/base/interfaces/base-props.interface";
import type { ModuleLandingItem } from "@shared/ui/components/module-landing/module-landing.component";
import {
  EmptyState,
  EmptyText,
  EmptyTitle,
  HeroActions,
  HeroGhostButton,
  HeroIcon,
  HeroIdentity,
  HeroMainRow,
  HeroOrbs,
  HeroPrimaryButton,
  HeroStats,
  HeroTag,
  HeroText,
  HeroTitle,
  HeroTitleBlock,
  ModuleCard,
  ModuleDescription,
  ModuleFooter,
  ModuleIcon,
  ModuleTag,
  ModuleTitle,
  ModuleTop,
  ModulesGrid,
  ModulesShowcase,
  ShowcaseHero,
} from "./all-modules.component.styles";

type Props = BaseProps & {
  items: ModuleLandingItem[];
  title?: string;
  description?: string;
  planTitle?: string;
};

type State = {
  isLoading: boolean;
  error?: DataValue;
};

export class AllModulesComponent extends BaseComponent<Props, State> {
  public state: State = { isLoading: false, error: undefined };

  private openPath(path?: string) {
    if (!path) return;
    navigateTo(path);
  }

  private openFirstAvailable(items: ModuleLandingItem[]) {
    const first = items.find((item) => item.to && !item.disabled);
    if (first?.to) this.openPath(first.to);
  }

  protected override renderView(): React.ReactNode {
    const { items, title, description, planTitle } = this.props;

    if (!items || items.length === 0) {
      return (
        <EmptyState className="surface">
          <EmptyTitle>No modules available</EmptyTitle>
          <EmptyText>
            There are no services available to show yet.
          </EmptyText>
        </EmptyState>
      );
    }

    const enabledModules = items.filter((item) => !!item.to && !item.disabled).length;

    return (
      <MotionConfig reducedMotion="user">
        <ModulesShowcase
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <ShowcaseHero
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.36, delay: 0.06 }}
          >
            <HeroOrbs aria-hidden>
              <span className="orb-a" />
              <span className="orb-b" />
            </HeroOrbs>

            <HeroMainRow>
              <HeroIdentity>
                <HeroIcon
                  animate={{ rotate: [0, -6, 4, 0], scale: [1, 1.05, 1] }}
                  transition={{ duration: 4.6, repeat: Infinity, ease: "easeInOut" }}
                >
                  <LayoutGrid size={20} />
                </HeroIcon>

                <HeroTitleBlock>
                  <HeroTitle level={3}>
                    {title ?? "All modules"}
                  </HeroTitle>
                  <HeroText>
                    {description ??
                      (planTitle
                        ? `Current plan: ${planTitle}`
                        : "Explore and launch every service available in WorklyHub.")}
                  </HeroText>
                </HeroTitleBlock>
              </HeroIdentity>

              <HeroStats>
                <HeroTag color="geekblue">{items.length} modules</HeroTag>
                <HeroTag color="cyan">{enabledModules} available now</HeroTag>
                <HeroTag color="gold">discovery mode</HeroTag>
              </HeroStats>
            </HeroMainRow>

            <HeroActions>
              <HeroPrimaryButton
                type="primary"
                icon={<BookOpenCheck size={16} />}
                onClick={() => navigateTo("/tutorials")}
              >
                Guided tour
              </HeroPrimaryButton>
              <HeroGhostButton
                icon={<Compass size={16} />}
                onClick={() => this.openFirstAvailable(items)}
              >
                Start exploring
              </HeroGhostButton>
            </HeroActions>
          </ShowcaseHero>

          <ModulesGrid>
            {items.map((item, index) => {
              const isDisabled = item.disabled || !item.to;

              return (
                <ModuleCard
                  key={item.id}
                  $disabled={isDisabled}
                  role="button"
                  tabIndex={isDisabled ? -1 : 0}
                  aria-disabled={isDisabled}
                  onClick={() => {
                    if (!isDisabled) this.openPath(item.to);
                  }}
                  onKeyDown={(event) => {
                    if (isDisabled) return;
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      this.openPath(item.to);
                    }
                  }}
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.28, delay: index * 0.03 }}
                >
                  <ModuleTop>
                    <ModuleIcon
                      animate={{ rotate: [0, -4, 4, 0] }}
                      transition={{ duration: 3.2 + (index % 3) * 0.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                      {item.icon}
                    </ModuleIcon>
                    <div>
                      <ModuleTitle>{item.title}</ModuleTitle>
                      {item.description ? (
                        <ModuleDescription>{item.description}</ModuleDescription>
                      ) : null}
                    </div>
                  </ModuleTop>

                  <ModuleFooter>
                    <ModuleTag color={index < 3 ? "gold" : "blue"}>
                      {index < 3 ? "Recommended" : "Module"}
                    </ModuleTag>
                  </ModuleFooter>
                </ModuleCard>
              );
            })}
          </ModulesGrid>
        </ModulesShowcase>
      </MotionConfig>
    );
  }
}

export default AllModulesComponent;
