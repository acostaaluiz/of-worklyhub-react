import { Divider, Space, Typography } from "antd";
import { useLocation, useNavigate } from "react-router-dom";

import {
  FooterShell,
  FooterInner,
  Left,
  Brand,
  Right,
  LinksRow,
  FooterLink,
} from "./footer.component.styles";

type FooterLinkItem = {
  label: string;
  to: string;
};

const links: FooterLinkItem[] = [
  { label: "Company setup", to: "/company/introduction" },
  { label: "Billing", to: "/billing/landing" },
  { label: "Users", to: "/users" },
];

export function AppFooter() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (to: string) => {
    if (location.pathname === to) return;
    navigate(to);
  };

  return (
    <FooterShell>
      <div className="container">
        <FooterInner>
          <Left>
            <Space orientation="vertical" size={4}>
              <Brand onClick={() => handleNavigate("/")}>WorklyHub</Brand>
              <Typography.Text
                type="secondary"
                style={{ fontSize: "var(--font-size-sm)" }}
              >
                Business management for modern teams.
              </Typography.Text>
            </Space>
          </Left>

          <Right>
            <LinksRow>
              {links.map((item) => (
                <FooterLink
                  key={item.to}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleNavigate(item.to)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ")
                      handleNavigate(item.to);
                  }}
                >
                  {item.label}
                </FooterLink>
              ))}
            </LinksRow>

            <Divider style={{ margin: "var(--space-3) 0" }} />

            <Typography.Text
              type="secondary"
              style={{ fontSize: "var(--font-size-sm)" }}
            >
              © {new Date().getFullYear()} WorklyHub. All rights reserved.
            </Typography.Text>
          </Right>
        </FooterInner>
      </div>
    </FooterShell>
  );
}
