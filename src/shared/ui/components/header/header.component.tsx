import React from "react";
import { Avatar, Input, Menu, Button, Space, Dropdown, type MenuProps } from "antd";
import { Search } from "lucide-react";
import { worklyHubLogoUrl } from "@shared/assets/brand";
import type { BaseProps } from "@shared/base/interfaces/base-props.interface";
import { BaseComponent } from "@shared/base/base.component";
import { FieldIcon } from "@shared/styles/global";
import { Svg } from "@shared/ui/components/svg/svg.component";

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
              <Brand onClick={() => this.props.onNavigate?.("/")} role="button" tabIndex={0}>
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
                <Input
                  placeholder="Search"
                  allowClear
                  prefix={
                    <FieldIcon aria-hidden>
                      <Search size={18} />
                    </FieldIcon>
                  }
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
