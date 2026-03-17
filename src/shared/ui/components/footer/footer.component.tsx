import { Divider, Space, Typography } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { ofConsultingLogoUrl, worklyHubLogoUrl } from "@shared/assets/brand";
import { Svg } from "@shared/ui/components/svg/svg.component";
import {
  FooterShell,
  FooterInner,
  Left,
  Brand,
  Right,
  LinksRow,
  FooterLink,
  FooterMetaRow,
  AttributionRow,
  AttributionLink,
  AttributionBrand,
  AttributionLabel,
} from "./footer.component.styles";

type FooterLinkItem = {
  key: string;
  to: string;
};

const links: FooterLinkItem[] = [
  { key: "companySetup", to: "/company/introduction" },
  { key: "billing", to: "/billing/landing" },
  { key: "users", to: "/users" },
  { key: "terms", to: "/terms" },
  { key: "privacy", to: "/privacy" },
];

export function AppFooter() {
  const { t } = useTranslation();
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
              <Brand onClick={() => handleNavigate("/")}>
                <Svg src={worklyHubLogoUrl} alt="WorklyHub" size={28} className="brand-logo" />
                <span>WorklyHub</span>
              </Brand>
              <Typography.Text
                type="secondary"
                style={{ fontSize: "var(--font-size-sm)" }}
              >
                {t("layout.footer.tagline")}
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
                    if (e.key === "Enter" || e.key === " ") {
                      handleNavigate(item.to);
                    }
                  }}
                >
                  {t(`layout.footer.links.${item.key}`)}
                </FooterLink>
              ))}
            </LinksRow>

            <Divider style={{ margin: "var(--space-3) 0", width: "100%" }} />

            <FooterMetaRow>
              <Typography.Text
                type="secondary"
                style={{ fontSize: "var(--font-size-sm)" }}
              >
                {t("layout.footer.copyright", { year: new Date().getFullYear() })}
              </Typography.Text>

              <AttributionRow>
                <AttributionLabel type="secondary">{t("layout.footer.developedBy")}</AttributionLabel>
                <AttributionLink
                  href="https://ofconsulting.com.br/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t("layout.footer.ofConsultingAriaLabel")}
                >
                  <AttributionBrand>
                    <Svg
                      src={ofConsultingLogoUrl}
                      alt="O.F. Consulting"
                      className="of-logo"
                    />
                    <span>O.F. Consulting</span>
                  </AttributionBrand>
                </AttributionLink>
              </AttributionRow>
            </FooterMetaRow>
          </Right>
        </FooterInner>
      </div>
    </FooterShell>
  );
}
