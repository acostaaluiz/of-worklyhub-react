import React from "react";
import { Avatar, Menu, Button, Space, Dropdown, type MenuProps } from "antd";
import { Briefcase, Calendar, CreditCard, DollarSign, LayoutDashboard, LayoutGrid, Search, Users, Box } from "lucide-react";
import { worklyHubLogoUrl } from "@shared/assets/brand";
import type { BaseProps } from "@shared/base/interfaces/base-props.interface";
import { BaseComponent } from "@shared/base/base.component";
import { FieldIcon } from "@shared/styles/global";
import { Svg } from "@shared/ui/components/svg/svg.component";
import { AutocompleteInput, type AutocompleteItem } from "@shared/ui/components/autocomplete/autocomplete.component";
import { usersOverviewService } from "@modules/users/services/overview.service";
import { resolveModulePath } from "@modules/users/presentation/utils/module-navigation";

import {
  HeaderShell,
  HeaderInner,
  Left,
  Brand,
  Nav,
  Center,
  Right,
  SearchWrap,
} from "./header.component.styles";

// menu items are provided by parent via props

type Props = BaseProps & {
  onNavigate?: (path: string) => void;
  onLogout?: () => void;
  onUpgrade?: () => void;
  selectedPath?: string;
  menuItems?: MenuProps["items"];
  userMenuItems?: MenuProps["items"];
};

export class AppHeader extends BaseComponent<Props> {
  private mapIcon(key?: string): React.ReactNode {
    switch (key) {
      case "calendar":
        return <Calendar />;
      case "users":
        return <Users />;
      case "dollar-sign":
        return <DollarSign />;
      case "credit-card":
        return <CreditCard />;
      case "dashboard":
        return <LayoutDashboard />;
      case "box":
      case "inventory":
      case "stock":
        return <Box />;
      default:
        return <Briefcase />;
    }
  }

  private searchModules = async (query: string): Promise<AutocompleteItem[]> => {
    const normalized = (query ?? "").toLowerCase().trim();

    try {
      const overview = usersOverviewService.getOverviewValue() ?? (await usersOverviewService.fetchOverview());
      const modules = overview?.modules ?? [];

      const items: AutocompleteItem[] = modules
        .map((m) => ({
          key: m.uid,
          title: m.name,
          subtitle: m.description ?? "",
          value: m.name,
          icon: this.mapIcon(m.icon),
          meta: { to: resolveModulePath({ id: m.uid, title: m.name }, "/modules") },
        }))
        .filter((item) => {
          if (!normalized) return true;
          const bucket = `${item.title ?? ""} ${item.subtitle ?? ""}`.toLowerCase();
          return bucket.includes(normalized);
        });

      const seeAllPath = resolveModulePath({ id: "all-modules", title: "All modules" }, "/modules");
      if (seeAllPath) {
        items.push({
          key: "all-modules",
          title: "See all modules",
          subtitle: "View all available modules",
          value: "See all modules",
          icon: <LayoutGrid />,
          meta: { to: seeAllPath },
        });
      }

      return items;
    } catch (err) {
      console.debug("module search failed", err);
      return [];
    }
  };

  private handleModuleSelect = (item: AutocompleteItem) => {
    const to = (item.meta as { to?: string } | undefined)?.to ?? resolveModulePath({ id: item.key, title: item.title }, "/modules");
    if (to) this.props.onNavigate?.(to);
  };

  protected override renderView(): React.ReactNode {
    const { selectedPath, menuItems } = this.props;

    const selectedKeys = menuItems
      ?.map((i) => (typeof i?.key === "string" ? i.key : ""))
      .filter(Boolean)
      .filter((key) => selectedPath?.startsWith(key));

    const handleMenuClick: MenuProps["onClick"] = ({ key }) => {
      const k = String(key);
      if (k === "logout") {
        this.props.onLogout?.();
        return;
      }
      this.props.onNavigate?.(k);
    };

    const userMenu: MenuProps = {
      items: this.props.userMenuItems,
      onClick: handleMenuClick,
    };

    return (
      <HeaderShell>
        <div className="container">
          <HeaderInner>
            <Left>
              <Brand onClick={() => this.props.onNavigate?.("/home")} role="button" tabIndex={0}>
                <Svg
                  src={worklyHubLogoUrl}
                  alt="WorklyHub"
                  size={48}
                  loading="eager"
                  className="brand-logo"
                />
                <span>WorklyHub</span>
              </Brand>
            </Left>

            <Nav>
              <Menu
                mode="horizontal"
                selectedKeys={selectedKeys?.length ? selectedKeys : [selectedPath ?? "/"]}
                items={menuItems}
                onClick={({ key }) => this.props.onNavigate?.(String(key))}
              />
            </Nav>

            <Center>
              <SearchWrap>
                <AutocompleteInput
                  placeholder="Search modules"
                  prefix={
                    <FieldIcon aria-hidden>
                      <Search size={18} />
                    </FieldIcon>
                  }
                  maxItems={4}
                  fetchItems={this.searchModules}
                  onSelect={this.handleModuleSelect}
                />
              </SearchWrap>
            </Center>

            <Right>
              <Space size="small">
                <Button style={{ borderRadius: "999px" }} onClick={() => this.props.onUpgrade?.()}>
                  Upgrade
                </Button>

                <Dropdown
                  menu={userMenu}
                  placement="bottomRight"
                  trigger={["click"]}
                  getPopupContainer={() => document.body}
                  styles={{ root: { zIndex: 2000 } }}
                >
                  <Avatar shape="circle" style={{ cursor: "pointer" }}>
                    U
                  </Avatar>
                </Dropdown>
              </Space>
            </Right>
          </HeaderInner>
        </div>
      </HeaderShell>
    );
  }
}

export default AppHeader;
