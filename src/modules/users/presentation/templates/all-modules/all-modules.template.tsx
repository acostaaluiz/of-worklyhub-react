import { BaseTemplate } from "@shared/base/base.template";
import AllModulesComponent from "@modules/users/presentation/components/all-modules/all-modules.component";
import type { ModuleLandingItem } from "@shared/ui/components/module-landing/module-landing.component";

type Props = {
  items: ModuleLandingItem[];
};

export function AllModulesTemplate({ items }: Props) {
  return <BaseTemplate content={<AllModulesComponent items={items} />} />;
}

export default AllModulesTemplate;
