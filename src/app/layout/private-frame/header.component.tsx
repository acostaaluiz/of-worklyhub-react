import React from "react";
import { Avatar, Menu, Button, Space, Dropdown, Badge, Drawer, type MenuProps } from "antd";
import { Briefcase, Calendar, CreditCard, DollarSign, LayoutDashboard, LayoutGrid, Search, Users, Box, Bell, Menu as MenuIcon } from "lucide-react";
import { worklyHubLogoUrl } from "@shared/assets/brand";
import type { BaseProps } from "@shared/base/interfaces/base-props.interface";
import { BaseComponent } from "@shared/base/base.component";
import type { BaseState } from "@shared/base/interfaces/base-state.interface";
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
  MobileMenuButton,
} from "./header.component.styles";

// menu items are provided by parent via props

type Props = BaseProps & {
  onNavigate?: (path: string) => void;
  onLogout?: () => void;
  onUpgrade?: () => void;
  onNotificationsClick?: () => void;
  unreadNotifications?: number;
  selectedPath?: string;
  menuItems?: MenuProps["items"];
  userMenuItems?: MenuProps["items"];
};

type State = BaseState & {
  mobileMenuOpen: boolean;
};

export class AppHeader extends BaseComponent<Props, State> {
  public state: State = {
    isLoading: false,
    error: undefined,
    mobileMenuOpen: false,
  };

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

  private handleOpenMobileMenu = () => {
    this.setSafeState({ mobileMenuOpen: true });
  };

  private handleCloseMobileMenu = () => {
    this.setSafeState({ mobileMenuOpen: false });
  };

  protected override renderView(): React.ReactNode {
    const { selectedPath, menuItems } = this.props;
    const unreadCount = Math.max(0, Number(this.props.unreadNotifications ?? 0));
    const hasUnread = unreadCount > 0;
    const isPhoneViewport =
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 768px)").matches;
    const drawerWidth = isPhoneViewport ? "100%" : 340;

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

    const handleNavigateAndClose = (path: string) => {
      this.props.onNavigate?.(path);
      this.handleCloseMobileMenu();
    };

    const mobileMenu: MenuProps = {
      items: menuItems,
      selectedKeys: selectedKeys?.length ? selectedKeys : [selectedPath ?? "/"],
      onClick: ({ key }) => handleNavigateAndClose(String(key)),
    };

    const mobileUserMenu: MenuProps = {
      items: this.props.userMenuItems,
      onClick: ({ key }) => {
        const k = String(key);
        if (k === "logout") {
          this.props.onLogout?.();
        } else {
          this.props.onNavigate?.(k);
        }
        this.handleCloseMobileMenu();
      },
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

              <MobileMenuButton
                type="button"
                onClick={this.handleOpenMobileMenu}
                aria-label="Open navigation menu"
              >
                <MenuIcon size={18} />
              </MobileMenuButton>
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
                <Button
                  className={`notifications-button${hasUnread ? " has-unread" : ""}`}
                  onClick={() => this.props.onNotificationsClick?.()}
                  aria-label="Notifications"
                >
                  <Badge count={unreadCount} size="small" overflowCount={99} showZero={false}>
                    <Bell size={16} />
                  </Badge>
                </Button>

                <Button className="upgrade-button" onClick={() => this.props.onUpgrade?.()}>
                  Upgrade
                </Button>

                <Dropdown
                  menu={userMenu}
                  placement="bottomRight"
                  trigger={["click"]}
                  getPopupContainer={() => document.body}
                  styles={{ root: { zIndex: 2000 } }}
                >
                  <Avatar shape="circle" className="user-avatar">
                    U
                  </Avatar>
                </Dropdown>
              </Space>
            </Right>
          </HeaderInner>
        </div>

        <Drawer
          title="Menu"
          placement="left"
          width={drawerWidth}
          onClose={this.handleCloseMobileMenu}
          open={this.state.mobileMenuOpen}
          zIndex={1600}
          rootClassName="mobile-nav-drawer"
          styles={{
            header: {
              borderBottom: "1px solid var(--color-divider)",
              background: "color-mix(in srgb, var(--color-surface-2) 70%, var(--color-surface))",
            },
            body: {
              padding: 12,
              background: "var(--color-surface-elevated)",
            },
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 12, minHeight: "100%" }}>
            <Menu
              mode="inline"
              items={mobileMenu.items}
              selectedKeys={mobileMenu.selectedKeys}
              onClick={mobileMenu.onClick}
              style={{
                border: "1px solid var(--color-divider)",
                borderRadius: 12,
                background: "color-mix(in srgb, var(--color-surface-2) 65%, var(--color-surface))",
              }}
            />

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Button onClick={() => { this.props.onNotificationsClick?.(); this.handleCloseMobileMenu(); }}>
                Notifications
              </Button>
              <Button type="primary" onClick={() => { this.props.onUpgrade?.(); this.handleCloseMobileMenu(); }}>
                Upgrade
              </Button>
            </div>

            <Menu
              mode="inline"
              items={mobileUserMenu.items}
              onClick={mobileUserMenu.onClick}
              style={{
                border: "1px solid var(--color-divider)",
                borderRadius: 12,
                background: "color-mix(in srgb, var(--color-surface-2) 65%, var(--color-surface))",
              }}
            />
          </div>
        </Drawer>
      </HeaderShell>
    );
  }
}

export default AppHeader;
