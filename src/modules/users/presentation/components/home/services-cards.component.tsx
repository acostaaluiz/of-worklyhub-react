import React from "react";
import { Card, Row, Col } from "antd";
import { useNavigate } from "react-router-dom";

type ServiceItem = { id: string; title: string; subtitle?: string; icon?: React.ReactNode };

type Props = {
  services: ServiceItem[];
};

export default function ServicesCards({ services }: Props) {
  const navigate = useNavigate();

  const resolvePath = (s: ServiceItem) => {
    const id = (s.id ?? "").toString().toLowerCase();
    const title = (s.title ?? "").toString().toLowerCase();
    const key = id || title;

    if (key.includes("client")) return "/clients";
    if (key.includes("finance") || key.includes("payment") || key.includes("billing")) return "/finance";
    if (key.includes("schedule") || key.includes("calendar")) return "/schedule";
    if (key.includes("service") || key.includes("services") || key.includes("catalog")) return "/company/services";
    if (key.includes("inventory") || key.includes("stock")) return "/inventory";
    if (key.includes("people") || key.includes("team") || key.includes("staff")) return "/people";
    if (key.includes("users") || key.includes("profile")) return "/users";
    if (key.includes("billing") || key.includes("plan")) return "/billing/plans";

    // fallback to app home
    return "/home";
  };
  return (
    <Row gutter={[16, 16]}>
      {services.map((s) => {
        const path = resolvePath(s);
        return (
          <Col key={s.id} xs={24} sm={12} md={8} lg={6}>
            <Card
              hoverable
              bodyStyle={{ padding: 12 }}
              style={{ borderRadius: 12, cursor: "pointer" }}
              onClick={() => navigate(path)}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--color-surface-2)", borderRadius: 8 }}>
                  {s.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>{s.title}</div>
                  <div style={{ color: "var(--color-text-muted)", fontSize: 12 }}>{s.subtitle}</div>
                </div>
              </div>
            </Card>
          </Col>
        );
      })}
    </Row>
  );
}
