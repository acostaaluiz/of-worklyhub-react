import {
  Avatar,
  Input,
  Menu,
  Button,
  Space,
  Dropdown,
  type MenuProps,
} from "antd";
import { Search } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import { FieldIcon } from "@shared/styles/global";

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

const menuItems: MenuProps["items"] = [
  { key: "/company/introduction", label: "Company setup" },
  { key: "/billing/plans", label: "Billing" },
  { key: "/users", label: "Users" },
];

export function AppHeader() {
  const navigate = useNavigate();
  const location = useLocation();

  const selectedKeys = menuItems
    ?.map((i) => (typeof i?.key === "string" ? i.key : ""))
    .filter(Boolean)
    .filter((key) => location.pathname.startsWith(key));

  const userMenu: MenuProps = {
    items: [
      { key: "profile", label: "Profile" },
      { key: "settings", label: "Settings" },
      { type: "divider" },
      { key: "logout", label: "Sign out" },
    ],
    onClick: ({ key }) => {
      if (key === "logout") return;
    },
  };

  return (
    <HeaderShell>
      <div className="container">
        <HeaderInner>
          <Left>
            <Brand onClick={() => navigate("/")} role="button" tabIndex={0}>
              WorklyHub
            </Brand>
          </Left>

          <Nav>
            <Menu
              mode="horizontal"
              selectedKeys={
                selectedKeys?.length ? selectedKeys : [location.pathname]
              }
              items={menuItems}
              onClick={({ key }) => navigate(String(key))}
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
              <Button
                style={{ borderRadius: "999px" }}
                onClick={() => navigate("/billing/plans")}
              >
                Upgrade
              </Button>

              <Dropdown
                menu={userMenu}
                placement="bottomRight"
                trigger={["click"]}
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
